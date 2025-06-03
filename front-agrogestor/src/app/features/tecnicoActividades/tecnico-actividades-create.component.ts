import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule }from '@angular/router';

import { ActividadService }    from '../../core/services/actividad.service';
import { ParcelaService, Parcela }      from '../../core/services/parcela.service';
import { CultivoService, Cultivo }      from '../../core/services/cultivo.service';
import { AuthService, Usuario }         from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-actividades-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-actividades-create.component.html',
})
export class TecnicoActividadesCreateComponent implements OnInit {
  tecnico?: Usuario;

  parcelas: Parcela[]       = [];
  cultivosAll: Cultivo[]    = [];

  parcelasFiltradas: Parcela[] = [];
  cultivosFiltrados: Cultivo[] = [];

  parcelaId?: number;
  cultivoId?: number;

  tipo_actividad = '';
  fecha_actividad?: string;
  detalles = '';

  loading = false;
  error: string | null = null;

  constructor(
    private authSvc:    AuthService,
    private parcelaSvc: ParcelaService,
    private cultivoSvc: CultivoService,
    private actSvc:     ActividadService,
    private router:     Router
  ) {}

  ngOnInit(): void {
    this.authSvc.me().subscribe({
      next: user => {
        this.tecnico = user;
        this.loadParcelas();
      },
      error: () => {
        this.error = 'No se pudo verificar el usuario.';
      }
    });
  }

  private loadParcelas(): void {
    if (!this.tecnico) return;
    this.parcelaSvc.getAll().subscribe({
      next: list => {
        // solo aquellas parcelas pertenecientes al técnico autenticado
        this.parcelas = list.filter(p => p.usuario_id === this.tecnico!.id);
        this.parcelasFiltradas = [...this.parcelas];
      },
      error: () => {
        this.error = 'No se pudieron cargar parcelas.';
      }
    });
    // cargamos además todos los cultivos (filtramos más tarde)
    this.cultivoSvc.getAll().subscribe({
      next: list => { this.cultivosAll = list; },
      error: () => {
        this.error = 'No se pudieron cargar cultivos.';
      }
    });
  }

  onParcelaChange(): void {
    this.cultivoId = undefined;
    if (!this.parcelaId) {
      this.cultivosFiltrados = [];
      return;
    }
    // mostrar solo cultivos de la parcela seleccionada
    this.cultivosFiltrados = this.cultivosAll.filter(
      c => c.parcela_id === this.parcelaId
    );
  }

  crearActividad(form: NgForm): void {
    if (
      form.invalid ||
      !this.parcelaId ||
      !this.cultivoId ||
      !this.tipo_actividad ||
      !this.fecha_actividad
    ) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload = {
      usuario_id:      this.tecnico!.id,
      cultivo_id:      this.cultivoId,
      tipo_actividad:  this.tipo_actividad,
      fecha_actividad: this.fecha_actividad,
      detalles:        JSON.stringify({ texto: this.detalles })
    };

    this.actSvc.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/tecnico/actividades']);
      },
      error: err => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          const mensajes = Object.values(err.error.errors).flat();
          this.error = mensajes.length ? (mensajes[0] as string) : 'Error de validación';
        } else {
          this.error = err.error?.message || 'Error al crear la actividad';
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/tecnico/actividades']);
  }
}
