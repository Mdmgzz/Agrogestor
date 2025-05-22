import { bootstrapApplication }                   from '@angular/platform-browser';
import {provideHttpClient,withInterceptorsFromDi} from '@angular/common/http';
import { HTTP_INTERCEPTORS }                      from '@angular/common/http';
import { provideRouter }                          from '@angular/router';

import { AppComponent }                           from './app/app.component';
import { routes }                                 from './app/core/routes/app.routes';
import { AuthInterceptor }                        from './app/core/services/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // 1) Registra HttpClient y usa interceptores que hayas añadido via DI
    provideHttpClient(withInterceptorsFromDi()),

    // 2) Registra tu interceptor custom
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // 3) Configura el router con tus rutas
    provideRouter(routes)
  ]
})
.catch(err => console.error(err));
