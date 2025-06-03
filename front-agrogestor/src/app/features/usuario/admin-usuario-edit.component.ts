import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { UserService, Usuario } from '../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-admin-usuario-edit',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-usuario-edit.component.html',
})
export class AdminUsuarioEditComponent implements OnInit {
  usuario?: Usuario;
  loading = true;
  error: string | null = null;

  // Campos para bindear al formulario
  nombre: string = '';
  apellidos: string = '';
  correo: string = '';
  rol: 'ADMINISTRADOR' | 'TECNICO_AGRICOLA' | 'INSPECTOR' = 'TECNICO_AGRICOLA';
  contrasena: string = '';
  confirmarContrasena: string = '';

  // Opciones de rol
  roles: ('ADMINISTRADOR' | 'TECNICO_AGRICOLA' | 'INSPECTOR')[] = [
    'ADMINISTRADOR',
    'TECNICO_AGRICOLA',
    'INSPECTOR'
  ];

  private usuarioIdParam!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userSvc: UserService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/admin/usuarios']);
      return;
    }
    this.usuarioIdParam = +idParam;

    // Cargar datos del usuario
    this.userSvc.getById(this.usuarioIdParam).subscribe({
      next: u => {
        this.usuario = u;
        this.nombre = u.nombre;
        this.apellidos = u.apellidos;
        this.correo = u.correo;
        this.rol = u.rol;
        // No prellenamos contraseñas
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Error al cargar el usuario.';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/admin/usuarios']);
  }

  isValidEmail(email: string): boolean {
    // Validación básica de correo
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  guardarCambios(form: NgForm): void {
    // Validaciones antes de enviar
    if (
      form.invalid ||
      !this.nombre.trim() ||
      !this.apellidos.trim() ||
      !this.correo.trim() ||
      !this.isValidEmail(this.correo) ||
      (this.contrasena || this.confirmarContrasena) && (this.contrasena !== this.confirmarContrasena)
    ) {
      this.error = 'Revisa que todos los campos estén completos y correctos.';
      return;
    }

    // Preparar payload
    const payload: Partial<Usuario> & { contrasena?: string } = {
      nombre: this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      correo: this.correo.trim(),
      rol: this.rol
    };

    // Si escribió contraseña, incluirla
    if (this.contrasena.trim()) {
      payload.contrasena = this.contrasena.trim();
    }

    this.loading = true;
    this.error = null;

    this.userSvc.update(this.usuarioIdParam, payload).subscribe({
      next: () => {
        // Al guardar, redirigir a la lista de usuarios
        this.router.navigate(['/dashboard/admin/usuarios']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al guardar los cambios.';
        this.loading = false;
      }
    });
  }

  eliminarUsuario(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }
    this.userSvc.delete(this.usuarioIdParam).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/admin/usuarios']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar el usuario.');
      }
    });
  }
}
