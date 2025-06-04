import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule }                            from '@angular/common';
import { FormsModule, NgForm }                     from '@angular/forms';
import { RouterModule, ActivatedRoute, Router }    from '@angular/router';
import { forkJoin, of }                            from 'rxjs';
import { catchError, finalize }                    from 'rxjs/operators';

import { ActividadService, Actividad }             from '../../core/services/actividad.service';
import { AdjuntoService }                          from '../../core/services/adjunto.service';
import { UserService, Usuario }                    from '../../core/services/user.service';
import { ParcelaService, Parcela }                 from '../../core/services/parcela.service';
import { CultivoService, Cultivo }                 from '../../core/services/cultivo.service';
import { environment }                             from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-admin-actividades-detail',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './actividad-detail.component.html',
})
export class ActividadDetailComponent implements OnInit {
  actividad?: Actividad;
  loading = true;
  error: string | null = null;

  // Listas completas
  usuarios:    Usuario[] = [];
  parcelas:    Parcela[] = [];
  cultivosAll: Cultivo[] = [];

  // Para los <select> filtrados
  parcelasFiltradas: Parcela[] = [];
  cultivosFiltrados:  Cultivo[]  = [];

  // Campos “model” para bindear al formulario
  usuarioId?:  number;
  parcelaId?:  number;
  cultivoId?:  number;
  tipo_actividad = '';
  fecha_actividad?: string;

  // Detalles (texto plano)
  detallesTexto = '';

  // ► Estado para deshabilitar botón "Guardar Actividad"
  savingActividad = false;

  // ► Para manejar el PDF seleccionado
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedPdf?: File;
  pdfError: string | null = null;
  uploadingPdf = false;

  // ► Lista de adjuntos ya guardados en el servidor
  adjuntos: { id: number; ruta_archivo: string }[] = [];

  private actividadId!: number;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private actSvc: ActividadService,
    private adjSvc: AdjuntoService,
    private usuarioSvc: UserService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;

