// src/app/features/actividades/admin-actividades-create.component.ts
import { Component, OnInit }                     from '@angular/core';
import { CommonModule }                          from '@angular/common';
import { FormsModule, NgForm }                   from '@angular/forms';
import { Router, RouterModule }                  from '@angular/router';

import { ActividadService }                      from '../../core/services/actividad.service';
import { ParcelaService, Parcela }               from '../../core/services/parcela.service';
import { CultivoService, Cultivo }               from '../../core/services/cultivo.service';
import { UserService, Usuario }                  from '../../core/services/user.service';
import { AdjuntoService }                        from '../../core/services/adjunto.service';

@Component({
  standalone: true,
  selector: 'app-admin-actividades-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-actividades-create.component.html',
})
export class AdminActividadesCreateComponent implements OnInit {
  usuarios: Usuario[]        = [];
  parcelas: Parcela[]        = [];
  cultivosAll: Cultivo[]     = [];
  parcelasFiltradas: Parcela[] = [];
  cultivosFiltrados: Cultivo[] = [];

  usuarioId?: number;
  parcelaId?: number;
  cultivoId?: number;

  tipo_actividad = '';
  fecha_actividad?: string;
  detalles = '';

  // Para los archivos seleccionados
  selectedFiles?: FileList;

  loading = false;
  error: string | null = null;

  constructor(
    private usuarioSvc: UserService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService,
    private actSvc:     ActividadService,
    private adjuntoSvc: AdjuntoService,
    private router:     Router
  ) {}

  ngOnInit(): void {
    this.usuarioSvc.getAll().subscribe({
      next: list => this.usuarios = list,
      error: () => this.error = 'No se pudieron cargar usuarios'
    });
    this.parcelaSvc.getAll().subscribe({
      next: list => this.parcelas = list,
      error: () => this.error = 'No se pudieron cargar parcelas'
    });
    this.cultivoSvc.getAll().subscribe({
      next: list => this.cultivosAll = list,
      error: () => this.error = 'No se pudieron cargar cultivos'
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

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files || undefined;
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
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.actSvc.create({
      usuario_id:      this.usuarioId,
      cultivo_id:      this.cultivoId,
      tipo_actividad:  this.tipo_actividad,
      fecha_actividad: this.fecha_actividad,
      detalles:        JSON.stringify({ texto: this.detalles })
    }).subscribe({
      next: actividad => {
        // Si hay archivos, los subimos tras crear
        if (this.selectedFiles && this.selectedFiles.length) {
          this.adjuntoSvc.upload(actividad.id, this.selectedFiles).subscribe({
            next: () => this.router.navigate(['/dashboard/admin/actividades']),
            error: () => {
              this.loading = false;
              this.error = 'Actividad creada pero fallo al subir adjuntos.';
            }
          });
        } else {
          this.router.navigate(['/dashboard/admin/actividades']);
        }
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Error al crear la actividad';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/admin/actividades']);
  }
}
