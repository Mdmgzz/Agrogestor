// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginPayload { correo: string; contrasena: string; }
export interface AuthResponse { user: any; token: string; }
export interface User { id: number; name: string; correo: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.base}/api/login`,
      payload
    ).pipe(
      tap(res => localStorage.setItem('api_token', res.token))
    );
  }

  logout() {
    localStorage.removeItem('api_token');
    // opcional: llamar a backend logout si tienes tokens revocados
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/api/user`);
  }

  getToken(): string | null {
    return localStorage.getItem('api_token');
  }
}
