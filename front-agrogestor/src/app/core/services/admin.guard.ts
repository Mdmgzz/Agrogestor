// src/app/core/services/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return this.auth.me().pipe(
      map(user => user.rol === 'ADMINISTRADOR'),
      tap(isAdmin => {
        if (!isAdmin) this.router.navigate(['/dashboard']);
      })
    );
  }
}
