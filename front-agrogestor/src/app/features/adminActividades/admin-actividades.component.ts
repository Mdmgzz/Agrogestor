// src/app/features/actividades/admin-actividades.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService, Actividad } from '../../core/services/actividad.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-actividades',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-actividades.component.html',
})
export class AdminActividadesComponent implements OnInit {
  actividadesAll: Actividad[] = [];
  actividades: Actividad[] = [];

  loading = true;
  error: string | null = null;

  // Filtros
  searchTerm = '';
  startDate = '';
  endDate = '';

  constructor(
    private svc: ActividadService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.actividadesAll = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las actividades';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    this.actividades = this.actividadesAll
      .filter(a => {
        // filtro por tipo de actividad
        if (term && !a.tipo_actividad.toLowerCase().includes(term)) {
          return false;
        }
        // filtro por fecha
        if (this.startDate && a.fecha_actividad < this.startDate) {
          return false;
        }
        if (this.endDate && a.fecha_actividad > this.endDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.fecha_actividad.localeCompare(b.fecha_actividad));
  }

  crearActividad() {
    this.router.navigate(['/dashboard/actividades/new']);
  }

  editarActividad(id: number) {
    this.router.navigate([`/dashboard/actividades/${id}/edit`]);
  }

  eliminarActividad(id: number) {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.actividadesAll = this.actividadesAll.filter(a => a.id !== id);
        this.applyFilters();
      },
      error: () => alert('Error al eliminar actividad')
    });
  }
}
