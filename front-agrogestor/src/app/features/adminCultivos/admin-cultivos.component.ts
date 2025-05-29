// src/app/features/cultivos/admin-cultivos.component.ts
import { Component, OnInit }                   from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { FormsModule }                         from '@angular/forms';
import { ActivatedRoute, Router, RouterModule }from '@angular/router';
import { CultivoService, Cultivo }             from '../../core/services/cultivo.service';

@Component({
  standalone: true,
  selector: 'app-admin-cultivos',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-cultivos.component.html',
})
export class AdminCultivosComponent implements OnInit {
  parcelaId!: number;
  cultivosAll: Cultivo[] = [];
  cultivos:    Cultivo[] = [];

  loading = true;
  error: string | null = null;

  // filtros
  searchTerm = '';
  startDate  = '';
  endDate    = '';

  constructor(
    private svc:   CultivoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Sacamos el parámetro :id de la URL
    this.parcelaId = Number(this.route.snapshot.paramMap.get('id'));
    // Cargamos todos y filtramos por parcelaId
    this.svc.getAll().subscribe({
      next: data => {
        this.cultivosAll = data.filter(c => c.parcela_id === this.parcelaId);
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
        const term = this.searchTerm.trim().toLowerCase();
        if (term && !c.variedad.toLowerCase().includes(term)) {
          return false;
        }
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
    this.router.navigate([
      '/dashboard/admin/parcelas',
      this.parcelaId,
      'cultivos',
      'create'
    ]);
  }

  editarCultivo(id: number) {
    this.router.navigate([
      '/dashboard/admin/parcelas',
      this.parcelaId,
      'cultivos',
      id,
      'edit'
    ]);
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

  volverParcela() {
    this.router.navigate(['/dashboard/admin/parcelas', this.parcelaId]);
  }
}
