import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of }        from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { ActividadService }   from '../../core/services/actividad.service';
import { UserService, Usuario }      from '../../core/services/user.service';
import { ParcelaService, Parcela }   from '../../core/services/parcela.service';
import { CultivoService, Cultivo }   from '../../core/services/cultivo.service';

@Component({
  standalone: true,
  selector: 'app-admin-actividades-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-actividades-create.component.html',
})
export class AdminActividadesCreateComponent implements OnInit {
  // Listas para los <select>
  usuarios:    Usuario[] = [];
  parcelas:    Parcela[] = [];
  cultivosAll: Cultivo[] = [];

  parcelasFiltradas: Parcela[] = [];
  cultivosFiltrados:   Cultivo[] = [];

  // Campos del formulario
  usuarioId?:  number;
  parcelaId?:  number;
  cultivoId?:  number;
  tipo_actividad = '';
  fecha_actividad?: string;
  detallesTexto = '';

  // ► Nuevo: lista acumulada de archivos seleccionados
  selectedFiles: File[] = [];
  pdfError: string | null = null;

  // Estados UI
  saving = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private actSvc: ActividadService,
    private usuarioSvc: UserService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService
  ) {}

  ngOnInit(): void {
    // Cargo usuarios, parcelas y cultivos para los dropdowns
    forkJoin({
      usuarios: this.usuarioSvc.getAll().pipe(catchError(() => of([] as Usuario[]))),
      parcelas: this.parcelaSvc.getAll().pipe(catchError(() => of([] as Parcela[]))),
      cultivos: this.cultivoSvc.getAll().pipe(catchError(() => of([] as Cultivo[]))),
    }).subscribe(({ usuarios, parcelas, cultivos }) => {
      this.usuarios    = usuarios;
      this.parcelas    = parcelas;
      this.cultivosAll = cultivos;
    });
  }

  onUserChange(): void {
    this.parcelaId = undefined;
    this.cultivoId = undefined;
    this.parcelasFiltradas = this.parcelas.filter(
      p => p.usuario_id === this.usuarioId
    );
    this.cultivosFiltrados = [];
  }

  onParcelaChange(): void {
    this.cultivoId = undefined;
    this.cultivosFiltrados = this.cultivosAll.filter(
      c => c.parcela_id === this.parcelaId
    );
  }

  /**
   * Se dispara cuando el usuario selecciona uno o varios archivos nuevos.
   * En lugar de reemplazar `selectedFiles`, los acumulamos en el array.
   */
  onFilesSelected(event: Event): void {
    this.pdfError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const nuevos: File[] = Array.from(input.files);

    // Validar cada archivo: sólo PDF
    for (const f of nuevos) {
      if (f.type !== 'application/pdf') {
        this.pdfError = 'Solo se permiten archivos PDF.';
        return;
      }
    }

    // Acumular: añadir los nuevos (sin reemplazar los anteriores)
    this.selectedFiles = this.selectedFiles.concat(nuevos);

    // Limpiar el input para permitir reabrir el selector más adelante
    input.value = '';
  }

  /**
   * Elimina de la lista de `selectedFiles` el archivo en la posición dada.
   * Así el usuario puede quitar uno antes de enviar.
   */
  quitarArchivo(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  crearActividad(form: NgForm): void {
    if (
      form.invalid ||
      !this.usuarioId ||
      !this.parcelaId ||
      !this.cultivoId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios antes de continuar.';
      return;
    }

    this.saving = true;
    this.error = null;

    const formData = new FormData();
    formData.append('usuario_id', this.usuarioId.toString());
    formData.append('cultivo_id', this.cultivoId.toString());
    formData.append('tipo_actividad', this.tipo_actividad);
    formData.append('fecha_actividad', this.fecha_actividad);
    formData.append('detalles', JSON.stringify({ texto: this.detallesTexto }));

    // Adjuntar cada PDF con el nombre original
    for (const f of this.selectedFiles) {
      formData.append('adjuntos[]', f, f.name);
    }

    this.actSvc.createConAdjuntos(formData).pipe(
      finalize(() => (this.saving = false))
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/admin/actividades']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al crear la actividad.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/admin/actividades']);
  }
}
