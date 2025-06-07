// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Ajustamos los payloads para el reset de contraseña:
export interface LoginPayload { correo: string; contrasena: string; }
export interface AuthResponse { user: any; token: string; }
export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'ADMINISTRADOR' | 'TECNICO_AGRICOLA' | 'INSPECTOR';
}

// Nuevo interface para forgot/reset password
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  email: string;
  contrasena: string;
  contrasena_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(data: LoginPayload) {
    return this.http
      .post<{ user: Usuario; token: string }>(
        `${this.base}/api/login`,
        data
      )
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
        })
      );
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.base}/api/logout`, {})
      .pipe(
        tap(() => {
          localStorage.removeItem('token');
        })
      );
  }

  me() {
    return this.http.get<Usuario>(`${this.base}/api/user`);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(data: {
    nombre: string;
    apellidos: string;
    correo: string;
    contrasena: string;
    rol: 'TECNICO_AGRICOLA' | 'INSPECTOR';
  }) {
    return this.http
      .post<{ user: any; token: string }>(
        `${this.base}/api/register`,
        data
      )
      .pipe(tap(res => localStorage.setItem('token', res.token)));
  }

  // ---------------------------------------------------------------
  // Forgot & reset password
  // ---------------------------------------------------------------

  forgotPassword(data: ForgotPasswordPayload) {
    return this.http.post<{ message: string }>(
      `${this.base}/api/password/email`,
      data
    );
  }

  resetPassword(data: ResetPasswordPayload) {
    return this.http.post<{ message: string }>(
      `${this.base}/api/password/reset`,
      {
        token: data.token,
        email: data.email,
        contrasena: data.contrasena,
        contrasena_confirmation: data.contrasena_confirmation
      }
    );
  }
}
