// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginPayload { correo: string; contrasena: string; }
export interface AuthResponse { user: any; token: string; }
export interface User { id: number; name: string; correo: string; }

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'ADMINISTRADOR' | 'TECNICO_AGRICOLA' | 'INSPECTOR';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(data: { correo: string; contrasena: string }) {
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
      .post<{ message: string }>(
        `${this.base}/api/logout`,
        {}
      )
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
    return localStorage.getItem('api_token');
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
        // <— aquí apuntamos al mismo backend que el login:
        `${this.base}/api/register`,
        data
      )
      .pipe(tap(res => localStorage.setItem('token', res.token)));
  }

 forgotPassword(data: { correo: string }) {
    return this.http.post<{ message: string }>(
      `${this.base}/api/password/email`,
      data
    );
  }

  resetPassword(data: {
    token: string;
    correo: string;
    contrasena: string;
    password_confirmation: string;
  }) {
    return this.http.post<{ message: string }>(
      `${this.base}/api/password/reset`,
      data
    );
  }
}
