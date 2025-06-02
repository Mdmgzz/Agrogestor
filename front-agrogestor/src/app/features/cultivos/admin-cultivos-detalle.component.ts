// src/app/features/adminCultivos/admin-cultivos-detalle.component.ts

import { Component, OnInit }            from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule, NgForm }          from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of }                 from 'rxjs';
import { catchError }                   from 'rxjs/operators';
import * as L                            from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { CultivoService, Cultivo }       from '../../core/services/cultivo.service';
import { ParcelaService, Parcela }       from '../../core/services/parcela.service';
import { ActividadService, Actividad }   from '../../core/services/actividad.service';

@Component({
  standalone: true,
  selector: 'app-admin-cultivos-detalle',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-cultivos-detalle.component.html',
})
export class AdminCultivosDetalleComponent implements OnInit {
  cultivo?: Cultivo;
  loading = true;
  error: string | null = null;

  parcelas: Parcela[] = [];
  parcelasFiltradas: Parcela[] = [];

  parcelaId?:       number;
  variedad = '';
  fecha_siembra?:   string;
  superficie_ha?:   string;

  lat?: number;
  lng?: number;

  private map!: L.Map;
  private markerLayer = L.layerGroup();
  private marker!: L.Marker;

  actividades: Actividad[] = [];

  mapaExpandido = false;

  private cultivoIdParam!: number;

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private cultivoSvc:     CultivoService,
    private parcelaSvc:     ParcelaService,
    private actividadSvc:   ActividadService
  ) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl:       'assets/marker-icon.png',
      shadowUrl:     'assets/marker-shadow.png'
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/admin/cultivos']);
      return;
    }
    this.cultivoIdParam = +idParam;

    forkJoin({
      parcelas: this.parcelaSvc.getAll().pipe(catchError(() => of([] as Parcela[]))),
      cultivo: this.cultivoSvc.getById(this.cultivoIdParam).pipe(
        catchError(() => of(null as Cultivo | null))
      )
    }).subscribe({
      next: ({ parcelas, cultivo }) => {
        this.parcelas = parcelas;

        if (!cultivo) {
          this.error = 'Cultivo no encontrado o sin permisos.';
          this.loading = false;
          return;
        }

        this.cultivo = cultivo;
        this.parcelaId     = cultivo.parcela_id;
        this.variedad      = cultivo.variedad;
        this.fecha_siembra = cultivo.fecha_siembra;
        this.superficie_ha = cultivo.superficie_ha?.toString() ?? '';
        this.lat = cultivo.latitud ?? 0;
        this.lng = cultivo.longitud ?? 0;
        this.parcelasFiltradas = [...this.parcelas];

        this.loadActividades();
        this.loading = false;

        // Crear el mapa pequeño tras un breve retardo
        setTimeout(() => {
          this.initMap();
        }, 50);
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
        this.loading = false;
      }
    });
  }

  /** Inicializa Leaflet en el div#map (mapa pequeño) */
  private initMap(): void {
    if (this.lat == null || this.lng == null) return;
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [this.lat, this.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerLayer = L.layerGroup();
    this.markerLayer.addTo(this.map);

    this.marker = L.marker([this.lat, this.lng], { draggable: true }).addTo(this.markerLayer);
    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.lat = pos.lat;
      this.lng = pos.lng;
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.lat = e.latlng.lat;
      this.lng = e.latlng.lng;
      this.marker.setLatLng(e.latlng);
    });

    this.map.invalidateSize();
  }

  /**
   * Inicializa Leaflet en el div#mapFull (modal).
   * Se llama cada vez que abrimos el modal para asegurar un redraw correcto.
   */
  initMapFullScreen(): void {
    if (this.lat == null || this.lng == null) return;
    const fullContainer = document.getElementById('mapFull');
    if (!fullContainer) return;

    // Si existía un mapa Full, lo destruimos
    try {
      (window as any).mapFull.remove();
    } catch {}

    // Crear el mapa dentro del contenedor modal (80vw × 70vh)
    const mapFull = L.map('mapFull', {
      center: [this.lat, this.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true
    });
    (window as any).mapFull = mapFull;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapFull);

    const markerFull = L.marker([this.lat, this.lng], { draggable: true }).addTo(mapFull);
    markerFull.on('dragend', () => {
      const pos = markerFull.getLatLng();
      this.lat = pos.lat;
      this.lng = pos.lng;
      if (this.marker) {
        this.marker.setLatLng([this.lat, this.lng]);
      }
    });

    mapFull.on('click', (e: L.LeafletMouseEvent) => {
      this.lat = e.latlng.lat;
      this.lng = e.latlng.lng;
      markerFull.setLatLng(e.latlng);
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      }
    });

    // Forzar redibujo un poco después:
    setTimeout(() => {
      mapFull.invalidateSize(true);
    }, 100);
  }

  /** Abre el modal y vuelve a inicializar el mapa grande */
  abrirMapaFullscreen(): void {
    this.mapaExpandido = true;
    // Esperar a que Angular monte el modal en el DOM
    setTimeout(() => this.initMapFullScreen(), 120);
  }

  /** Cierra el modal */
  cerrarMapa(): void {
    this.mapaExpandido = false;
  }

  /** Carga todas las actividades y filtra por cultivo_id */
  private loadActividades(): void {
    this.actividadSvc.getAll().subscribe({
      next: data => {
        this.actividades = data.filter(a => a.cultivo_id === this.cultivoIdParam);
      },
      error: () => {
        this.actividades = [];
      }
    });
  }

  // Guardar cambios (PUT /api/cultivos/{id})
  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.parcelaId ||
      !this.variedad ||
      !this.fecha_siembra ||
      !this.superficie_ha ||
      this.lat == null ||
      this.lng == null
    ) {
      this.error = 'Completa todos los campos obligatorios antes de guardar.';
      return;
    }

    this.loading = true;
    this.error   = null;

    const superficieNum = Number(this.superficie_ha);

    const payload: Partial<Cultivo> = {
      parcela_id:    this.parcelaId,
      variedad:      this.variedad,
      fecha_siembra: this.fecha_siembra,
      superficie_ha: superficieNum,
      latitud:       this.lat,
      longitud:      this.lng
    };

    this.cultivoSvc.update(this.cultivoIdParam, payload).subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Error al guardar el cultivo.';
      }
    });
  }

  // Eliminar cultivo con confirmación
  eliminarCultivo(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este cultivo?')) {
      return;
    }
    this.cultivoSvc.delete(this.cultivoIdParam).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/admin/cultivos']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar el cultivo.');
      }
    });
  }

  // Volver al listado de cultivos
  volver(): void {
    this.router.navigate(['/dashboard/admin/cultivos']);
  }

  // Redirigir a detalle de actividad
  irActividad(id: number): void {
    this.router.navigate(['/dashboard/admin/actividades', id]);
  }
}
