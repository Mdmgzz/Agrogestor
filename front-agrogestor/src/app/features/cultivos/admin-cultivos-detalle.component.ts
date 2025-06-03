// src/app/features/adminCultivos/admin-cultivos-detalle.component.ts

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
import { UserService, Usuario }        from '../../core/services/user.service';

import { FullScreenMapComponent } from './full-screen-map.component';

@Component({
  standalone: true,
  selector: 'app-admin-cultivos-detalle',
  imports: [CommonModule, FormsModule, RouterModule, FullScreenMapComponent],
  templateUrl: './admin-cultivos-detalle.component.html',
})
export class AdminCultivosDetalleComponent implements OnInit {
  cultivo?: Cultivo;
  loading = true;
  error: string | null = null;

  // Lista completa de usuarios y parcelas
  usuarios: Usuario[]    = [];
  parcelas: Parcela[]    = [];
  parcelasFiltradas: Parcela[] = [];

  // Campos bindados al formulario
  usuarioId?:    number;
  parcelaId?:    number;
  variedad = '';
  fecha_siembra?: string;
  superficie_ha?: string;

  // Ubicación en el mapa
  lat?: number;
  lng?: number;

  private map!: L.Map;        // Referencia al mapa pequeño
  private marker!: L.Marker;  // Referencia al marcador del mapa pequeño

  actividades: Actividad[] = [];

  mapaExpandido = false;
  private cultivoIdParam!: number;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private cultivoSvc:   CultivoService,
    private parcelaSvc:   ParcelaService,
    private actividadSvc: ActividadService,
    private userSvc:      UserService,
    private cdr:          ChangeDetectorRef
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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/dashboard/admin/cultivos']);
      return;
    }
    this.cultivoIdParam = +idParam;

    // Primero cargamos usuarios, parcelas y el propio cultivo en paralelo
    forkJoin({
      usuarios: this.userSvc.getAll().pipe(catchError(() => of([] as Usuario[]))),
      parcelas: this.parcelaSvc.getAll().pipe(catchError(() => of([] as Parcela[]))),
      cultivo:  this.cultivoSvc.getById(this.cultivoIdParam).pipe(
        catchError(() => of(null as Cultivo | null))
      )
    }).subscribe({
      next: ({ usuarios, parcelas, cultivo }) => {
        this.usuarios = usuarios;
        this.parcelas = parcelas;

        if (!cultivo) {
          this.error = 'Cultivo no encontrado o sin permisos.';
          this.loading = false;
          return;
        }

        this.cultivo = cultivo;
        // Rellenar campos bindables
        this.usuarioId    = cultivo.usuario_id;         // Ahora sí existe en la interfaz
        this.parcelaId    = cultivo.parcela_id;
        this.variedad     = cultivo.variedad;
        this.fecha_siembra = cultivo.fecha_siembra;
        this.superficie_ha = cultivo.superficie_ha?.toString() ?? '';
        this.lat          = cultivo.latitud ?? 0;
        this.lng          = cultivo.longitud ?? 0;

        // Al cargar la parcela inicial, debemos filtrar según ese usuario
        this.parcelasFiltradas = this.parcelas.filter(
          p => p.usuario_id === this.usuarioId
        );

        this.loadActividades();
        this.loading = false;

        // Inicializar el mapa pequeño (una vez que lat/lng estén definidos).
        setTimeout(() => this.initMap(), 50);
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
        this.loading = false;
      }
    });
  }

  /** Cuando el usuario cambia en el dropdown, filtramos parcelas y reseteamos parcela y cultivo */
  onUserChange(): void {
    this.parcelaId = undefined;
    this.parcelasFiltradas = this.parcelas.filter(
      p => p.usuario_id === this.usuarioId
    );
  }

  /** Carga las actividades asociadas al cultivo actual */
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

  guardarCambios(form: NgForm): void {
    if (
      form.invalid ||
      !this.usuarioId ||
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
      usuario_id:    this.usuarioId,
      parcela_id:    this.parcelaId,
      variedad:      this.variedad,
      fecha_siembra: this.fecha_siembra,
      superficie_ha: superficieNum,
      latitud:       this.lat,
      longitud:      this.lng
    };

    this.cultivoSvc.update(this.cultivoIdParam, payload).subscribe({
      next: () => {
        // Al guardar, recargamos la página para reflejar cambios
        this.ngOnInit();
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Error al guardar el cultivo.';
      }
    });
  }

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

  volver(): void {
    this.router.navigate(['/dashboard/admin/cultivos']);
  }

  irActividad(id: number): void {
    this.router.navigate(['/dashboard/admin/actividades', id]);
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
    // Forzar a Angular a actualizar la vista antes de cualquier operación extra
    this.cdr.detectChanges();
  }

  cerrarMapa(): void {
    this.mapaExpandido = false;
    // Al cerrar el modal, centramos y reposicionamos el mapa pequeño
    if (this.map && this.marker && this.lat != null && this.lng != null) {
      this.map.setView([this.lat, this.lng], this.map.getZoom());
      this.marker.setLatLng([this.lat, this.lng]);
      setTimeout(() => this.map.invalidateSize(), 50);
    }
  }

  /** Este método faltaba en tu componente original */
  guardarUbicacion(): void {
    // Simplemente cierra el modal y reaplica la vista del mapa pequeño
    this.cerrarMapa();
  }

  onCoordsChanged(event: { lat: number; lng: number }): void {
    this.lat = event.lat;
    this.lng = event.lng;
  }

  // Permitir cerrar con la tecla Esc
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent) {
    if (this.mapaExpandido) {
      this.cerrarMapa();
    }
  }
}
