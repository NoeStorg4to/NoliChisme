import { Injectable } from '@angular/core';
import { enviroment } from '../../../enviroments/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { ComentariosResponse, Publicacion, PublicacionesResponse } from '../interfaces/publicacion.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  private apiUrl = `${enviroment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPublicaciones(sortBy: string = 'fechaCreacion', limit: number = 10, page: number = 1, usuarioId?: string): Observable<PublicacionesResponse>{
    let params = new HttpParams().set('sortBy', sortBy).set('limit', limit.toString()).set('page', page.toString());

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

  addComentario(publicacionId: string, contenido: string): Observable<Publicacion> {
    const body = { contenido: contenido };
    return this.http.post<Publicacion>(`${this.apiUrl}/${publicacionId}/comentarios`, body);
  }

  getComentarios(publicacionId: string, offset: number, limit: number): Observable<ComentariosResponse> {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ComentariosResponse>(`${this.apiUrl}/${publicacionId}/comentarios`, { params });
  }

  handleLikeToggle(publicacionId: string, publicaciones: Publicacion[]): Observable<Publicacion[]> {
    const currentUser = this.authService.getCurrentUser();
    const publicacion = publicaciones.find(p => p._id === publicacionId);

    if (!currentUser?._id || !publicacion){
      return of(publicaciones);
    }

    const isLiked = publicacion.likes.includes(currentUser._id);
    const request$ = isLiked
      ? this.unlikePublicacion(publicacionId)
      : this.likePublicacion(publicacionId);

    return request$.pipe(
      map(updatedPublicacion => {
        const index = publicaciones.findIndex(p => p._id === publicacionId);
        if(index !== -1) {
          const newPublicaciones = [...publicaciones]; // pa los cambios
          newPublicaciones[index] = updatedPublicacion;
          return newPublicaciones;
        }
        return publicaciones;
      })
    )
  }

  handleDelete(publicacionId: string, publicaciones: Publicacion[]): Observable<Publicacion[]> {
    return this.deletePublicacion(publicacionId).pipe(
      map(() => {
        return publicaciones.filter(p => p._id !== publicacionId);
      })
    )
  }
}
