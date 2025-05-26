// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, LoginPayload } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  // 1) Definimos explícitamente que cada control es un FormControl<string>
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
    // 2) Al usar fb.group, necesitamos pasar `this.fb.control`:
    this.form = this.fb.group({
      correo: this.fb.control('', [Validators.required, Validators.email]),
      contrasena: this.fb.control('', Validators.required),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.form.disable();

    // 3) getRawValue() respeta los tipos definidos arriba:
    const payload: LoginPayload = this.form.getRawValue();

    this.auth.login(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error = err.error?.message ?? 'Credenciales incorrectas';
      },
      complete: () => {
        this.loading = false;
        this.form.enable();
      }
    });
  }
}
