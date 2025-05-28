// src/app/core/services/cultivo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cultivo {
  id: number;
  parcela_id: number;
  variedad: string;
  fecha_siembra: string; // ISO
  created_at?: string;
  updated_at?: string;
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
