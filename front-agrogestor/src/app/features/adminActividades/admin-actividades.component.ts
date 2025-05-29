// src/app/features/actividades/admin-actividades.component.ts
import { Component, OnInit }                    from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { Router, RouterModule }                 from '@angular/router';
import { ActividadService, Actividad }          from '../../core/services/actividad.service';

@Component({
  standalone: true,
  selector: 'app-admin-actividades',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-actividades.component.html',
})
export class AdminActividadesComponent implements OnInit {
  actividades: Actividad[] = [];
  filtered:    Actividad[] = [];

  loading = true;
  error:   string | null = null;

  // filtros
  searchTerm = '';
  startDate  = '';
  endDate    = '';

  constructor(
    private svc:    ActividadService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.actividades = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error   = 'No se pudieron cargar las actividades';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.actividades
      .filter(a => {
        if (term && !a.tipo_actividad.toLowerCase().includes(term)) return false;
        if (this.startDate && a.fecha_actividad < this.startDate) return false;
        if (this.endDate   && a.fecha_actividad > this.endDate)   return false;
        return true;
      })
      .sort((a, b) => a.fecha_actividad.localeCompare(b.fecha_actividad));
  }

  crearActividad() {
    this.router.navigate(['/dashboard/admin/actividades/create']);
  }

  editarActividad(id: number) {
    this.router.navigate(['/dashboard/admin/actividades', id, 'edit']);
  }

  eliminarActividad(id: number) {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.actividades = this.actividades.filter(a => a.id !== id);
        this.applyFilters();
      },
      error: () => alert('Error al eliminar actividad')
    });
  }
}
