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
  usersAll: string[] = [];
  userKeys: string[] = [];
  groupedParcelas: Record<string, Parcela[]> = {};

  loading = true;
  error: string | null = null;

  searchTerm = '';
  minSurface: number | null = null;
  maxSurface: number | null = null;

  constructor(
    private svc: ParcelaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.parcelas = data;
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
    let list = this.parcelas.filter(p => {
      if (this.minSurface != null && p.superficie_ha < this.minSurface) return false;
      if (this.maxSurface != null && p.superficie_ha > this.maxSurface) return false;
      return true;
    });

    const term = this.searchTerm.trim().toLowerCase();
    let matched = term
      ? list.filter(p =>
          (`${p.usuario.nombre} ${p.usuario.apellidos}`.toLowerCase()).includes(term)
        )
      : [];
    let rest = term
      ? list.filter(p =>
          !(`${p.usuario.nombre} ${p.usuario.apellidos}`.toLowerCase()).includes(term)
        )
      : list;

    list = [...matched, ...rest];

    const matchedUsers = Array.from(new Set(matched.map(
      p => `${p.usuario.nombre} ${p.usuario.apellidos}`
    )));
    const otherUsers = this.usersAll.filter(u => !matchedUsers.includes(u));
    this.userKeys = [...matchedUsers, ...otherUsers];

    this.groupedParcelas = {};
    for (const p of list) {
      const key = `${p.usuario.nombre} ${p.usuario.apellidos}`;
      (this.groupedParcelas[key] ??= []).push(p);
    }
  }

  // Ya no es necesario porque el <li> usa routerLink directamente:
  // verDetalle(id: number) {
  //   this.router.navigate([`/dashboard/admin/parcelas/${id}`]);
  // }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
