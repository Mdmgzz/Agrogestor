// src/app/core/services/adjunto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Adjunto {
  id: number;
  actividad_id: number;
  ruta_archivo: string;
  tipo_archivo: 'imagen' | 'documento';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdjuntoService {
  private readonly baseUrl = `${environment.apiUrl}/api/actividades`;

  constructor(private http: HttpClient) {}

  /**
   * Sube uno o varios archivos para la actividad indicada.
   * @param actividadId ID de la actividad
   * @param files FileList de los archivos seleccionados
   */
  upload(actividadId: number, files: FileList): Observable<Adjunto[]> {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('archivos[]', file));
    return this.http.post<Adjunto[]>(`${this.baseUrl}/${actividadId}/adjuntos`, formData);
  }

  /**
   * Lista los adjuntos asociados a una actividad.
   * @param actividadId ID de la actividad
   */
  list(actividadId: number): Observable<Adjunto[]> {
    return this.http.get<Adjunto[]>(`${this.baseUrl}/${actividadId}/adjuntos`);
  }

  /**
   * Elimina un adjunto por su ID.
   * @param id ID del adjunto
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/adjuntos/${id}`);
  }
}
