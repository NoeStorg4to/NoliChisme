import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../../core/interfaces/publicacion.interface';
import { User } from '../../core/interfaces/user.interface';
import { PublicacionCard } from './publicacion-card/publicacion-card';
import { FormsModule } from '@angular/forms';
import { CreatePublicacionModal } from './create-publicacion/create-publicacion-modal/create-publicacion-modal';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { Paginacion } from '../../shared/paginacion/paginacion';

@Component({
  selector: 'app-publicaciones-list',
  standalone: true,
  imports: [CommonModule, PublicacionCard, FormsModule, CreatePublicacionModal, ConfirmModal, Paginacion],
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
  // offset: number = 0;
  totalPublicaciones: number = 0;
  paginaActual: number = 1;
  totalPaginas: number = 1;

  isModalOpen = false;
  publicacionAEliminar: Publicacion | null = null;

  constructor(
    private publicacionesService: PublicacionesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPublicaciones(1);
  }

  loadPublicaciones(page: number): void {
    this.isLoading = true;
    this.paginaActual = page;
    // if (!loadMore) {
    //   this.offset = 0;
    //   this.publicaciones = [];
    // }

    this.publicacionesService.getPublicaciones(this.sortBy, this.limit, this.paginaActual).subscribe({
      next: (response) => {
        this.publicaciones = response.data;
        this.totalPublicaciones = response.total;
        this.totalPaginas = response.totalPaginas;
        this.paginaActual = response.paginaActual;
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
    this.loadPublicaciones(1);
  }

  onPaginaCambiada(page: number): void {
    this.loadPublicaciones(page);
    window.scrollTo(0, 0); // subir al inicio de la página jii
  }

  // loadMore(): void {
  //   if (this.publicaciones.length < this.totalPublicaciones) {
  //     this.loadPublicaciones(true);
  //   }
  // }

  handleLikeToggle(publicacionId: string): void {
    this.publicacionesService.handleLikeToggle(publicacionId, this.publicaciones).subscribe({
      next: (updatedPublicaciones) => {
        this.publicaciones = updatedPublicaciones;
      },
      error: (err) => {
        console.error('Error al actualizar el like', err);
        this.loadPublicaciones(1);
      },
    });
  }

  onConfirmDelete(): void {
    if (!this.publicacionAEliminar) return;

    this.publicacionesService
      .handleDelete(this.publicacionAEliminar._id!, this.publicaciones)
      .subscribe({
        next: (updatedPublicaciones) => {
          this.publicaciones = updatedPublicaciones;
          this.totalPublicaciones--;
          this.publicacionAEliminar = null;
        },
        error: (err) => {
          this.errorMessage = 'error al eliminar la publicacion';
          console.error(err);
          this.publicacionAEliminar = null;
        },
      });
  }

  onDeleteRequest(publicacion: Publicacion): void {
    this.publicacionAEliminar = publicacion;
  }

  onCancelDelete(): void {
    this.publicacionAEliminar = null;
  }

  addNewPublicacion(newPublicacion: Publicacion): void {
    this.publicaciones = [newPublicacion, ...this.publicaciones];
    this.totalPublicaciones++;
    this.isModalOpen = false;
  }
}
