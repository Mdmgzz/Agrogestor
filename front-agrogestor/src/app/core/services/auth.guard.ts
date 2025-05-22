// src/app/core/services/auth.guard.ts
import { Injectable }                        from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService }                       from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    // Si el usuario está logueado, permitimos la navegación
    if ( this.auth.isLoggedIn() ) {
      return true;
    }

    // Si no, redirigimos al login
    return this.router.createUrlTree(['/login']);
  }
}
