// src/app/features/actividades/admin-actividades-create.component.ts
import { Component, OnInit }                     from '@angular/core';
import { CommonModule }                          from '@angular/common';
import { FormsModule, NgForm }                   from '@angular/forms';
import { Router, RouterModule }                  from '@angular/router';
import { ActividadService }                      from '../../core/services/actividad.service';
import { ParcelaService, Parcela }               from '../../core/services/parcela.service';

@Component({
  standalone: true,
  selector: 'app-admin-actividades-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-actividades-create.component.html',
})
export class AdminActividadesCreateComponent implements OnInit {
  parcelas: Parcela[] = [];
  parcelaId?: number;

  tipo_actividad = '';
  fecha_actividad?: string;
  detalles = '';

  loading = false;
  error: string | null = null;

  constructor(
    private actSvc:    ActividadService,
    private parcelaSvc: ParcelaService,
    private router:    Router
  ) {}

  ngOnInit(): void {
    this.parcelaSvc.getAll().subscribe({
      next: list => this.parcelas = list,
      error: () => (this.error = 'No se pudieron cargar parcelas')
    });
  }

  crearActividad(form: NgForm): void {
    if (
      form.invalid ||
      !this.parcelaId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.actSvc.create({
      parcela_id:        this.parcelaId,
      tipo_actividad:    this.tipo_actividad,
      fecha_actividad:   this.fecha_actividad,
      detalles:          this.detalles
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/admin/actividades']);
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
