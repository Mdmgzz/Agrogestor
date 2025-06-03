// src/app/features/tecnicoCultivo/tecnico-cultivo.component.ts

import { Component, OnInit }                    from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { Router, RouterModule }                 from '@angular/router';
import { CultivoService, Cultivo }              from '../../core/services/cultivo.service';

interface CultivoConParcela extends Cultivo {
  parcela: {
    id: number;
    nombre: string;
    propietario: string;
    usuario_id: number; // <— agregado para coincidir con ParcelaMin
  };
}

@Component({
  standalone: true,
  selector: 'app-tecnico-cultivos',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tecnico-cultivo.component.html',
})
export class TecnicoCultivosComponent implements OnInit {
  cultivosAll: CultivoConParcela[] = [];
  groupKeys:    string[] = [];
  grouped:      Record<string, CultivoConParcela[]> = {};

  loading = true;
  error:   string | null = null;

  // filtros
  searchTerm = '';
  startDate  = '';
  endDate    = '';

  constructor(
    private svc:    CultivoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        // data viene con parcela cargada en backend
        this.cultivosAll = (data as CultivoConParcela[]);
        this.processGrouping();
        this.loading = false;
      },
      error: () => {
        this.error   = 'Error al cargar cultivos';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.processGrouping();
  }

  private processGrouping() {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = this.cultivosAll.filter(c => {
      if (term && !c.variedad.toLowerCase().includes(term)) return false;
      if (this.startDate && c.fecha_siembra < this.startDate)    return false;
      if (this.endDate   && c.fecha_siembra > this.endDate)      return false;
      return true;
    });

    const groups: Record<string, CultivoConParcela[]> = {};
    for (const c of filtered) {
      const key = `${c.parcela.nombre} — ${c.parcela.propietario}`;
      (groups[key] ??= []).push(c);
    }

    this.groupKeys = Object.keys(groups);
    this.grouped   = groups;
  }

  crearCultivo() {
    this.router.navigate(['/dashboard/tecnico/cultivos/create']);
  }

  editarCultivo(id: number) {
    // Redirige al detalle que permite editar
    this.router.navigate([`/dashboard/tecnico/cultivos/${id}`]);
  }

  eliminarCultivo(id: number) {
    if (!confirm('¿Eliminar este cultivo?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.cultivosAll = this.cultivosAll.filter(c => c.id !== id);
        this.processGrouping();
      },
      error: () => alert('Error al eliminar cultivo')
    });
  }
}
