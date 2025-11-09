import { Injectable } from '@angular/core';
import { enviroment } from '../../../enviroments/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion, PublicacionesResponse } from '../interfaces/publicacion.interface';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  private apiUrl = `${enviroment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  getPublicaciones(sortBy: string = 'fechaCreacion', limit: number = 10, offset: number = 0, usuarioId?: string): Observable<PublicacionesResponse>{
    let params = new HttpParams().set('sortBy', sortBy).set('limit', limit.toString()).set('offset', offset.toString());

    if(usuarioId) {
      params = params.append('usuarioId', usuarioId);
    }

    return this.http.get<PublicacionesResponse>(this.apiUrl, { params });
  }

  createPublicacion(formData: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, formData);
  }

  deletePublicacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  likePublicacion(id: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/${id}/like`, {});
  }

  unlikePublicacion(id: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.apiUrl}/${id}/like`);
  }
}
