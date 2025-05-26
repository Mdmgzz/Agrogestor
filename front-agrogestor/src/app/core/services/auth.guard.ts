// src/app/core/services/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Llamamos a /api/user para verificar si hay sesión activa
    return this.auth.me().pipe(
      map(() => true), // Si responde con un usuario, dejamos pasar
      catchError(() =>
        // Si da error (no autenticado), redirigimos a login
        of(this.router.createUrlTree(['/login']))
      )
    );
  }
}