    // 1) Extraer ID de la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/admin/actividades']);
      return;
    }
    this.actividadId = +idParam;

    // 2) Cargar en paralelo: usuarios, parcelas, cultivos, actividad y lista de adjuntos
    forkJoin({
      usuarios: this.usuarioSvc.getAll().pipe(catchError(() => of([] as Usuario[]))),
      parcelas: this.parcelaSvc.getAll().pipe(catchError(() => of([] as Parcela[]))),
      cultivos: this.cultivoSvc.getAll().pipe(catchError(() => of([] as Cultivo[]))),
      actividad: this.actSvc.getById(this.actividadId).pipe(
        catchError(err => of(null as Actividad | null))
      ),
      adjuntos: this.adjSvc.list(this.actividadId).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ usuarios, parcelas, cultivos, actividad, adjuntos }) => {
        this.usuarios    = usuarios;
        this.parcelas    = parcelas;
        this.cultivosAll = cultivos;
        this.adjuntos    = adjuntos;

        if (!actividad) {
          this.error = 'Actividad no encontrada o sin permisos.';
          return;
        }

        // Llenar datos de la actividad
        this.actividad = actividad;
        this.usuarioId       = actividad.usuario_id;
        this.parcelaId       = actividad.cultivo?.parcela?.id ?? undefined;
        this.cultivoId       = actividad.cultivo_id;
        this.tipo_actividad  = actividad.tipo_actividad;
        this.fecha_actividad = actividad.fecha_actividad;

        // Extraer “texto” desde actividad.detalles
        try {
          const obj = typeof actividad.detalles === 'string'
            ? JSON.parse(actividad.detalles)
            : actividad.detalles;
          this.detallesTexto = obj?.texto ?? '';
        } catch {
          this.detallesTexto = '';
        }

        this.parcelasFiltradas = this.parcelas.filter(
          p => p.usuario_id === this.usuarioId
        );
        this.cultivosFiltrados  = this.cultivosAll.filter(
          c => c.parcela_id === this.parcelaId
        );
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
      }
    });
  }

  // Cuando el usuario cambia, filtramos parcelas
  onUserChange(): void {
    this.parcelaId = undefined;
    this.cultivoId = undefined;
    this.parcelasFiltradas = this.parcelas.filter(
      p => p.usuario_id === this.usuarioId
    );
    this.cultivosFiltrados  = [];
  }

  // Cuando la parcela cambia, filtramos cultivos
  onParcelaChange(): void {
    this.cultivoId = undefined;
    this.cultivosFiltrados = this.cultivosAll.filter(
      c => c.parcela_id === this.parcelaId
    );
  }

  // ► Se dispara al elegir un solo PDF (para subir)
  onPdfSelected(event: Event): void {
    this.pdfError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedPdf = undefined;
      return;
    }
    const file = input.files[0];
    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      this.pdfError = 'Solo se permiten archivos PDF.';
      this.selectedPdf = undefined;
      return;
    }
    this.selectedPdf = file;
  }

  // ► Guardar solo campos de la actividad (sin adjuntos nuevos)
  guardarActividad(form: NgForm): void {
    if (
      form.invalid ||
      !this.usuarioId ||
      !this.parcelaId ||
      !this.cultivoId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios antes de guardar.';
      return;
    }

    this.savingActividad = true;
    this.error = null;

    const payload: Partial<Actividad> = {
      usuario_id:      this.usuarioId,
      cultivo_id:      this.cultivoId,
      tipo_actividad:  this.tipo_actividad,
      fecha_actividad: this.fecha_actividad,
      detalles:        JSON.stringify({ texto: this.detallesTexto })
    };

    this.actSvc.update(this.actividadId, payload).pipe(
      finalize(() => this.savingActividad = false)
    ).subscribe({
      next: updated => {
        this.actividad = updated;
        // Tras actualizar, recargamos lista de adjuntos
        this.refrescarAdjuntos();
      },
      error: err => {
        this.error = err.error?.message || 'Error al guardar la actividad.';
      }
    });
  }

  // ► Subir el PDF seleccionado (solo uno) usando AdjuntoService
  subirPdf(): void {
    if (!this.selectedPdf) {
      this.pdfError = 'Selecciona primero un PDF.';
      return;
    }

    this.uploadingPdf = true;
    this.pdfError = null;

    // Convertimos selectedPdf en FileList para usar AdjuntoService.upload()
    const dt = new DataTransfer();
    dt.items.add(this.selectedPdf);
    const fileList = dt.files;

    this.adjSvc.upload(this.actividadId, fileList).pipe(
      finalize(() => this.uploadingPdf = false)
    ).subscribe({
      next: nuevosAdjuntos => {
        // Limpiar el input y recargar la lista
        this.selectedPdf = undefined;
        this.fileInput.nativeElement.value = '';
        this.refrescarAdjuntos();
      },
      error: err => {
        this.pdfError = err.error?.message || 'Error subiendo el PDF.';
      }
    });
  }

  // ► Recargar la lista de adjuntos
  private refrescarAdjuntos(): void {
    this.adjSvc.list(this.actividadId).subscribe({
      next: lista => {
        this.adjuntos = lista;
      },
      error: () => {
        // Si falla, no bloqueamos UI 
      }
    });
  }

  // ► Borrar un adjunto específico
  borrarAdjunto(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este adjunto?')) {
      return;
    }
    this.adjSvc.delete(id).subscribe({
      next: () => {
        this.refrescarAdjuntos();
      },
      error: () => {
        alert('Error al eliminar el adjunto.');
      }
    });
  }

  eliminarActividad(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }
    this.actSvc.delete(this.actividadId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/admin/actividades']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar la actividad.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/admin/actividades']);
  }

  /** Genera la URL pública para descargar/abrir el adjunto */
  getAdjuntoUrl(ruta: string): string {
    // Se abre directamente en el navegador
    return `${environment.apiUrl}/storage/${ruta}`;
  }
}
