// src/app/features/tecnicoActividades/tecnico-actividad-detalle.component.ts
import { Component, OnInit }                            from '@angular/core';
import { CommonModule }                                 from '@angular/common';
import { FormsModule, NgForm }                          from '@angular/forms';
import { RouterModule, ActivatedRoute, Router }         from '@angular/router';
import { forkJoin, of }                                 from 'rxjs';
import { catchError }                                   from 'rxjs/operators';

import { ActividadService, Actividad }                  from '../../core/services/actividad.service';
import { CultivoService, Cultivo }                      from '../../core/services/cultivo.service';
import { ParcelaService, Parcela }                      from '../../core/services/parcela.service';
import { AuthService, Usuario }                         from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-actividad-detalle',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-actividad-detalle.component.html',
})
export class TecnicoActividadDetalleComponent implements OnInit {
  actividad?: Actividad;
  cultivo?: Cultivo;
  parcela?: Parcela;

  loading = true;
  error: string | null = null;

  // Campos editables
  tipo_actividad = '';
  fecha_actividad?: string;
  detallesTexto = '';

  private actividadId!: number;
  private tecnicoActual?: Usuario;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actSvc: ActividadService,
    private cultivoSvc: CultivoService,
    private parcelaSvc: ParcelaService,
    private authSvc: AuthService
  ) {}

  ngOnInit(): void {
    // 1) Obtener el :id de la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/tecnico/actividades']);
      return;
    }
    this.actividadId = +idParam;

    // 2) Verificar técnico autenticado y luego cargar datos
    this.authSvc.me().subscribe({
      next: user => {
        this.tecnicoActual = user;
        this.loadDatos();
      },
      error: () => {
        this.error = 'No se pudo verificar el usuario.';
        this.loading = false;
      }
    });
  }

  private loadDatos(): void {
    // Traer la actividad (backend filtra para que solo el técnico pueda verla)
    this.actSvc.getById(this.actividadId).pipe(
      catchError(() => of(null as Actividad | null))
    ).subscribe(act => {
      if (!act) {
        this.error = 'Actividad no encontrada o sin permisos.';
        this.loading = false;
        return;
      }
      this.actividad = act;
      this.tipo_actividad  = act.tipo_actividad;
      this.fecha_actividad = act.fecha_actividad;

      // Extraer detalles
      try {
        const detObj = typeof act.detalles === 'string'
          ? JSON.parse(act.detalles)
          : act.detalles;
        this.detallesTexto = detObj?.texto ?? '';
      } catch {
        this.detallesTexto = '';
      }

      // Cargar cultivo para mostrar variedad y fecha de siembra
      this.cultivoSvc.getById(act.cultivo_id).pipe(
        catchError(() => of(null as Cultivo | null))
      ).subscribe(c => {
        if (c) {
          this.cultivo = c;
          // Cargar parcela del cultivo
          this.parcelaSvc.getById(c.parcela_id).pipe(
            catchError(() => of(null as Parcela | null))
          ).subscribe(p => {
            this.parcela = p || undefined;
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      });
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/tecnico/actividades']);
  }

  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload = {
      tipo_actividad:  this.tipo_actividad,
      fecha_actividad: this.fecha_actividad,
      detalles:        JSON.stringify({ texto: this.detallesTexto })
    };

    this.actSvc.update(this.actividadId, payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/actividades']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al guardar la actividad.';
        this.loading = false;
      }
    });
  }

  eliminarActividad(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }
    this.actSvc.delete(this.actividadId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/actividades']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar la actividad.');
      }
    });
  }
}
