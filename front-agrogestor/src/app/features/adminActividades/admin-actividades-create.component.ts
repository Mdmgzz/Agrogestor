// src/app/features/adminActividades/admin-actividades-create.component.ts
import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule }from '@angular/router';

import { ActividadService }    from '../../core/services/actividad.service';
import { ParcelaService }      from '../../core/services/parcela.service';
import { CultivoService }      from '../../core/services/cultivo.service';
import { UserService }         from '../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-admin-actividades-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-actividades-create.component.html',
})
export class AdminActividadesCreateComponent implements OnInit {
  usuarios: any[]       = [];
  parcelas: any[]       = [];
  cultivosAll: any[]    = [];

  parcelasFiltradas: any[] = [];
  cultivosFiltrados: any[] = [];

  usuarioId?: number;
  parcelaId?: number;
  cultivoId?: number;

  tipo_actividad = '';
  fecha_actividad?: string;
  detalles = '';

  adjuntos: FileList | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private usuarioSvc: UserService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService,
    private actSvc:     ActividadService,
    private router:     Router
  ) {}

  ngOnInit(): void {
    // Cargar usuarios
    this.usuarioSvc.getAll().subscribe({
      next: list => this.usuarios = list,
      error: () => this.error = 'No se pudieron cargar usuarios'
    });

    // Cargar parcelas (todas, luego filtramos por usuario)
    this.parcelaSvc.getAll().subscribe({
      next: list => this.parcelas = list,
      error: () => this.error = 'No se pudieron cargar parcelas'
    });

    // Cargar cultivos (todos, luego filtramos por parcela)
    this.cultivoSvc.getAll().subscribe({
      next: list => this.cultivosAll = list,
      error: () => this.error = 'No se pudieron cargar cultivos'
    });
  }

  onUserChange(): void {
    // Si cambiamos usuario, borramos selecciones previas
    this.parcelaId = undefined;
    this.cultivoId = undefined;
    this.parcelasFiltradas = this.parcelas.filter(
      p => p.usuario_id === this.usuarioId
    );
    this.cultivosFiltrados = [];
  }

  onParcelaChange(): void {
    // Si cambiamos parcela, borramos cultivo y recalculamos cultivos filtrados
    this.cultivoId = undefined;
    this.cultivosFiltrados = this.cultivosAll.filter(
      c => c.parcela_id === this.parcelaId
    );
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.adjuntos = input.files;
    } else {
      this.adjuntos = null;
    }
  }

  crearActividad(form: NgForm): void {
    // Validar campos obligatorios
    if (
      form.invalid ||
      !this.usuarioId ||
      !this.parcelaId ||
      !this.cultivoId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    // Construimos un FormData para enviar adjuntos y campos JSON
    const formData = new FormData();
    formData.append('usuario_id',      this.usuarioId!.toString());
    formData.append('cultivo_id',      this.cultivoId!.toString());
    formData.append('tipo_actividad',  this.tipo_actividad);
    formData.append('fecha_actividad', this.fecha_actividad!);

    // Convertimos “detalles” a JSON válido: { "texto": "lo que haya escrito el usuario" }
    const detallesJson = JSON.stringify({ texto: this.detalles });
    formData.append('detalles', detallesJson);

    // Si hay adjuntos, los agregamos al FormData
    if (this.adjuntos) {
      for (let i = 0; i < this.adjuntos.length; i++) {
        // “adjuntos[]” porque en el backend manejaremos un array de archivos
        formData.append('adjuntos[]', this.adjuntos[i], this.adjuntos[i].name);
      }
    }

    // Llamada al servicio que envía multipart/form-data
    this.actSvc.createConAdjuntos(formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/admin/actividades']);
      },
      error: err => {
        this.loading = false;
        // Si el backend va a devolver validaciones, podemos mostrar err.error.errors
        if (err.status === 422 && err.error?.errors) {
          // Por ejemplo, obtenemos el primer mensaje de validación:
          const mensajes = Object.values(err.error.errors).flat();
          this.error = mensajes.length ? (mensajes[0] as string) : 'Error de validación';
        } else {
          this.error = err.error?.message || 'Error al crear la actividad';
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/admin/actividades']);
  }
}
