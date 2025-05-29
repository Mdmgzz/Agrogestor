// src/app/features/adminCultivos/admin-cultivos-create.component.ts
import { Component, OnInit, AfterViewInit }     from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { FormsModule, NgForm }                  from '@angular/forms';
import { Router, RouterModule }                 from '@angular/router';
import * as L                                   from 'leaflet';
import { CultivoService }                       from '../../core/services/cultivo.service';
import { ParcelaService, Parcela }              from '../../core/services/parcela.service';
import { Usuario }                              from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-cultivos-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-cultivos-create.component.html',
})
export class AdminCultivoCreateComponent implements OnInit, AfterViewInit {
  // dropdown de parcelas
  parcelas: Parcela[] = [];
  filteredParcelas: Parcela[] = [];
  parcelaSearch = '';
  showParcelaDropdown = false;
  selectedParcelaId?: number;

  // campos del cultivo
  variedad = '';
  fechaSiembra?: string;
  superficie?: number;

  // coordenadas
  lat?: number;
  lng?: number;

  // ui state
  loading = false;
  error: string | null = null;
  mapExpanded = false;

  private map!: L.Map;
  private markerLayer = L.layerGroup();

  constructor(
    private cultivoSvc : CultivoService,
    private parcelaSvc : ParcelaService,
    private router     : Router
  ) {
    // corregir rutas de iconos Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl:       'assets/marker-icon.png',
      shadowUrl:     'assets/marker-shadow.png'
    });
  }

  ngOnInit(): void {
    this.parcelaSvc.getAll().subscribe({
      next: list => {
        // esperamos que cada Parcela tenga p.usuario
        this.parcelas = list;
        this.filteredParcelas = list;
      },
      error: () => {
        this.error = 'No se pudieron cargar las parcelas';
      }
    });
  }

  ngAfterViewInit(): void {
    const container = document.getElementById('map');
    if (!container) return;

    this.map = L.map('map', {
      center: [40.0, -3.7],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        })
      ]
    });

    setTimeout(() => this.map.invalidateSize(), 300);

    this.markerLayer.addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.lat = e.latlng.lat;
      this.lng = e.latlng.lng;
      this.markerLayer.clearLayers();
      L.marker(e.latlng).addTo(this.markerLayer);
    });
  }

  /** Filtra el dropdown por usuario, parcela o propietario */
  filterParcelas(): void {
    const term = this.parcelaSearch.toLowerCase().trim();
    this.filteredParcelas = this.parcelas.filter(p =>
      p.usuario.nombre.toLowerCase().includes(term)
      || p.nombre.toLowerCase().includes(term)
      || p.propietario.toLowerCase().includes(term)
    );
  }

  /** Selecciona una parcela y muestra técnico — parcela — propietario */
  selectParcela(p: Parcela): void {
    this.selectedParcelaId = p.id;
    this.parcelaSearch = `${p.usuario.nombre} — ${p.nombre} — ${p.propietario}`;
    this.showParcelaDropdown = false;
  }

  /** Alterna tamaño del mapa y fuerza redraw */
  toggleMapSize(): void {
    this.mapExpanded = !this.mapExpanded;
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  crearCultivo(form: NgForm): void {
    if (!this.selectedParcelaId) {
      this.error = 'Debes seleccionar una parcela.';
      return;
    }
    if (form.invalid) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }
    if (this.lat == null || this.lng == null) {
      this.error = 'Selecciona ubicación en el mapa.';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload = {
      parcela_id:    this.selectedParcelaId,
      variedad:      this.variedad,
      fecha_siembra: this.fechaSiembra,
      superficie_ha: this.superficie,
      latitud:       this.lat,
      longitud:      this.lng
    };

    this.cultivoSvc.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/admin/cultivos']);
      },
      error: err => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          this.error = Object.values(err.error.errors).flat().join(' • ');
        } else {
          this.error = err.error?.message || 'Error al crear el cultivo';
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/admin/cultivos']);
  }
}
