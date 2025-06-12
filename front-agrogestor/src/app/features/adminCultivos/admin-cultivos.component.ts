// src/app/features/adminCultivos/admin-cultivos.component.ts

import { Component, OnInit }                    from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CultivoService, Cultivo }              from '../../core/services/cultivo.service';

// Usuario mínimo que viene en parcela.usuario
interface UsuarioMin {
  id: number;
  nombre: string;
  apellidos: string;
}

// Parcela con el propietario y la relación usuario
interface ParcelaConUsuario {
  id: number;
  nombre: string;
  propietario: string;
  usuario_id: number;
  usuario?: UsuarioMin;
}

// Cultivo enriquecido con esa parcela
export interface CultivoConParcela extends Cultivo {
  parcela: ParcelaConUsuario;
}

@Component({
  standalone: true,
  selector: 'app-admin-cultivos',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-cultivos.component.html',
})
export class AdminCultivosComponent implements OnInit {
  parcelaId?: number;
  cultivosAll: CultivoConParcela[] = [];
  groupKeys:   string[]                         = [];
  grouped:     Record<string, CultivoConParcela[]> = {};

  loading = true;
  error:   string | null = null;

  searchTerm = '';
  startDate  = '';
  endDate    = '';

  constructor(
    private svc:    CultivoService,
    private route:  ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.parcelaId = +idParam;
    }

    this.svc.getAll().subscribe({
      next: data => {
        this.cultivosAll = (data as CultivoConParcela[]).filter(
          c => this.parcelaId == null || c.parcela_id === this.parcelaId
        );
        this.processGrouping();
        this.loading = false;
      },
      error: () => {
        this.error   = 'No se pudieron cargar los cultivos';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.processGrouping();
  }

  private processGrouping() {
    // 1) filtrado
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = this.cultivosAll.filter(c => {
      if (term && !c.variedad.toLowerCase().includes(term))       return false;
      if (this.startDate && c.fecha_siembra < this.startDate)      return false;
      if (this.endDate   && c.fecha_siembra > this.endDate)        return false;
      return true;
    });

    // 2) agrupamos: USER — PARCELA — PROPIETARIO
    const groups: Record<string, CultivoConParcela[]> = {};

    for (const c of filtered) {
      const userName = c.parcela.usuario
        ? `${c.parcela.usuario.nombre} ${c.parcela.usuario.apellidos}`
        : 'Sin usuario';
      const parcelName = c.parcela.nombre;
      const ownerName = c.parcela.propietario;

      const key = `${userName} — ${parcelName} — ${ownerName}`;
      (groups[key] ??= []).push(c);
    }

    this.groupKeys = Object.keys(groups);
    this.grouped  = groups;
  }

  crearCultivo() {
    if (this.parcelaId != null) {
      this.router.navigate([
        '/dashboard/admin/parcelas',
        this.parcelaId,
        'cultivos',
        'create'
      ]);
    } else {
      this.router.navigate(['/dashboard/admin/cultivos/create']);
    }
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

  volverParcela() {
    if (this.parcelaId != null) {
      this.router.navigate(['/dashboard/admin/parcelas', this.parcelaId]);
    } else {
      this.router.navigate(['/dashboard/admin']);
    }
  }
}
