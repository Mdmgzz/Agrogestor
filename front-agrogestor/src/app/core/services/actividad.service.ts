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

  /** Obtener todas las actividades */
  getAll(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.baseUrl);
  }

  /** Obtener actividad por ID */
  getById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.baseUrl}/${id}`);
  }

  /** Crear actividad SIN adjuntos (JSON puro) */
  create(payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.post<Actividad>(this.baseUrl, payload);
  }

  /**
   * Crear actividad CON adjuntos (multipart/form-data).
   * Debe incluir en FormData los campos:
   *    usuario_id, cultivo_id, tipo_actividad, fecha_actividad, detalles (JSON string)
   *    y archivos en 'adjuntos[]'
   */
  createConAdjuntos(formData: FormData): Observable<Actividad> {
    return this.http.post<Actividad>(this.baseUrl, formData);
  }

  /** Actualizar SIN adjuntos (JSON puro) */
  update(id: number, payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Actualizar CON adjuntos (multipart/form-data).
   * Laravel acepta POST con _method=PUT. Aquí usamos POST a la URL con '?_method=PUT'.
   */
  updateConAdjuntos(id: number, formData: FormData): Observable<Actividad> {
    return this.http.post<Actividad>(
      `${this.baseUrl}/${id}?_method=PUT`,
      formData
    );
  }

  /** Eliminar una actividad */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
