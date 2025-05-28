// src/app/features/parcelas/admin-parcelas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcelaService, Parcela } from '../../core/services/parcela.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-parcelas',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-parcelas.component.html',
})
export class AdminParcelasComponent implements OnInit {
  parcelas: Parcela[] = [];
  usersAll: string[] = [];             // todos los usuarios
  userKeys: string[] = [];             // orden para agrupar (filtrados primero)
  groupedParcelas: Record<string, Parcela[]> = {};

  loading = true;
  error: string | null = null;

  searchTerm = '';
  minSurface: number | null = null;
  maxSurface: number | null = null;
  selectedSort: 'usuario' | 'superficie_ha' = 'usuario';

  constructor(
    private svc: ParcelaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.parcelas = data;
        // lista única de propietarios (usuario.nombre apellidos)
        this.usersAll = Array.from(new Set(
          data.map(p => `${p.usuario.nombre} ${p.usuario.apellidos}`)
        ));
        this.processGrouping();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las parcelas';
        this.loading = false;
      }
    });
  }

  processGrouping() {
    // 1) filtrar por superficie
    let list = this.parcelas.filter(p => {
      if (this.minSurface != null && p.superficie_ha < this.minSurface) return false;
      if (this.maxSurface != null && p.superficie_ha > this.maxSurface) return false;
      return true;
    });

    // 2) separar según búsqueda de usuario
    const term = this.searchTerm.trim().toLowerCase();
    let matched = term
      ? list.filter(p =>
          (`${p.usuario.nombre} ${p.usuario.apellidos}`)
            .toLowerCase()
            .includes(term)
        )
      : [];
    let rest = term
      ? list.filter(p =>
          !(`${p.usuario.nombre} ${p.usuario.apellidos}`)
             .toLowerCase()
             .includes(term)
        )
      : list;

    list = [...matched, ...rest];

    // 3) ordenar
    list.sort((a, b) => {
      if (this.selectedSort === 'usuario') {
        const ua = `${a.usuario.nombre} ${a.usuario.apellidos}`;
        const ub = `${b.usuario.nombre} ${b.usuario.apellidos}`;
        return ua.localeCompare(ub);
      } else {
        return a.superficie_ha - b.superficie_ha;
      }
    });

    // 4) recalcular claves de grupo: primero usuarios con matches, luego el resto
    const matchedUsers = Array.from(new Set(matched.map(
      p => `${p.usuario.nombre} ${p.usuario.apellidos}`
    )));
    const otherUsers = this.usersAll.filter(u => !matchedUsers.includes(u));
    this.userKeys = [...matchedUsers, ...otherUsers];

    // 5) agrupar
    this.groupedParcelas = {};
    for (const p of list) {
      const key = `${p.usuario.nombre} ${p.usuario.apellidos}`;
      (this.groupedParcelas[key] ??= []).push(p);
    }
  }

  verDetalle(id: number) {
    this.router.navigate([`/dashboard/parcelas/${id}`]);
  }
}
