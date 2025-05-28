// src/app/core/services/parcela.service.ts
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
  usuario_id: number;
  superficie_ha: number;
  geojson: any;
  usuario: Usuario;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParcelaService {
  private readonly baseUrl = `${environment.apiUrl}/api/parcelas`;

  constructor(private http: HttpClient) {}

  /** Obtiene todas las parcelas (incluye relación usuario) */
  getAll(): Observable<Parcela[]> {
    return this.http.get<Parcela[]>(this.baseUrl);
  }

  /** Obtiene una parcela por ID */
  getById(id: number): Observable<Parcela> {
    return this.http.get<Parcela>(`${this.baseUrl}/${id}`);
  }

  /** Crea una nueva parcela */
  create(payload: Partial<Parcela>): Observable<Parcela> {
    return this.http.post<Parcela>(this.baseUrl, payload);
  }

  /** Actualiza una parcela */
  update(id: number, payload: Partial<Parcela>): Observable<Parcela> {
    return this.http.put<Parcela>(`${this.baseUrl}/${id}`, payload);
  }

  /** Elimina una parcela */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
