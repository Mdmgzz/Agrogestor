// src/app/features/tecnicoCultivo/tecnico-cultivo-detalle.component.ts
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of }      from 'rxjs';
import { catchError }        from 'rxjs/operators';
import * as L                from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { CultivoService, Cultivo }     from '../../core/services/cultivo.service';
import { ParcelaService, Parcela }     from '../../core/services/parcela.service';
import { ActividadService, Actividad } from '../../core/services/actividad.service';
import { AuthService, Usuario }        from '../../core/services/auth.service';

import { FullScreenMapComponent } from './full-screen-map.component';

@Component({
  standalone: true,
  selector: 'app-tecnico-cultivo-detalle',
  imports: [CommonModule, FormsModule, RouterModule, FullScreenMapComponent],
  templateUrl: './tecnico-cultivo-detalle.component.html',
})
export class TecnicoCultivoDetalleComponent implements OnInit {
  cultivo?: Cultivo;
  loading = true;
  error: string | null = null;

  // Campos editables
  variedad = '';
  fecha_siembra?: string;
  superficie_ha?: string;

  // Ubicación en el mapa
  lat?: number;
  lng?: number;

  // Parcela asociada (solo lectura para el técnico)
  parcela?: Parcela;

  // Actividades asociadas
  actividades: Actividad[] = [];

  // Control para mapa full-screen 
  mapaExpandido = false;

  private map!: L.Map;
  private marker!: L.Marker;
  private cultivoIdParam!: number;
  private tecnicoActual?: Usuario;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cultivoSvc: CultivoService,
    private parcelaSvc: ParcelaService,
    private actividadSvc: ActividadService,
    private authSvc: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Configurar iconos Leaflet para el mapa pequeño
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl:       'assets/marker-icon.png',
      shadowUrl:     'assets/marker-shadow.png'
    });
  }

  ngOnInit(): void {
    // 1) Obtener ID de cultivo de la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/tecnico/cultivos']);
      return;
    }
    this.cultivoIdParam = +idParam;

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
    // Paralelamente obtengo todos los datos necesarios
    forkJoin({
      cultivo: this.cultivoSvc.getById(this.cultivoIdParam).pipe(
        catchError(() => of(null as Cultivo | null))
      )
    }).subscribe({
      next: ({ cultivo }) => {
        if (!cultivo) {
          this.error = 'Cultivo no encontrado o sin permisos.';
          this.loading = false;
          return;
        }

        // El backend filtra para que el técnico solo vea su propio cultivo
        this.cultivo = cultivo;
        this.variedad = cultivo.variedad;
        this.fecha_siembra = cultivo.fecha_siembra;
        this.superficie_ha = cultivo.superficie_ha?.toString() ?? '';
        this.lat = cultivo.latitud ?? 0;
        this.lng = cultivo.longitud ?? 0;

        // Cargar la parcela (solo lectura)
        this.parcelaSvc.getById(cultivo.parcela_id).subscribe({
          next: p => (this.parcela = p),
          error: () => {
            // aunque falle, seguimos mostrando el cultivo
            this.parcela = undefined;
          }
        });

        // Cargar actividades de este cultivo
        this.loadActividades();

        this.loading = false;

        // Inicializar mapa pequeño una vez lat/lng estén definidos
        setTimeout(() => this.initMap(), 50);
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
        this.loading = false;
      }
    });
  }

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

  volver(): void {
    this.router.navigate(['/dashboard/tecnico/cultivos']);
  }

  irActividad(id: number): void {
    // Por ahora enlaza a la ruta de detalle de actividad de admin
    this.router.navigate(['/dashboard/admin/actividades', id]);
  }

  isInvalidSuperficie(): boolean {
    const num = Number(this.superficie_ha);
    return isNaN(num) || num <= 0;
  }

  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.variedad.trim() ||
      !this.fecha_siembra ||
      !this.superficie_ha?.trim() ||
      this.isInvalidSuperficie() ||
      this.lat == null ||
      this.lng == null
    ) {
      this.error = 'Completa todos los campos obligatorios con datos válidos.';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload: Partial<Cultivo> = {
      variedad: this.variedad.trim(),
      fecha_siembra: this.fecha_siembra,
      superficie_ha: Number(this.superficie_ha),
      latitud: this.lat,
      longitud: this.lng
    };

    this.cultivoSvc.update(this.cultivoIdParam, payload).subscribe({
      next: () => {
        // Al guardar, volver a la lista de cultivo del técnico
        this.router.navigate(['/dashboard/tecnico/cultivos']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al guardar el cultivo.';
        this.loading = false;
      }
    });
  }

  eliminarCultivo(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este cultivo?')) {
      return;
    }
    this.cultivoSvc.delete(this.cultivoIdParam).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tecnico/cultivos']);
      },
      error: err => {
        alert(err.error?.message || 'Error al eliminar el cultivo.');
      }
    });
  }

  /** Inicializa Leaflet en `<div id="map">` (mapa pequeño) */
  private initMap(): void {
    if (this.lat == null || this.lng == null) {
      return;
    }
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      return;
    }
    // Si ya existía un mapa, lo removemos
    if (this.map) {
      this.map.remove();
    }
    // Crear el mapa pequeño
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

    // Crear el marcador draggable en el mapa pequeño
    this.marker = L.marker([this.lat, this.lng], { draggable: true }).addTo(this.map);
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

  abrirMapaFullscreen(): void {
    this.mapaExpandido = true;
    this.cdr.detectChanges();
  }

  cerrarMapa(): void {
    this.mapaExpandido = false;
    if (this.map && this.marker && this.lat != null && this.lng != null) {
      this.map.setView([this.lat, this.lng], this.map.getZoom());
      this.marker.setLatLng([this.lat, this.lng]);
      setTimeout(() => this.map.invalidateSize(), 50);
    }
  }

  guardarUbicacion(): void {
    // Al hacer click en “Guardar” dentro del modal, simplemente cerramos y redibujamos
    this.cerrarMapa();
  }

  onCoordsChanged(event: { lat: number; lng: number }): void {
    this.lat = event.lat;
    this.lng = event.lng;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent) {
    if (this.mapaExpandido) {
      this.cerrarMapa();
    }
  }
}
