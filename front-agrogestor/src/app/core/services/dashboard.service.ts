// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// Interfaz que define la forma de los datos que esperamos
export interface AdminStats {
  usuarios:    number;
  parcelas:    number;
  cultivos:    number;
  actividades: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Base URL de tu API, según tu environment
  private baseUrl = environment.apiUrl;  // e.g. "http://localhost:8000"

  constructor(private http: HttpClient) {}

  /**
   * Llama a GET /api/dashboard/admin-stats y devuelve un Observable
   * con los conteos para Usuarios, Parcelas, Cultivos y Actividades.
   */
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(
      `${this.baseUrl}/api/dashboard/admin-stats`
    );
  }

  // Más adelante podrías añadir:
  // getTecnicoStats(): Observable<TecnicoStats> { … }
  // getInspectorStats(): Observable<InspectorStats> { … }
}
``
