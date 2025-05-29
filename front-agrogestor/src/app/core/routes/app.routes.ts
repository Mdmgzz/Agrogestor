// src/app/core/routes/app.routes.ts
import { Routes } from '@angular/router';

import { LandingComponent }            from '../../features/landing/landing.component';
import { LoginComponent }              from '../../features/auth/login/login.component';
import { RegisterComponent }           from '../../features/auth/Register/register.component';
import { ForgotPasswordComponent }     from '../../features/auth/ForgotPassword/forgot-password.component';
import { AdminDashboardComponent }     from '../../features/adminDashboard/admin-dashboard.component';
import { AdminParcelasComponent }      from '../../features/adminParcelas/admin-parcelas.component';
import { AdminUsuariosComponent }      from '../../features/adminUsuarios/admin-usuarios.component';
import { AdminCultivosComponent }      from '../../features/adminCultivos/admin-cultivos.component';
import { AdminCultivoCreateComponent } from '../../features/adminCultivos/admin-cultivos-create.component';
import { AdminActividadesComponent }   from '../../features/adminActividades/admin-actividades.component';
import { TecnicoDashboardComponent }   from '../../features/tecnicoDashboard/tecnico-dashboard.component';
import { TecnicoParcelasComponent }    from '../../features/tecnicoParcelas/tecnico-parcelas.component';
import { TecnicoParcelaCreateComponent } from '../../features/tecnicoParcelas/tecnico-parcela-create.component';
import { AdminParcelaCreateComponent }   from '../../features/adminParcelas/admin-parcela-create.component';
import { TecnicoCultivoCreateComponent }   from '../../features/tecnicoCultivo/tecnico-cultivo-create.component';
import { TecnicoCultivosComponent }    from '../../features/tecnicoCultivo/tecnico-cultivo.component';
import { AuthGuard }  from '../services/auth.guard';
import { AdminGuard } from '../services/admin.guard';

export const routes: Routes = [
  // Pública
  { path: '', component: LandingComponent },
  { path: 'landing', redirectTo: '', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Admin Dashboard
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

  // Técnico Dashboard
  {
    path: 'dashboard/tecnico',
    component: TecnicoDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/tecnico/parcelas',
    component: TecnicoParcelasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/tecnico/parcelas/create',
    component: TecnicoParcelaCreateComponent,
    canActivate: [AuthGuard]
  },

  // Admin – Parcelas
  {
    path: 'dashboard/admin/parcelas',
    component: AdminParcelasComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'dashboard/admin/parcelas/create',
    component: AdminParcelaCreateComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

// Listado global de cultivos
  {
    path: 'dashboard/admin/cultivos',
    component: AdminCultivosComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  // Creación genérica de cultivo (sin :id)
  {
    path: 'dashboard/admin/cultivos/create',
    component: AdminCultivoCreateComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'dashboard/admin/parcelas/:id/cultivos/create',
    component: AdminCultivoCreateComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

  // Admin – Usuarios y Actividades
  {
    path: 'dashboard/admin/usuarios',
    component: AdminUsuariosComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'dashboard/admin/actividades',
    component: AdminActividadesComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  // Técnico – Cultivos
  {
    path: 'dashboard/tecnico/cultivos',
    component: TecnicoCultivosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/tecnico/cultivos/create',
    component: TecnicoCultivoCreateComponent,
    canActivate: [AuthGuard]
  },

  // Wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
