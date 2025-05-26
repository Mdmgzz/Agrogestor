// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }          from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXsrfConfiguration
}                                 from '@angular/common/http';
import { HTTP_INTERCEPTORS }      from '@angular/common/http';

import { AppComponent }           from './app/app.component';
import { routes }                 from './app/core/routes/app.routes';
import { AuthInterceptor }        from './app/core/services/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      // Angular leerá la cookie XSRF-TOKEN y la pondrá en el header X-XSRF-TOKEN
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
