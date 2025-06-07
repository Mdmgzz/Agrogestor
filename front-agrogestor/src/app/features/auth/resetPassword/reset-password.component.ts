// src/app/features/auth/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  FormGroup,
  FormControl,
  ValidationErrors,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup<{
    email: FormControl<string>;
    token: FormControl<string>;
    contrasena: FormControl<string>;
    contrasena_confirmation: FormControl<string>;
  }>;

  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    const token = this.route.snapshot.queryParamMap.get('token') || '';

    this.form = this.fb.group(
      {
        email: this.fb.control(email, [Validators.required, Validators.email]),
        token: this.fb.control(token, [Validators.required]),
        contrasena: this.fb.control('', [Validators.required, Validators.minLength(6)]),
        contrasena_confirmation: this.fb.control('', [Validators.required]),
      },
      { validators: [this.passwordsMatch] }
    );
  }

  /** ValidatorFn: comprueba que contrasena === contrasena_confirmation */
  passwordsMatch: (control: AbstractControl) => ValidationErrors | null = (control) => {
    const pass = control.get('contrasena')?.value;
    const confirm = control.get('contrasena_confirmation')?.value;
    return pass && confirm && pass === confirm
      ? null
      : { mismatch: true };
  };

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = this.message = null;

    const { email, token, contrasena, contrasena_confirmation } =
      this.form.getRawValue();
    this.auth
      .resetPassword({ email, token, contrasena, contrasena_confirmation })
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error restableciendo contraseña';
          this.loading = false;
        },
      });
  }
}
