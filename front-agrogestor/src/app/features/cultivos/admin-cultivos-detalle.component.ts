import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { CommonModule }            from '@angular/common';
import { FormsModule, NgForm }    from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of }           from 'rxjs';
import { catchError }             from 'rxjs/operators';
import * as L                     from 'leaflet';
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

  usuarios: Usuario[]          = [];
  parcelas: Parcela[]          = [];
  parcelasFiltradas: Parcela[] = [];

  usuarioId?: number;
  parcelaId?: number;
  variedad = '';
  fecha_siembra?: string;
  superficie_ha?: string;

  lat?: number;
  lng?: number;

  actividades: Actividad[] = [];
  mapaExpandido = false;

  private map!: L.Map;
  private marker!: L.Marker;
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
    // Configurar iconos de Leaflet (para el “mapa pequeño”)
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

    // 1) Cargamos en paralelo:
    //    - lista de usuarios
    //    - lista de parcelas
    //    - datos concretos de este cultivo
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

        // 2) Rellenamos los campos “bindables”:
        //    - Obtenemos el usuario del cultivo a partir de cultivo.parcela.usuario_id
        this.usuarioId      = cultivo.parcela!.usuario_id;
        this.parcelaId      = cultivo.parcela_id;
        this.variedad       = cultivo.variedad;
        this.fecha_siembra  = cultivo.fecha_siembra;
        this.superficie_ha  = cultivo.superficie_ha?.toString() ?? '';
        this.lat            = cultivo.latitud ?? 0;
        this.lng            = cultivo.longitud ?? 0;

        // 3) Filtramos las parcelas que correspondan a ese usuario:
        this.parcelasFiltradas = this.parcelas.filter(
          p => p.usuario_id === this.usuarioId
        );

        // 4) Carga de actividades asociadas a este cultivo
        this.loadActividades();

        this.loading = false;

        // 5) Inicializar mapa pequeño (tras un pequeño timeout)
        setTimeout(() => this.initMap(), 50);
      },
      error: () => {
        this.error = 'Error al cargar datos del servidor.';
        this.loading = false;
      }
    });
  }

  /** Cuando el usuario cambia en el dropdown, filtramos nuevamente las parcelas */
  onUserChange(): void {
    this.parcelaId = undefined;
    this.parcelasFiltradas = this.parcelas.filter(
      p => p.usuario_id === this.usuarioId
    );
  }

  /** Carga las actividades asociadas a este cultivo (filtrando por cultivo_id) */
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

    // El backend de actualización solo espera los campos relevantes:
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
        // Recargamos todo para que se vean los nuevos datos
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
      next: () => this.router.navigate(['/dashboard/admin/cultivos']),
      error: err => alert(err.error?.message || 'Error al eliminar el cultivo.')
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
    if (this.lat == null || this.lng == null) return;
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    if (this.map) this.map.remove();

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
