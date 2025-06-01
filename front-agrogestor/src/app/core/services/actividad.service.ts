// src/app/core/services/actividad.service.ts

import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { environment }  from '../../../environments/environment';

export interface Actividad {
  id: number;
  usuario_id: number;
  cultivo_id: number;
  tipo_actividad: string;
  fecha_actividad: string;
  detalles: any;
  usuario?: any;
  cultivo?: any;
  adjuntos?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private readonly baseUrl = `${environment.apiUrl}/api/actividades`;

  constructor(private http: HttpClient) {}

  /** Obtiene todas las actividades */
  getAll(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.baseUrl);
  }

  /** Obtiene una actividad por ID */
  getById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.baseUrl}/${id}`);
  }

  /** Crear sin adjuntos (JSON puro) */
  create(payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.post<Actividad>(this.baseUrl, payload);
  }

  /**
   * Crear CON adjuntos (multipart/form-data).
   * En Laravel, si usas `FormData` sin `_method`, bastará con un POST normal.
   */
  createConAdjuntos(formData: FormData): Observable<Actividad> {
    // Angular detecta automáticamente multipart/form-data; no hace falta headers manuales
    return this.http.post<Actividad>(this.baseUrl, formData);
  }

  /** Actualizar sin adjuntos (JSON puro) */
  update(id: number, payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Actualizar CON adjuntos (multipart/form-data).
   * Si tu endpoint en Laravel espera `_method=PUT`, puedes usar:
   *    POST /api/actividades/{id}?_method=PUT
   * o directamente un PUT con FormData, según cómo lo tengas configurado.
   */
  updateConAdjuntos(id: number, formData: FormData): Observable<Actividad> {
    // Ejemplo usando _method=PUT en la URL:
    return this.http.post<Actividad>(
      `${this.baseUrl}/${id}?_method=PUT`,
      formData
    );
    // Si tu Laravel acepta un PUT directo con FormData, podrías hacer:
    // return this.http.put<Actividad>(`${this.baseUrl}/${id}`, formData);
  }

  /** Eliminar una actividad */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
