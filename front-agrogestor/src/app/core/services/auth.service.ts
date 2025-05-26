import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, Observable } from 'rxjs';

export interface LoginPayload { correo: string; contrasena: string; }
export interface User         { /* tus campos */ }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  login(payload: { correo: string; contrasena: string }) {
  return this.http
    .get<void>(`${this.base}/sanctum/csrf-cookie`, { withCredentials: true })
    .pipe(
      switchMap(() =>
        this.http.post<{ user: User; token: string }>(
          `${this.base}/api/login`,
          payload,                // { correo, contrasena }
          { withCredentials: true }
        )
      )
    );
}
  me(): Observable<User> {
    return this.http.get<User>(
      `${this.base}/api/user`,
      { withCredentials: true }
    );
  }

  logout() {
    return this.http.post(`${this.base}/api/logout`, {}, { withCredentials: true });
  }
}
