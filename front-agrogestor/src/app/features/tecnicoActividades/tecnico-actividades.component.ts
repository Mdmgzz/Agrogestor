// src/app/features/tecnicoActividades/tecnico-actividades.component.ts
import { Component, OnInit }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { FormsModule }                 from '@angular/forms';
import { RouterModule }                from '@angular/router';
import { forkJoin, of }                from 'rxjs';
import { catchError }                  from 'rxjs/operators';

import { ActividadService, Actividad } from '../../core/services/actividad.service';
import { AuthService, Usuario }        from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-actividades',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-actividades.component.html',
})
export class TecnicoActividadesComponent implements OnInit {
  actividades: Actividad[] = [];
  filtered:    Actividad[] = [];

  loading = true;
  error:   string | null = null;

  // filtros
  searchTerm = '';
  startDate  = '';
  endDate    = '';

  private tecnicoActual?: Usuario;

  constructor(
    private svc:    ActividadService,
    private auth:   AuthService
  ) {}

  ngOnInit() {
    // Obtener técnico autenticado
    this.auth.me().subscribe({
      next: user => {
        this.tecnicoActual = user;
        this.loadActividades();
      },
      error: () => {
        this.error = 'No se pudo verificar el usuario.';
        this.loading = false;
      }
    });
  }

  private loadActividades() {
    this.svc.getAll().pipe(
      catchError(() => of([] as Actividad[]))
    ).subscribe(data => {
      if (!this.tecnicoActual) {
        this.actividades = [];
      } else {
        // Filtrar solo aquellas actividades asignadas a este técnico
        this.actividades = data.filter(a => a.usuario_id === this.tecnicoActual!.id);
      }
      this.applyFilters();
      this.loading = false;
    }, () => {
      this.error = 'Error al cargar las actividades';
      this.loading = false;
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

  /**
   * Devuelve el campo `texto` dentro de `detalles`.
   * `detalles` puede llegar como JSON-string o como objeto ya parseado.
   */
  getTexto(detalles: any): string {
    if (!detalles) {
      return '';
    }
    try {
      const obj = typeof detalles === 'string' ? JSON.parse(detalles) : detalles;
      return obj?.texto ?? '';
    } catch {
      return '';
    }
  }
}
