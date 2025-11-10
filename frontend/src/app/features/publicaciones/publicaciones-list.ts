import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../../core/interfaces/publicacion.interface';
import { User } from '../../core/interfaces/user.interface';
import { PublicacionCard } from './publicacion-card/publicacion-card';
import { FormsModule } from '@angular/forms';
import { CreatePublicacionModal } from "./create-publicacion/create-publicacion-modal/create-publicacion-modal";

@Component({
  selector: 'app-publicaciones-list',
  standalone: true,
  imports: [CommonModule, PublicacionCard, FormsModule, CreatePublicacionModal],
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

  isModalOpen = false;

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
    this.publicacionesService.handleLikeToggle(publicacionId, this.publicaciones).subscribe({
      next: (updatedPublicaciones) => {
        this.publicaciones = updatedPublicaciones;
      },
      error: (err) => {
        console.error('Error al actualizar el like', err);
        this.loadPublicaciones(false);
      }
    });
  }

  handleDelete(publicacionId: string): void {
    this.publicacionesService.handleDelete(publicacionId, this.publicaciones).subscribe({
      next: (updatedPublicaciones) => {
        this.publicaciones = updatedPublicaciones;
        this.totalPublicaciones--;
      },
      error: (err) => {
        this.errorMessage = 'error al eliminar la publicacion';
        console.error(err);
      }
    })
  }

  addNewPublicacion(newPublicacion: Publicacion): void {
    this.publicaciones = [newPublicacion, ...this.publicaciones];
    this.totalPublicaciones++;
    this.isModalOpen = false;
  }
}