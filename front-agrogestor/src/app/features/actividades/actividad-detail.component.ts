// src/app/features/actividades/actividad-detail.component.ts

import { Component, OnInit }                            from '@angular/core';
import { CommonModule }                                 from '@angular/common';
import { FormsModule, NgForm }                          from '@angular/forms';
import { RouterModule, ActivatedRoute, Router }         from '@angular/router';
import { forkJoin, of }                                 from 'rxjs';
import { catchError }                                   from 'rxjs/operators';

import { ActividadService, Actividad }                  from '../../core/services/actividad.service';
import { UserService, Usuario }                         from '../../core/services/user.service';
import { ParcelaService, Parcela }                      from '../../core/services/parcela.service';
import { CultivoService, Cultivo }                      from '../../core/services/cultivo.service';
import { environment }                                  from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-actividad-detail',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './actividad-detail.component.html',
})
export class ActividadDetailComponent implements OnInit {
  actividad?: Actividad;
  loading = true;
  error: string | null = null;

  // Listas completas
  usuarios:    Usuario[] = [];
  parcelas:    Parcela[] = [];
  cultivosAll: Cultivo[] = [];

  // Para los <select> filtrados
  parcelasFiltradas: Parcela[] = [];
  cultivosFiltrados:  Cultivo[]  = [];

  // Campos “model” para bindear al formulario
  usuarioId?:  number;
  parcelaId?:  number;
  cultivoId?:  number;
  tipo_actividad = '';
  fecha_actividad?: string;

  // Ahora solo texto plano para “Detalles”
  detallesTexto = '';

  private actividadId!: number;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private actSvc: ActividadService,
    private usuarioSvc: UserService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService
  ) {}

  ngOnInit(): void {
    // 1) Extraer el :id de la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/admin/actividades']);
      return;
    }
    this.actividadId = +idParam;

    // 2) Disparamos en paralelo usuarios, parcelas, cultivos y la propia actividad
    forkJoin({
      usuarios: this.usuarioSvc.getAll().pipe(catchError(() => of([] as Usuario[]))),
      parcelas: this.parcelaSvc.getAll().pipe(catchError(() => of([] as Parcela[]))),
      cultivos: this.cultivoSvc.getAll().pipe(catchError(() => of([] as Cultivo[]))),
      actividad: this.actSvc.getById(this.actividadId).pipe(
        catchError(err => of(null as Actividad | null))
      )
    }).subscribe({
      next: ({ usuarios, parcelas, cultivos, actividad }) => {
        this.usuarios    = usuarios;
        this.parcelas    = parcelas;
        this.cultivosAll = cultivos;

        if (!actividad) {
          this.error = 'Actividad no encontrada o sin permisos.';
          this.loading = false;
          return;
        }

        // Asignamos actividad
        this.actividad = actividad;

        // Rellenamos los campos de modelo:
        this.usuarioId       = actividad.usuario_id;
        this.parcelaId       = actividad.cultivo?.parcela?.id ?? undefined;
        this.cultivoId       = actividad.cultivo_id;
        this.tipo_actividad  = actividad.tipo_actividad;
        this.fecha_actividad = actividad.fecha_actividad;

        // Extraer el campo “texto” de actividad.detalles (que viene como JSON)
        try {
          const detallesObj = typeof actividad.detalles === 'string'
            ? JSON.parse(actividad.detalles)
            : actividad.detalles;
          this.detallesTexto = detallesObj?.texto ?? '';
        } catch {
          // Si no es un JSON válido, dejamos el texto vacío
          this.detallesTexto = '';
        }

        // Filtramos las listas para los <select>
        this.parcelasFiltradas = this.parcelas.filter(p => p.usuario_id === this.usuarioId);
        this.cultivosFiltrados  = this.cultivosAll.filter(c => c.parcela_id === this.parcelaId);

        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
        this.loading = false;
      }
    });
  }

  // Cuando el usuario cambia en el dropdown, filtramos parcelas y reseteamos cultivo
  onUserChange(): void {
    this.parcelaId = undefined;
    this.cultivoId = undefined;
    this.parcelasFiltradas = this.parcelas.filter(p => p.usuario_id === this.usuarioId);
    this.cultivosFiltrados  = [];
  }

  // Cuando la parcela cambia, filtramos cultivos y reseteamos cultivoId
  onParcelaChange(): void {
    this.cultivoId = undefined;
    this.cultivosFiltrados = this.cultivosAll.filter(c => c.parcela_id === this.parcelaId);
  }

  // Guardar cambios (envía PUT /api/actividades/{id})
  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.usuarioId ||
      !this.parcelaId ||
      !this.cultivoId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios antes de guardar.';
      return;
    }

    this.loading = true;
    this.error   = null;

    // Empaquetamos “detalles” como JSON con clave “texto”
    const payload = {
      usuario_id:      this.usuarioId,
      cultivo_id:      this.cultivoId,
      tipo_actividad:  this.tipo_actividad,
      fecha_actividad: this.fecha_actividad,
      detalles:        JSON.stringify({ texto: this.detallesTexto })
    };

    this.actSvc.update(this.actividadId, payload).subscribe({
      next: () => {
        // Después de actualizar, recargamos todo para reflejar los cambios
        this.ngOnInit();
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Error al guardar la actividad.';
      }
    });
  }

  // Eliminar actividad con confirmación
  eliminarActividad(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }
    this.actSvc.delete(this.actividadId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/admin/actividades']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar la actividad.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/admin/actividades']);
  }

  /** Devuelve la URL pública de un adjunto */
  getAdjuntoUrl(ruta: string): string {
    return `${environment.apiUrl}/storage/${ruta}`;
  }
}
