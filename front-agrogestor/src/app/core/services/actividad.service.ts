// src/app/core/services/actividad.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
}

export interface Parcela {
  id: number;
  propietario: string;
}

export interface Actividad {
  id: number;
  parcela_id: number;
  usuario_id: number;
  tipo_actividad: string;
  fecha_actividad: string;  // ISO date string
  detalles: string;
  usuario?: Usuario;
  parcela?: Parcela;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private readonly baseUrl = `${environment.apiUrl}/api/actividades`;

  constructor(private http: HttpClient) {}

  /** Lista todas las actividades (incluyendo relaciones si el backend las envía) */
  getAll(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.baseUrl);
  }

  /** Trae una actividad por ID */
  getById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.baseUrl}/${id}`);
  }

  /** Crea una nueva actividad */
  create(payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.post<Actividad>(this.baseUrl, payload);
  }

  /** Actualiza una actividad existente */
  update(id: number, payload: Partial<Actividad>): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.baseUrl}/${id}`, payload);
  }

  /** Elimina una actividad */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
