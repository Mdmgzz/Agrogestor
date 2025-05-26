// src/app/core/services/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clonamos la petición para añadir withCredentials y Accept
    const authReq = req.clone({
      withCredentials: true,
      setHeaders: {
        Accept: 'application/json'
      }
    });
    return next.handle(authReq);
  }
}
