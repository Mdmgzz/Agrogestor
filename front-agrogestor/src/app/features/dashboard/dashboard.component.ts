import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  currentRoute = '/dashboard';

  constructor(private router: Router) {
    // Para resaltar el link activo
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => (this.currentRoute = e.url));
  }

  logout() {
    // Aquí podrías usar AuthService.logout() y luego:
    this.router.navigate(['/login']);
  }
}
