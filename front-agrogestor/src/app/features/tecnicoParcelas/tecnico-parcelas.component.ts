// src/app/features/tecnicoParcelas/tecnico-parcelas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ParcelaService, Parcela } from '../../core/services/parcela.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-parcelas',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-parcelas.component.html',
})
export class TecnicoParcelasComponent implements OnInit {
  parcelas: Parcela[] = [];
  parcelasFiltradas: Parcela[] = [];

  loading = true;
  error: string | null = null;

  searchTerm = '';
  minSurface: number | null = null;
  maxSurface: number | null = null;

  constructor(private svc: ParcelaService, private router: Router) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (data) => {
        this.parcelas = data;
        this.parcelasFiltradas = data;
        this.processGrouping();
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las parcelas';
        this.loading = false;
      },
    });
  }

  processGrouping(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.parcelasFiltradas = this.parcelas.filter((p) => {
      const matchNombre = term
        ? p.nombre.toLowerCase().includes(term) ||
          p.propietario.toLowerCase().includes(term)
        : true;

      const matchMin = this.minSurface !== null
        ? p.superficie_ha >= this.minSurface
        : true;
      const matchMax = this.maxSurface !== null
        ? p.superficie_ha <= this.maxSurface
        : true;

      return matchNombre && matchMin && matchMax;
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/dashboard/parcelas', id]);
  }
}
