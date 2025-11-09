import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../../core/interfaces/publicacion.interface';
import { User } from '../../core/interfaces/user.interface';
import { PublicacionCard } from './publicacion-card/publicacion-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-publicaciones-list',
  standalone: true,
  imports: [CommonModule, PublicacionCard, FormsModule],
  templateUrl: './publicaciones-list.html',
  styleUrl: './publicaciones-list.css',
})
export class PublicacionesList implements OnInit {
  publicaciones: Publicacion[] = [];
  currentUser: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  sortBy: string = 'fechaCreacion';
  limit: number = 10;
  offset: number = 0;
  totalPublicaciones: number = 0;

  constructor(
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPublicaciones();
  }

  loadPublicaciones(loadMore: boolean = false): void {
    this.isLoading = true;
    if (!loadMore) {
      this.offset = 0;
      this.publicaciones = [];
    }

    this.publicacionesService
      .getPublicaciones(this.sortBy, this.limit, this.offset)
      .subscribe({
        next: (response) => {
          this.publicaciones = loadMore 
            ? [...this.publicaciones, ...response.data] 
            : response.data;
          this.totalPublicaciones = response.total;
          this.offset = this.publicaciones.length;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error al cargar las publicaciones.';
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onSortChange(newSort: string): void {
    if (this.sortBy === newSort) return;
    this.sortBy = newSort;
    this.loadPublicaciones(false);
  }

  loadMore(): void {
    if (this.publicaciones.length < this.totalPublicaciones) {
      this.loadPublicaciones(true);
    }
  }

  handleLikeToggle(publicacionId: string): void {
    const publicacion = this.publicaciones.find(p => p._id === publicacionId);
    if (!publicacion || !this.currentUser) return;

    const isLiked = publicacion.likes.includes(this.currentUser._id!);

    const request$ = isLiked
      ? this.publicacionesService.unlikePublicacion(publicacionId)
      : this.publicacionesService.likePublicacion(publicacionId);

    request$.subscribe({
      next: (updatedPublicacion) => {
        const index = this.publicaciones.findIndex(p => p._id === publicacionId);
        if (index !== -1) {
          this.publicaciones[index] = updatedPublicacion;
          this.publicaciones = [...this.publicaciones]; 
        }
      },
      error: (err) => {
        console.error('Error al actualizar el like', err);
        this.loadPublicaciones(false);
      }
    });
  }

  handleDelete(publicacionId: string): void {
    this.publicacionesService.deletePublicacion(publicacionId).subscribe({
      next: () => {
        this.publicaciones = this.publicaciones.filter(p => p._id !== publicacionId);
        this.totalPublicaciones--;
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar la publicación.';
        console.error(err);
      }
    });
  }
}