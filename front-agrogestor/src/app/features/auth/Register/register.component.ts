// src/app/features/auth/register/register.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  form!: FormGroup<{
    nombre: FormControl<string>;
    apellidos: FormControl<string>;
    correo: FormControl<string>;
    contrasena: FormControl<string>;
    // Sólo Técnicos agrícolas e Inspectores
    rol: FormControl<'TECNICO_AGRICOLA' | 'INSPECTOR'>;
  }>;

  loading = false;
  error: string | null = null;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nombre:     this.fb.control('', Validators.required),
      apellidos:  this.fb.control('', Validators.required),
      correo:     this.fb.control('', [Validators.required, Validators.email]),
      contrasena: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      rol: this.fb.control<'TECNICO_AGRICOLA' | 'INSPECTOR'>(
        'TECNICO_AGRICOLA',
        Validators.required
      ),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const payload = this.form.getRawValue();
    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        this.error = err.error?.message || 'Error en el registro';
        this.loading = false;
      },
    });
  }
}
