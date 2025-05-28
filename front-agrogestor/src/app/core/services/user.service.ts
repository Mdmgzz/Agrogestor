// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'ADMINISTRADOR' | 'TECNICO_AGRICOLA' | 'INSPECTOR';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  /** Trae todos los usuarios */
  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  /** Trae un usuario por ID */
  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  /** Crea un usuario (pasa payload con nombre, apellidos, correo, contrasena, rol) */
  create(payload: Partial<Usuario> & { contrasena: string }): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, payload);
  }

  /** Actualiza un usuario */
  update(id: number, payload: Partial<Usuario> & { contrasena?: string }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, payload);
  }

  /** Elimina un usuario */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
