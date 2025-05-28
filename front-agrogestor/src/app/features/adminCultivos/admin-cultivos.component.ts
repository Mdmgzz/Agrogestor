// src/app/features/cultivos/admin-cultivos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CultivoService, Cultivo } from '../../core/services/cultivo.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-cultivos',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-cultivos.component.html',
})
export class AdminCultivosComponent implements OnInit {
  cultivosAll: Cultivo[] = [];
  cultivos: Cultivo[] = [];

  loading = true;
  error: string | null = null;

  // filtros
  searchTerm = '';
  startDate: string = '';
  endDate: string = '';

  constructor(
    private svc: CultivoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.cultivosAll = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los cultivos';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.cultivos = this.cultivosAll
      .filter(c => {
        // búsqueda por variedad
        const term = this.searchTerm.trim().toLowerCase();
        if (term && !c.variedad.toLowerCase().includes(term)) {
          return false;
        }
        // filtro por fecha
        if (this.startDate && c.fecha_siembra < this.startDate) {
          return false;
        }
        if (this.endDate && c.fecha_siembra > this.endDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.variedad.localeCompare(b.variedad));
  }

  crearCultivo() {
    this.router.navigate(['/dashboard/cultivos/new']);
  }

  editarCultivo(id: number) {
    this.router.navigate([`/dashboard/cultivos/${id}/edit`]);
  }

  eliminarCultivo(id: number) {
    if (!confirm('¿Eliminar este cultivo?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.cultivosAll = this.cultivosAll.filter(c => c.id !== id);
        this.applyFilters();
      },
      error: () => alert('Error al eliminar cultivo')
    });
  }
}
