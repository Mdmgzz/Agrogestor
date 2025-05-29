// src/app/features/tecnicoParcelas/tecnico-parcela-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { Router, RouterModule }      from '@angular/router';
import { ParcelaService }            from '../../core/services/parcela.service';
import { AuthService, Usuario }      from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-parcela-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-parcela-create.component.html',
})
export class TecnicoParcelaCreateComponent implements OnInit {
  nombre     = '';
  propietario= '';
  superficie?: number;

  loading = false;
  error: string | null = null;

  usuario?: Usuario;

  constructor(
    private svc: ParcelaService,
    private router: Router,
    private authService: AuthService,
    private form: FormsModule
  ) {}

  ngOnInit(): void {
    // obtenemos el usuario logueado
    this.authService.me().subscribe({
      next: user => this.usuario = user,
      error: ()   => this.error = 'No se pudo verificar el usuario.'
    });
  }

  crearParcela(): void {
    if (!this.usuario) {
      this.error = 'Usuario no autenticado.';
      return;
    }
    

    this.error   = null;
    this.loading = true;

    const payload = {
      usuario_id:    this.usuario.id,
      nombre:        this.nombre,
      propietario:   this.propietario,
      superficie_ha: this.superficie
    };

    this.svc.create(payload).subscribe({
      next: p => {
        this.loading = false;
        this.router.navigate(['/dashboard/tecnico/parcelas']);
      },
      error: err => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          this.error = Object.values(err.error.errors).flat().join(' • ');
        } else {
          this.error = err?.error?.message || 'Error al crear la parcela';
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/tecnico']);
  }
}
