import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ParcelaService } from '../../core/services/parcela.service';

@Component({
  standalone: true,
  selector: 'app-tecnico-parcela-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tecnico-parcela-create.component.html',
})
export class TecnicoParcelaCreateComponent implements OnInit {
  nombre = '';
  propietario = '';
  superficie?: number;     // ← aquí
  geojson = '{}';

  loading = false;
  error: string | null = null;

  constructor(private svc: ParcelaService, private router: Router) {}

  ngOnInit(): void {}

  crearParcela(): void {
    this.error = null;
    this.loading = true;

    this.svc.create({
      nombre: this.nombre,
      propietario: this.propietario,
      superficie_ha: this.superficie,
      geojson: this.geojson
    }).subscribe({
      next: (p) => {
        this.loading = false;
        this.router.navigate(['/dashboard/parcelas', p.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al crear la parcela';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/tecnico']);
  }
}
