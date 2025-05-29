// src/app/features/adminParcelas/admin-parcela-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule, NgForm }      from '@angular/forms';
import { Router, RouterModule }      from '@angular/router';
import { ParcelaService }            from '../../core/services/parcela.service';
import { UserService, Usuario }   from '../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-admin-parcela-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-parcela-create.component.html',
})
export class AdminParcelaCreateComponent implements OnInit {
  nombre            = '';
  propietario       = '';
  superficie?: number;

  allUsuarios: Usuario[]      = [];
  filteredUsuarios: Usuario[] = [];
  userSearch       = '';
  selectedUsuario?: Usuario;
  showUserDropdown = false;

  loading = false;
  error: string | null = null;

  constructor(
    private svcParcela: ParcelaService,
    private svcUsuario: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.svcUsuario.getAll().subscribe({
      next: list => {
        this.allUsuarios      = list;
        this.filteredUsuarios = list;
      },
      error: () => this.error = 'Error al cargar lista de usuarios.'
    });
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.filteredUsuarios = this.allUsuarios;
      this.userSearch = '';
    }
  }

  onUserSearchChange(): void {
    const term = this.userSearch.trim().toLowerCase();
    this.filteredUsuarios = this.allUsuarios.filter(u =>
      `${u.nombre} ${u.apellidos}`.toLowerCase().includes(term)
    );
    this.showUserDropdown = true;
  }

  selectUsuario(u: Usuario): void {
    this.selectedUsuario    = u;
    this.userSearch         = `${u.nombre} ${u.apellidos}`;
    this.showUserDropdown   = false;
  }

  crearParcela(form: NgForm): void {
    if (form.invalid || !this.selectedUsuario) {
      this.error = 'Por favor, completa todos los campos y selecciona un usuario.';
      return;
    }

    this.error   = null;
    this.loading = true;

    const payload = {
      usuario_id:    this.selectedUsuario.id,
      nombre:        this.nombre,
      propietario:   this.propietario,
      superficie_ha: this.superficie
    };

    this.svcParcela.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/admin/parcelas']);
      },
      error: err => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          this.error = Object.values(err.error.errors).flat().join(' • ');
        } else {
          this.error = err.error?.message || 'Error al crear la parcela';
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/parcelas']);
  }
}
