// src/app/features/tecnicoActividades/tecnico-actividad-detalle.component.ts

import { Component, OnInit }                 from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { FormsModule, NgForm }               from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of }                      from 'rxjs';
import { catchError, finalize }              from 'rxjs/operators';

import { ActividadService, Actividad }       from '../../core/services/actividad.service';
import { AdjuntoService, Adjunto }           from '../../core/services/adjunto.service';
import { CultivoService, Cultivo }           from '../../core/services/cultivo.service';
import { ParcelaService, Parcela }           from '../../core/services/parcela.service';
import { AuthService, Usuario }              from '../../core/services/auth.service';
import { environment }                       from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-tecnico-actividad-detalle',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-actividad-detalle.component.html',
})
export class TecnicoActividadDetalleComponent implements OnInit {
  actividad?: Actividad;
  cultivo?:    Cultivo;
  parcela?:    Parcela;

  // Listas completas para dropdowns
  parcelas:    Parcela[]  = [];
  cultivosAll: Cultivo[]  = [];

  // Para filtrar los <select>
  parcelasFiltradas: Parcela[] = [];
  cultivosFiltrados:  Cultivo[] = [];

  loading = true;
  error: string | null = null;

  // Campos “model”
  parcelaId?:       number;
  cultivoId?:       number;
  tipo_actividad = '';
  fecha_actividad?: string;
  detallesTexto = '';

  // ► Adjuntos
  selectedPdf?: File;
  pdfError: string | null = null;
  uploadingPdf = false;
  adjuntos: Adjunto[] = [];

