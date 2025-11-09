import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { User } from '../../core/interfaces/user.interface';
import { Publicacion } from '../../core/interfaces/publicacion.interface';
import { PublicacionCard } from '../publicaciones/publicacion-card/publicacion-card';
import { enviroment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-perfil-view',
  standalone: true,
  imports: [CommonModule, DatePipe, PublicacionCard],
  templateUrl: './perfil-view.html',
  styleUrl: './perfil-view.css',
})
export class PerfilView implements OnInit {
  user: User | null = null;
  publicaciones: Publicacion[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  fullAvatarUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.buildAvatarUrl();
      this.loadUserPosts();
    } else {
      this.errorMessage = 'No se pudo cargar la información del usuario.';
      this.isLoading = false;
    }
  }

  buildAvatarUrl(): void {
    if (this.user && this.user.imagenPerfil) {
      this.fullAvatarUrl = `${enviroment.apiUrl}${this.user.imagenPerfil}`;
    }
  }

  loadUserPosts(): void {
    if (!this.user?._id) return;

    this.publicacionesService.getPublicaciones(
      'fechaCreacion',
      3, // Límite de 3
      0,
      this.user._id
    ).subscribe({
      next: (response) => {
        this.publicaciones = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar las publicaciones del usuario.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  handleLikeToggle(publicacionId: string): void {
    const publicacion = this.publicaciones.find(p => p._id === publicacionId);
    if (!publicacion || !this.user) return;

    const isLiked = publicacion.likes.includes(this.user._id!);
    const request$ = isLiked
      ? this.publicacionesService.unlikePublicacion(publicacionId)
      : this.publicacionesService.likePublicacion(publicacionId);

    request$.subscribe({
      next: (updatedPublicacion) => {
        const index = this.publicaciones.findIndex(p => p._id === publicacionId);
        if (index !== -1) this.publicaciones[index] = updatedPublicacion;
      },
      error: (err) => console.error('Error al actualizar el like', err)
    });
  }

  handleDelete(publicacionId: string): void {
    this.publicacionesService.deletePublicacion(publicacionId).subscribe({
      next: () => {
        this.publicaciones = this.publicaciones.filter(p => p._id !== publicacionId);
      },
      error: (err) => console.error('Error al eliminar la publicación.', err)
    });
  }
}
