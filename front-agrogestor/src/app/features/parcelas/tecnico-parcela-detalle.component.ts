import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { ParcelaService, Parcela } from '../../core/services/parcela.service';
import { AuthService, Usuario }    from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-parcela-detalle',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-parcela-detalle.component.html',
})
export class TecnicoParcelaDetalleComponent implements OnInit {
  parcela?: Parcela;
  loading = true;
  error: string | null = null;

  // Campos para edición
  nombre: string = '';
  propietario: string = '';
  superficie_ha: string = '';

  // Usuario autenticado (se usa solo para verificar que le pertenece)
  usuario?: Usuario;

  // Cultivos asociados
  cultivos: NonNullable<Parcela['cultivos']> = [];

  private parcelaIdParam!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelaSvc: ParcelaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1) Obtener usuario logueado
    this.authService.me().subscribe({
      next: u => this.usuario = u,
      error: () => {
        this.error = 'No se pudo verificar el usuario.';
        this.loading = false;
      }
    });

    // 2) Obtener ID desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/tecnico/parcelas']);
      return;
    }
    this.parcelaIdParam = +idParam;

    // 3) Cargar datos de la parcela
    this.parcelaSvc.getById(this.parcelaIdParam).subscribe({
      next: data => {
        // Opción extra: asegurar que la parcela pertenece al técnico
        if (this.usuario && data.usuario_id !== this.usuario.id) {
          this.error = 'No tienes permiso para ver esta parcela.';
          this.loading = false;
          return;
        }

        this.parcela       = data;
        this.nombre        = data.nombre;
        this.propietario   = data.propietario;
        this.superficie_ha = data.superficie_ha.toString();
        this.cultivos      = data.cultivos || [];
        this.loading       = false;
      },
      error: err => {
        this.error = err.error?.message || 'Error al cargar la parcela.';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/tecnico/parcelas']);
  }

  irCultivo(cultivoId: number): void {
    this.router.navigate(['/dashboard/tecnico/cultivos', cultivoId]);
  }

  isInvalidSuperficie(): boolean {
    const num = Number(this.superficie_ha);
    return isNaN(num) || num <= 0;
  }

  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.nombre.trim() ||
      !this.propietario.trim() ||
      !this.superficie_ha.trim() ||
      this.isInvalidSuperficie()
    ) {
      this.error = 'Completa todos los campos obligatorios con valores válidos.';
      return;
    }

    this.loading = true;
    this.error = null;

    const superficieNum = Number(this.superficie_ha);
    const payload: Partial<Parcela> = {
      nombre: this.nombre.trim(),
      propietario: this.propietario.trim(),
      superficie_ha: superficieNum
      // (No enviamos usuario_id porque el backend forzará al técnico)
    };

    this.parcelaSvc.update(this.parcelaIdParam, payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/parcelas']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al guardar cambios.';
        this.loading = false;
      }
    });
  }

  eliminarParcela(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta parcela?')) {
      return;
    }
    this.parcelaSvc.delete(this.parcelaIdParam).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/parcelas']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar la parcela.');
      }
    });
  }
}
