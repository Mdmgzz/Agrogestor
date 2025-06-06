// src/app/features/auth/forgot-password/forgot-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup<{
    correo: FormControl<string>;
  }>;

  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      correo: this.fb.control('', [Validators.required, Validators.email]),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = this.message = null;

    const payload = this.form.getRawValue();
    this.auth.forgotPassword(payload).subscribe({
      next: res => {
        this.message = res.message;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Error al enviar el correo';
        this.loading = false;
      },
    });
  } 
}
