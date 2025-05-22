// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'api_token';

  /** Guarda el token tras hacer login */
  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /** Elimina el token al hacer logout */
  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /** Comprueba si hay un token almacenado */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /** Opcional: recuperar el token para el interceptor */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
