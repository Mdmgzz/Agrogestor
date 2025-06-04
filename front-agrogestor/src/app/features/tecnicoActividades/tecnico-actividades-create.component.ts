import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule, NgForm }  from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of }         from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { ActividadService }     from '../../core/services/actividad.service';
import { ParcelaService, Parcela }   from '../../core/services/parcela.service';
import { CultivoService, Cultivo }   from '../../core/services/cultivo.service';
import { AuthService, Usuario }      from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-actividades-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-actividades-create.component.html',
})
export class TecnicoActividadesCreateComponent implements OnInit {
  tecnico?: Usuario;

  // Listas para desplegables
  parcelas:    Parcela[]  = [];
  cultivosAll: Cultivo[] = [];

  parcelasFiltradas: Parcela[]  = [];
  cultivosFiltrados: Cultivo[]  = [];

  // Campos del formulario
  parcelaId?:       number;
  cultivoId?:       number;
  tipo_actividad = '';
  fecha_actividad?: string;
  detalles = '';

  // ► COMPONENTE DE MULTI‐ARCHIVOS
  selectedFiles: File[]     = [];
  pdfError:      string | null = null;

  // Estados UI
  loading = false;
  error:   string | null = null;

  constructor(
    private authSvc:    AuthService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService,
    private actSvc:     ActividadService,
    private router:     Router
  ) {}

  ngOnInit(): void {
    // 1) Verificar técnico autenticado
    this.authSvc.me().subscribe({
      next: user => {
        this.tecnico = user;
        this.loadParcelasYCultivos();
      },
      error: () => {
        this.error = 'No se pudo verificar el usuario.';
      }
    });
  }

  private loadParcelasYCultivos(): void {
    if (!this.tecnico) return;

    // Traer solo parcelas del técnico actual
    this.parcelaSvc.getAll().pipe(
      catchError(() => of([] as Parcela[]))
    ).subscribe(list => {
      this.parcelas = list.filter(p => p.usuario_id === this.tecnico!.id);
      this.parcelasFiltradas = [...this.parcelas];
    });

    // Traer todos los cultivos (filtrados luego)
    this.cultivoSvc.getAll().pipe(
      catchError(() => of([] as Cultivo[]))
    ).subscribe(list => {
      this.cultivosAll = list;
    });
  }

  onParcelaChange(): void {
    this.cultivoId = undefined;
    if (!this.parcelaId) {
      this.cultivosFiltrados = [];
      return;
    }
    this.cultivosFiltrados = this.cultivosAll.filter(
      c => c.parcela_id === this.parcelaId
    );
  }

  /**
   * Se dispara al escoger uno o varios PDFs.
   * Acumula en selectedFiles sin reemplazar lo anterior.
   */
  onFilesSelected(event: Event): void {
    this.pdfError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const nuevos: File[] = Array.from(input.files);
    for (const f of nuevos) {
      if (f.type !== 'application/pdf') {
        this.pdfError = 'Solo se permiten archivos en formato PDF.';
        return;
      }
    }

    // Acumular sin reemplazar
    this.selectedFiles = this.selectedFiles.concat(nuevos);
    input.value = '';
  }

  /**
   * Elimina un PDF de la lista antes de enviar.
   */
  quitarArchivo(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  crearActividad(form: NgForm): void {
    if (
      form.invalid ||
      !this.tecnico ||
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

    // 🗂️ Preparo FormData (igual que en admin)
    const formData = new FormData();
    formData.append('usuario_id',      this.tecnico.id.toString());
    formData.append('cultivo_id',      this.cultivoId.toString());
    formData.append('tipo_actividad',  this.tipo_actividad);
    formData.append('fecha_actividad', this.fecha_actividad);
    formData.append('detalles',        JSON.stringify({ texto: this.detalles }));

    // Adjuntar cada PDF con su nombre original
    for (const f of this.selectedFiles) {
      formData.append('adjuntos[]', f, f.name);
    }

    // Llamo a createConAdjuntos (multipart)
    this.actSvc.createConAdjuntos(formData).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/actividades']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al crear la actividad.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/tecnico/actividades']);
  }
}
