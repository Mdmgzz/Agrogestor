// src/app/core/services/cultivo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ParcelaMin {
  id: number;
  nombre: string;
  propietario: string;
}

export interface Cultivo {
  id: number;
  usuario_id: number;      // <— agregamos esto
  parcela_id: number;
  variedad: string;
  fecha_siembra: string;
  superficie_ha: number;
  latitud?: number;
  longitud?: number;
  // Relación opcional para acceder a datos de la parcela si el backend la incluye:
  parcela?: ParcelaMin;
}

@Injectable({
  providedIn: 'root'
})
export class CultivoService {
  private readonly baseUrl = `${environment.apiUrl}/api/cultivos`;

  constructor(private http: HttpClient) {}

  /** Lista todos los cultivos */
  getAll(): Observable<Cultivo[]> {
    return this.http.get<Cultivo[]>(this.baseUrl);
  }

  /** Trae un cultivo por ID */
  getById(id: number): Observable<Cultivo> {
    return this.http.get<Cultivo>(`${this.baseUrl}/${id}`);
  }

  /** Crea un cultivo */
  create(payload: Partial<Cultivo>): Observable<Cultivo> {
    return this.http.post<Cultivo>(this.baseUrl, payload);
  }

  /** Actualiza un cultivo */
  update(id: number, payload: Partial<Cultivo>): Observable<Cultivo> {
    return this.http.put<Cultivo>(`${this.baseUrl}/${id}`, payload);
  }

  /** Elimina un cultivo */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
