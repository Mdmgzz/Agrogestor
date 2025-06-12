// src/app/features/adminCultivos/admin-cultivos-create.component.ts

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule }                       from '@angular/common';
import { FormsModule, NgForm }                from '@angular/forms';
import { Router, RouterModule }               from '@angular/router';
import * as L                                 from 'leaflet';
import { CultivoService }                     from '../../core/services/cultivo.service';
import { ParcelaService, Parcela }            from '../../core/services/parcela.service';

// 1) Importa UserService y el tipo Usuario
import { UserService, Usuario }               from '../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-admin-cultivos-create',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-cultivos-create.component.html',
})
export class AdminCultivoCreateComponent implements OnInit, AfterViewInit {
  // --- Dropdown de usuarios (nuevo) ---
  allUsuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  userSearch = '';
  showUserDropdown = false;
  selectedUsuario?: Usuario;

  // --- Dropdown de parcelas (existente) ---
  parcelas: Parcela[] = [];
  filteredParcelas: Parcela[] = [];
  parcelaSearch = '';
  showParcelaDropdown = false;
  selectedParcelaId?: number;

  // Campos del cultivo
  variedad = '';
  fechaSiembra?: string;
  superficie?: number;

  // Coordenadas
  lat?: number;
  lng?: number;

  // UI state
  loading = false;
  error: string | null = null;
  mapExpanded = false;

  private map!: L.Map;
  private markerLayer = L.layerGroup();

  // 2) Inyecta UserService junto con los demás servicios
  constructor(
    private cultivoSvc : CultivoService,
    private parcelaSvc : ParcelaService,
    private userSvc    : UserService,
    private router     : Router
  ) {
    // corregir rutas de iconos Leaflet (ya existente)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl:       'assets/marker-icon.png',
      shadowUrl:     'assets/marker-shadow.png'
    });
  }

  ngOnInit(): void {
    // 3) Carga lista de parcelas (igual que antes)
    this.parcelaSvc.getAll().subscribe({
      next: list => {
        this.parcelas = list;
        this.filteredParcelas = list;
      },
      error: () => {
        this.error = 'No se pudieron cargar las parcelas';
      }
    });

    // 4) Carga lista de usuarios para el dropdown de usuarios
    this.userSvc.getAll().subscribe({
      next: list => {
        this.allUsuarios = list;
        this.filteredUsuarios = list;
      },
      error: () => {
        this.error = 'Error al cargar lista de usuarios.';
      }
    });
  }

  ngAfterViewInit(): void {
    // Código de Leaflet (igual que antes)
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

  /** Filtra el dropdown de parcelas (igual que antes) */
  filterParcelas(): void {
    const term = this.parcelaSearch.toLowerCase().trim();
    this.filteredParcelas = this.parcelas.filter(p =>
      p.usuario?.nombre.toLowerCase().includes(term)
      || p.nombre.toLowerCase().includes(term)
      || p.propietario.toLowerCase().includes(term)
    );
  }

  /** Selecciona una parcela (igual que antes) */
  selectParcela(p: Parcela): void {
    this.selectedParcelaId = p.id;
    this.parcelaSearch = `${p.usuario?.nombre} — ${p.nombre} — ${p.propietario}`;
    this.showParcelaDropdown = false;
  }

  /** Alterna tamaño del mapa y fuerza redraw (igual que antes) */
  toggleMapSize(): void {
    this.mapExpanded = !this.mapExpanded;
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  // --- Métodos para el dropdown de usuarios (nuevo) ---

  /** Alterna la visibilidad del dropdown de usuarios */
  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      // Si acabamos de abrirlo, reseteamos el filtro y el texto
      this.filteredUsuarios = this.allUsuarios;
      this.userSearch = '';
    }
  }

  /** Cada vez que cambia el texto de búsqueda, filtra la lista */
  onUserSearchChange(): void {
    const term = this.userSearch.trim().toLowerCase();
    this.filteredUsuarios = this.allUsuarios.filter(u =>
      (`${u.nombre} ${u.apellidos}`).toLowerCase().includes(term)
    );
    this.showUserDropdown = true;
  }

  /** Al hacer clic en un usuario, se guarda la selección */
  selectUsuario(u: Usuario): void {
    this.selectedUsuario = u;
    this.userSearch = `${u.nombre} ${u.apellidos}`;
    this.showUserDropdown = false;
  }

  /** Envía el formulario para crear el cultivo */
  crearCultivo(form: NgForm): void {
    // 5) Valida que haya un usuario seleccionado
    if (!this.selectedUsuario) {
      this.error = 'Debes seleccionar un usuario.';
      return;
    }

    // Valida que haya una parcela seleccionada (igual que antes)
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

    // 6) Prepara el payload incluyendo el usuario_id
    const payload: any = {
      usuario_id:    this.selectedUsuario.id, 
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
