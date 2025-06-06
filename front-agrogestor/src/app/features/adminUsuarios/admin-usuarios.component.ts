// src/app/features/usuarios/admin-usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, UserService } from '../../core/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-usuarios',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
})
export class AdminUsuariosComponent implements OnInit {
  usuariosAll: Usuario[] = [];
  usuarios: Usuario[] = [];
  roles: string[] = [];

  loading = true;
  error: string | null = null;

  // filtros
  searchTerm = '';
  selectedRole = 'ALL';

  constructor(
    private svc: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.usuariosAll = data;
        this.roles = Array.from(new Set(data.map(u => u.rol)));
        this.processFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.loading = false;
      }
    });
  }

  processFilters() {
    this.usuarios = this.usuariosAll
      .filter(u => {
        // filtro por rol
        if (this.selectedRole !== 'ALL' && u.rol !== this.selectedRole) {
          return false;
        }
        // búsqueda por nombre/apellidos/correo
        const term = this.searchTerm.trim().toLowerCase();
        if (!term) return true;
        const full = `${u.nombre} ${u.apellidos} ${u.correo}`.toLowerCase();
        return full.includes(term);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  crearUsuario() {
    this.router.navigate(['dashboard/admin/usuarios/create']);
  }

  editarUsuario(id: number) {
    this.router.navigate([`/dashboard/admin/usuarios/${id}/edit`]);
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        // quitar de la lista y recalcular
        this.usuariosAll = this.usuariosAll.filter(u => u.id !== id);
        this.processFilters();
      },
      error: () => alert('Error al eliminar usuario')
    });
  }
}
