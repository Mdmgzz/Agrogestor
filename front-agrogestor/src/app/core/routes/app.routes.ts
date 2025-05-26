import { Routes } from '@angular/router';

import { LandingComponent }   from '../../features/landing/landing.component';
import { LoginComponent }     from '../../features/auth/login/login.component';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';
import { ParcelasComponent }  from '../../features/parcelas/parcelas.component';
import { AuthGuard }          from '../services/auth.guard';

export const routes: Routes = [
  { path: '',         component: LandingComponent },
  { path: 'landing',  redirectTo: '', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },

  // Dashboard y Parcelas como rutas separadas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/parcelas',
    component: ParcelasComponent,
    canActivate: [AuthGuard]
  },

  // Wildcard → Landing
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
