// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import {
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginPayload, Usuario } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup<{
    correo: FormControl<string>;
    contrasena: FormControl<string>;
  }>;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: this.fb.control('', [Validators.required, Validators.email]),
      contrasena: this.fb.control('', Validators.required),
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const payload: LoginPayload = this.form.getRawValue();
    this.auth.login(payload).subscribe({
      next: ({ user }: { user: Usuario; token: string }) => {
        // Redirigir según el rol del usuario
        switch (user.rol) {
          case 'ADMINISTRADOR':
            this.router.navigate(['/dashboard/admin']);
            break;
          case 'TECNICO_AGRICOLA':
            this.router.navigate(['/dashboard/tecnico']);
            break;
          case 'INSPECTOR':
            this.router.navigate(['/dashboard/inspector']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.error = err.error?.message ?? 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
}
