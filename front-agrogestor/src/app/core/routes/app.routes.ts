// src/app/core/routes/app.routes.ts

import { Routes } from '@angular/router';

import { LandingComponent } from '../../features/landing/landing.component';
import { LoginComponent } from '../../features/auth/login/login.component';
import { RegisterComponent } from '../../features/auth/Register/register.component';
import { ForgotPasswordComponent } from '../../features/auth/ForgotPassword/forgot-password.component';
import { ResetPasswordComponent } from '../../features/auth/resetPassword/reset-password.component';

import { AdminDashboardComponent } from '../../features/adminDashboard/admin-dashboard.component';
import { AdminParcelasComponent } from '../../features/adminParcelas/admin-parcelas.component';
import { AdminParcelaCreateComponent } from '../../features/adminParcelas/admin-parcela-create.component';
import { AdminParcelaDetalleComponent } from '../../features/parcelas/admin-parcela-detalle.component';
import { AdminUsuariosComponent } from '../../features/adminUsuarios/admin-usuarios.component';
import { AdminUsuarioEditComponent } from '../../features/usuario/admin-usuario-edit.component';
import { AdminCultivosComponent } from '../../features/adminCultivos/admin-cultivos.component';
import { AdminCultivoCreateComponent } from '../../features/adminCultivos/admin-cultivos-create.component';
import { AdminCultivosDetalleComponent } from '../../features/cultivos/admin-cultivos-detalle.component';
import { AdminActividadesComponent } from '../../features/adminActividades/admin-actividades.component';
import { AdminActividadesCreateComponent } from '../../features/adminActividades/admin-actividades-create.component';
import { ActividadDetailComponent } from '../../features/actividades/actividad-detail.component';

import { CrearUsuarioComponent } from '../../features/adminCrearUsuario/crear-usuario.component';

import { TecnicoDashboardComponent } from '../../features/tecnicoDashboard/tecnico-dashboard.component';
import { TecnicoParcelasComponent } from '../../features/tecnicoParcelas/tecnico-parcelas.component';
import { TecnicoParcelaCreateComponent } from '../../features/tecnicoParcelas/tecnico-parcela-create.component';
import { TecnicoParcelaDetalleComponent } from '../../features/parcelas/tecnico-parcela-detalle.component';

import { TecnicoCultivosComponent } from '../../features/tecnicoCultivo/tecnico-cultivo.component';
import { TecnicoCultivoCreateComponent } from '../../features/tecnicoCultivo/tecnico-cultivo-create.component';
import { TecnicoCultivoDetalleComponent } from '../../features/cultivos/tecnico-cultivo-detalle.component';

import { TecnicoActividadesComponent } from '../../features/tecnicoActividades/tecnico-actividades.component';
import { TecnicoActividadDetalleComponent } from '../../features/actividades/tecnico-actividad-detalle.component';

import { AuthGuard } from '../services/auth.guard';
import { AdminGuard } from '../services/admin.guard';

export const routes: Routes = [
  // Rutas Públicas
  { path: '', component: LandingComponent },
  { path: 'landing', redirectTo: '', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Admin Dashboard
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
  },

  // Técnico Dashboard
  {
    path: 'dashboard/tecnico',
    component: TecnicoDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/tecnico/parcelas',
    component: TecnicoParcelasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/tecnico/parcelas/create',
    component: TecnicoParcelaCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/tecnico/parcelas/:id',
    component: TecnicoParcelaDetalleComponent,
    canActivate: [AuthGuard],
  },

  // Admin – Parcelas
  {
    path: 'dashboard/admin/parcelas',
    component: AdminParcelasComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/parcelas/create',
    component: AdminParcelaCreateComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/parcelas/:id',
    component: AdminParcelaDetalleComponent,
    canActivate: [AuthGuard, AdminGuard],
  },

  // Admin – Cultivos
  {
    path: 'dashboard/admin/cultivos',
    component: AdminCultivosComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/cultivos/create',
    component: AdminCultivoCreateComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/parcelas/:id/cultivos/create',
    component: AdminCultivoCreateComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/cultivos/:id',
    component: AdminCultivosDetalleComponent,
    canActivate: [AuthGuard, AdminGuard],
  },

  // Admin – Usuarios y Actividades
  {
    path: 'dashboard/admin/usuarios',
    component: AdminUsuariosComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/usuarios/create',
    component: CrearUsuarioComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/usuarios/:id/edit',
    component: AdminUsuarioEditComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/actividades',
    component: AdminActividadesComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/actividades/create',
    component: AdminActividadesCreateComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'dashboard/admin/actividades/:id',
    component: ActividadDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },

  // Técnico – Cultivos
  {
    path: 'dashboard/tecnico/cultivos',
    component: TecnicoCultivosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/tecnico/cultivos/create',
    component: TecnicoCultivoCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/tecnico/cultivos/:id',
    component: TecnicoCultivoDetalleComponent,
    canActivate: [AuthGuard],
  },

  // Técnico – Actividades
  {
    path: 'dashboard/tecnico/actividades',
    component: TecnicoActividadesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/tecnico/actividades/:id',
    component: TecnicoActividadDetalleComponent,
    canActivate: [AuthGuard],
  },

  // Wildcard: cualquier otra ruta redirige a “/”
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