  private actividadId!: number;
  private tecnicoActual?: Usuario;

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private actSvc:      ActividadService,
    private adjSvc:      AdjuntoService,
    private cultivoSvc:  CultivoService,
    private parcelaSvc:  ParcelaService,
    private authSvc:     AuthService
  ) {}

  ngOnInit(): void {
    // 1) Obtener ID de la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/tecnico/actividades']);
      return;
    }
    this.actividadId = +idParam;

    // 2) Verificar técnico autenticado, luego cargar datos
    this.authSvc.me().subscribe({
      next: user => {
        this.tecnicoActual = user;
        this.loadParcelasYCultivos();   // carga dropdowns
        this.loadActividadYAdjuntos();  // carga actividad + adjuntos
      },
      error: () => {
        this.error = 'No se pudo verificar el usuario.';
        this.loading = false;
      }
    });
  }

  private loadParcelasYCultivos(): void {
    if (!this.tecnicoActual) return;
    // Traer todas las parcelas y luego filtrar por técnico
    this.parcelaSvc.getAll().pipe(
      catchError(() => of([] as Parcela[]))
    ).subscribe(list => {
      this.parcelas         = list.filter(p => p.usuario_id === this.tecnicoActual!.id);
      this.parcelasFiltradas = [...this.parcelas];
    });

    // Traer todos los cultivos (se filtrarán más tarde según parcela)
    this.cultivoSvc.getAll().pipe(
      catchError(() => of([] as Cultivo[]))
    ).subscribe(list => {
      this.cultivosAll = list;
    });
  }

  private loadActividadYAdjuntos(): void {
    // Carga en paralelo actividad y adjuntos
    forkJoin({
      actividad: this.actSvc.getById(this.actividadId).pipe(
        catchError(() => of(null as Actividad | null))
      ),
      adjuntos: this.adjSvc.list(this.actividadId).pipe(
        catchError(() => of([] as Adjunto[]))
      )
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ actividad, adjuntos }) => {
        if (!actividad) {
          this.error = 'Actividad no encontrada o sin permisos.';
          return;
        }

        this.actividad       = actividad;
        this.tipo_actividad  = actividad.tipo_actividad;
        this.fecha_actividad = actividad.fecha_actividad;
        this.adjuntos        = adjuntos;

        // Extraer detalles JSON → texto
        try {
          const detObj = typeof actividad.detalles === 'string'
            ? JSON.parse(actividad.detalles)
            : actividad.detalles;
          this.detallesTexto = detObj?.texto ?? '';
        } catch {
          this.detallesTexto = '';
        }

        // Inyectar los valores iniciales de parcelaId y cultivoId
        if (actividad.cultivo) {
          this.cultivoId = actividad.cultivo.id;
          this.parcelaId = actividad.cultivo.parcela?.id;
        } else {
          this.cultivoId = actividad.cultivo_id;
          // Buscamos el cultivo completo para saber la parcela
          this.cultivoSvc.getById(actividad.cultivo_id).pipe(
            catchError(() => of(null as Cultivo | null))
          ).subscribe(c => {
            if (c) {
              this.cultivo = c;
              this.parcelaId = c.parcela_id;
            }
          });
        }

        // Filtrar cultivos para el dropdown, según parcela inicial
        if (this.parcelaId) {
          this.cultivosFiltrados = this.cultivosAll.filter(c => c.parcela_id === this.parcelaId);
        }

        // También cargar cultivo y parcela para mostrar lectura
        if (actividad.cultivo_id) {
          this.cultivoSvc.getById(actividad.cultivo_id).pipe(
            catchError(() => of(null as Cultivo | null))
          ).subscribe(c => {
            if (c) {
              this.cultivo = c;
              this.parcelaSvc.getById(c.parcela_id).pipe(
                catchError(() => of(null as Parcela | null))
              ).subscribe(p => {
                this.parcela = p || undefined;
              });
            }
          });
        }
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/tecnico/actividades']);
  }

  onParcelaChange(): void {
    this.cultivoId = undefined;
    if (!this.parcelaId) {
      this.cultivosFiltrados = [];
      return;
    }
    this.cultivosFiltrados = this.cultivosAll.filter(c => c.parcela_id === this.parcelaId);
  }

  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.parcelaId ||
      !this.cultivoId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error   = null;

    const payload: Partial<Actividad> = {
      cultivo_id:      this.cultivoId,
      tipo_actividad:  this.tipo_actividad,
      fecha_actividad: this.fecha_actividad,
      detalles:        JSON.stringify({ texto: this.detallesTexto })
    };

    this.actSvc.update(this.actividadId, payload).subscribe({
      next: () => {
        // Recargar todo (incluye adjuntos)
        this.loadActividadYAdjuntos();
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Error al guardar la actividad.';
      }
    });
  }

  eliminarActividad(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }
    this.actSvc.delete(this.actividadId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/actividades']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar la actividad.');
      }
    });
  }

  /** Maneja selección de un PDF individual */
  onPdfSelected(event: Event): void {
    this.pdfError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedPdf = undefined;
      return;
    }
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.pdfError = 'Solo se permiten archivos PDF.';
      this.selectedPdf = undefined;
      return;
    }
    this.selectedPdf = file;
  }

  /** Sube el PDF seleccionado */
  subirPdf(): void {
    if (!this.selectedPdf) {
      this.pdfError = 'Selecciona primero un PDF.';
      return;
    }

    this.uploadingPdf = true;
    this.pdfError     = null;

    // Convertir selectedPdf a FileList
    const dt = new DataTransfer();
    dt.items.add(this.selectedPdf);
    const fileList = dt.files;

    this.adjSvc.upload(this.actividadId, fileList).pipe(
      finalize(() => this.uploadingPdf = false)
    ).subscribe({
      next: nuevosAdjuntos => {
        this.selectedPdf = undefined;
        // Limpiar el campo <input>
        const inputEl = document.getElementById('pdfInput') as HTMLInputElement;
        if (inputEl) {
          inputEl.value = '';
        }
        this.refrescarAdjuntos();
      },
      error: err => {
        this.pdfError = err.error?.message || 'Error subiendo el PDF.';
      }
    });
  }

  /** Recarga la lista de adjuntos */
  private refrescarAdjuntos(): void {
    this.adjSvc.list(this.actividadId).subscribe({
      next: lista => {
        this.adjuntos = lista;
      },
      error: () => { /* no bloqueamos la UI si falla */ }
    });
  }

  /** Borra un adjunto existente */
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

  /** URL pública para visualizar el PDF */
  getAdjuntoUrl(ruta: string): string {
    return `${environment.apiUrl}/storage/${ruta}`;
  }
}
