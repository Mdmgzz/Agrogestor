// src/app/core/services/adjunto.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  providedIn: 'root',
})
export class AdjuntoService {
  // BaseUrl apunta a “http://localhost:8000/api/actividades”
  private readonly baseUrl = `${environment.apiUrl}/api/actividades`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/actividades/{actividadId}/adjuntos
   * Devuelve la lista de adjuntos para la actividad.
   */
  list(actividadId: number): Observable<Adjunto[]> {
    return this.http.get<Adjunto[]>(
      `${this.baseUrl}/${actividadId}/adjuntos`
    );
  }

  /**
   * POST /api/actividades/{actividadId}/adjuntos
   * Sube uno o varios archivos PDF (siempre con key "adjuntos[]").
   */
  upload(actividadId: number, files: FileList): Observable<Adjunto[]> {
    const formData = new FormData();
    Array.from(files).forEach((file) =>
      formData.append('archivos[]', file) 
      // OJO: en Laravel se valida "archivos.*", aquí lo llamamos "archivos[]" para
      // que coincida con validar 'archivos.*' en Controller.
    );
    return this.http.post<Adjunto[]>(
      `${this.baseUrl}/${actividadId}/adjuntos`,
      formData
    );
  }

  /**
   * DELETE /api/adjuntos/{id}
   * Elimina el adjunto; en Laravel opcionalmente borrará el archivo físico.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/adjuntos/${id}`);
  }
}
