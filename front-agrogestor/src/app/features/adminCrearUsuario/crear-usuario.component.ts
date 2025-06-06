// src/app/adminCrearUsuario/crear-usuario.component.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, Usuario } from '../../core/services/user.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './crear-usuario.component.html',
})
export class CrearUsuarioComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  // Lista de roles permitidos; puedes ajustar si no quieres que ADMINISTRADOR aparezca aquí
  roles = [
    { value: 'ADMINISTRADOR', label: 'Administrador' },
    { value: 'TECNICO_AGRICOLA', label: 'Técnico agrícola' },
    { value: 'INSPECTOR', label: 'Inspector' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['TECNICO_AGRICOLA', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    const payload = {
      nombre: this.form.value.nombre,
      apellidos: this.form.value.apellidos,
      correo: this.form.value.correo,
      contrasena: this.form.value.contrasena,
      rol: this.form.value.rol,
    };

    this.userService.create(payload).subscribe({
      next: (newUser: Usuario) => {
        // Al crear con éxito, redirige a la lista de usuarios o dashboard
        this.router.navigate(['/dashboard/admin/usuarios']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al crear el usuario';
        this.loading = false;
      },
    });
  }
}
