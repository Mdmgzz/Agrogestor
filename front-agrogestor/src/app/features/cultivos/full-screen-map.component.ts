// src/app/features/adminCultivos/full-screen-map.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  standalone: true,
  selector: 'app-full-screen-map',
  templateUrl: './full-screen-map.component.html',
})
export class FullScreenMapComponent implements AfterViewInit, OnDestroy {
  @Input() lat!: number;
  @Input() lng!: number;

  /** Emitir nuevas coordenadas al padre */
  @Output() coordsChanged = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild('mapFull', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private mapFullInstance?: L.Map;
  private markerFull?: L.Marker;

  constructor() {
    // Configurar iconos Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl:       'assets/marker-icon.png',
      shadowUrl:     'assets/marker-shadow.png'
    });
  }

  ngAfterViewInit(): void {
    // Al llegar aquí, <div id="mapFull"> ya existe y mide >0×0
    this.mapFullInstance = L.map('mapFull', {
      center: [this.lat, this.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.mapFullInstance);

    this.markerFull = L.marker([this.lat, this.lng], { draggable: true }).addTo(this.mapFullInstance);
    this.markerFull.on('dragend', () => {
      const pos = this.markerFull!.getLatLng();
      this.lat = pos.lat;
      this.lng = pos.lng;
      this.coordsChanged.emit({ lat: this.lat, lng: this.lng });
    });

    this.mapFullInstance.on('click', (e: L.LeafletMouseEvent) => {
      this.lat = e.latlng.lat;
      this.lng = e.latlng.lng;
      this.markerFull!.setLatLng(e.latlng);
      this.coordsChanged.emit({ lat: this.lat, lng: this.lng });
    });

    // Forzar invalidateSize en caso de animaciones
    setTimeout(() => {
      this.mapFullInstance!.invalidateSize(true);
    }, 50);
  }

  ngOnDestroy(): void {
    if (this.mapFullInstance) {
      this.mapFullInstance.remove();
      this.mapFullInstance = undefined;
    }
  }
}
