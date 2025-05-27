// src/app/features/adminDashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  stats = { usuarios: 0, parcelas: 0, cultivos: 0, actividades: 0 };
  loading = true;
  error: string | null = null;

  constructor(
    private svc: DashboardService,
    public auth: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.svc.getAdminStats().subscribe({
      next: data => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas';
        this.loading = false;
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([`/dashboard/${path}`]);
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
