// src/app/core/routes/app.routes.ts
import { Routes } from '@angular/router';

import { LandingComponent } from '../../features/landing/landing.component';
import { LoginComponent } from '../../features/auth/login/login.component';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';
import { ParcelasComponent } from '../../features/parcelas/parcelas.component';
import { RegisterComponent } from '../../features/auth/Register/register.component';
import { ForgotPasswordComponent } from '../../features/auth/ForgotPassword/forgot-password.component';
import { AdminDashboardComponent } from '../../features/adminDashboard/admin-dashboard.component';

import { AuthGuard } from '../services/auth.guard';
import { AdminGuard } from '../services/admin.guard';

export const routes: Routes = [
  // Pública
  { path: '', component: LandingComponent },
  { path: 'landing', redirectTo: '', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  //ruta de admin dashboard antes que la de usuario 
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full'
  },

  // Otras rutas protegidas
  {
    path: 'dashboard/parcelas',
    component: ParcelasComponent,
    canActivate: [AuthGuard]
  },

  // Wildcard al final
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
