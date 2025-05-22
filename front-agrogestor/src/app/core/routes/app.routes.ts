// src/app/core/routes/app.routes.ts
import { Routes } from '@angular/router';

import { LandingComponent }    from '../../features/landing/landing.component';
import { LoginComponent }      from '../../features/auth/login/login.component';
import { DashboardComponent }  from '../../features/dashboard/dashboard.component';
import { ParcelasComponent }   from '../../features/parcelas/parcelas.component';

import { AuthGuard }           from '../services/auth.guard';

export const routes: Routes = [
  // 1) Carga la Landing en la raíz
  { path: '', component: LandingComponent },

  // 2) Redirige /landing a la misma Landing (opcional)
  { path: 'landing', redirectTo: '', pathMatch: 'full' },

  // Login público
  { path: 'login', component: LoginComponent },

  // Dashboard y sub‐rutas protegidas
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'parcelas', component: ParcelasComponent }
      // …otras rutas hijas…
    ]
  },

  // Cualquier otra URL vuelve a la Landing
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
