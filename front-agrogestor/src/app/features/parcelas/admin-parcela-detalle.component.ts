import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { ParcelaService, Parcela } from '../../core/services/parcela.service';
import { UserService, Usuario }    from '../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-admin-parcela-detalle',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-parcela-detalle.component.html',
})
export class AdminParcelaDetalleComponent implements OnInit {
  parcela?: Parcela;
  loading = true;
  error: string | null = null;

  // Campos para el formulario
  nombre: string = '';
  propietario: string = '';
  superficie_ha: string = '';

  // Ahora solo usuarioId en lugar de userSearch
  usuarioId?: number;

  // Listado completo de usuarios
  usuarios: Usuario[] = [];

  // Cultivos asociados
  cultivos: NonNullable<Parcela['cultivos']> = [];

  private parcelaIdParam!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelaSvc: ParcelaService,
    private userSvc: UserService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/admin/parcelas']);
      return;
    }
    this.parcelaIdParam = +idParam;

    // 1) Cargar usuarios
    this.userSvc.getAll().subscribe({
      next: users => {
        this.usuarios = users;
      },
      error: () => {
        this.usuarios = [];
      }
    });

    // 2) Cargar datos de la parcela
    this.parcelaSvc.getById(this.parcelaIdParam).subscribe({
      next: data => {
        this.parcela       = data;
        this.nombre        = data.nombre;
        this.propietario   = data.propietario;
        this.superficie_ha = data.superficie_ha.toString();
        this.usuarioId     = data.usuario?.id;
        this.cultivos      = data.cultivos || [];
        this.loading       = false;
      },
      error: err => {
        this.error = err.error?.message || 'Error al cargar detalle de la parcela.';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/admin/parcelas']);
  }

  irCultivo(cultivoId: number): void {
    this.router.navigate(['/dashboard/admin/cultivos', cultivoId]);
  }

  isInvalidSuperficie(): boolean {
    const num = Number(this.superficie_ha);
    return isNaN(num) || num < 0;
  }

 guardarCambios(form: NgForm): void {
  if (
    form.invalid ||
    !this.usuarioId ||
    !this.nombre.trim() ||
    !this.propietario.trim() ||
    !this.superficie_ha.trim() ||
    this.isInvalidSuperficie()
  ) {
    this.error = 'Completa todos los campos obligatorios con datos válidos antes de guardar.';
    return;
  }

  this.loading = true;
  this.error = null;

  const superficieNum = Number(this.superficie_ha);
  const payload: Partial<Parcela> = {
    nombre: this.nombre.trim(),
    propietario: this.propietario.trim(),
    superficie_ha: superficieNum,
    usuario_id: this.usuarioId
  };

  this.parcelaSvc.update(this.parcelaIdParam, payload).subscribe({
    next: () => {
      // Redirigir a la lista de parcelas en lugar de recargar la misma página
      this.router.navigate(['/dashboard/admin/parcelas']);
    },
    error: err => {
      this.error = err.error?.message || 'Error al guardar los cambios.';
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
        this.router.navigate(['/dashboard/admin/parcelas']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar la parcela.');
      }
    });
  }
}
