// src/app/features/tecnicoDashboard/tecnico-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcelaService } from '../../core/services/parcela.service';
import { CultivoService } from '../../core/services/cultivo.service';
import { ActividadService } from '../../core/services/actividad.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-tecnico-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './tecnico-dashboard.component.html',
})
export class TecnicoDashboardComponent implements OnInit {
  stats = { parcelas: 0, cultivos: 0, actividades: 0 };
  loading = true;
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService,
    private actividadSvc: ActividadService,
    public router: Router
  ) {}

  ngOnInit() {
    this.auth.me().pipe(
      switchMap(() => forkJoin({
        parcelas: this.parcelaSvc.getAll().pipe(catchError(() => of([]))),
        cultivos: this.cultivoSvc.getAll().pipe(catchError(() => of([]))),
        actividades: this.actividadSvc.getAll().pipe(catchError(() => of([]))),
      })),
      map(({ parcelas, cultivos, actividades }) => {
        const parcelaIds = parcelas.map(p => p.id);
        const cultivosCount = cultivos.filter(c => parcelaIds.includes(c.parcela_id)).length;
        const actividadesCount = actividades.filter(a =>
          // filtramos según el cultivo asociado
          Boolean(a.cultivo) && parcelaIds.includes(a.cultivo!.parcela_id)
        ).length;
        return {
          parcelas: parcelas.length,
          cultivos: cultivosCount,
          actividades: actividadesCount
        };
      }),
      catchError(() => {
        this.error = 'Error al cargar datos';
        return of({ parcelas: 0, cultivos: 0, actividades: 0 });
      })
    ).subscribe(res => {
      this.stats = res;
      this.loading = false;
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
