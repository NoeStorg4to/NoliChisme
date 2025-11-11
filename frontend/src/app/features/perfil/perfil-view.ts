import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { User } from '../../core/interfaces/user.interface';
import { Publicacion } from '../../core/interfaces/publicacion.interface';
import { PublicacionCard } from '../publicaciones/publicacion-card/publicacion-card';
import { enviroment } from '../../../enviroments/enviroment';
import { CreatePublicacionModal } from '../publicaciones/create-publicacion/create-publicacion-modal/create-publicacion-modal';
import { EditPerfilModal } from './edit-perfil/edit-perfil-modal';
import { Userservice } from '../../core/services/user.service';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-perfil-view',
  standalone: true,
  imports: [CommonModule, DatePipe, PublicacionCard, CreatePublicacionModal, EditPerfilModal, ConfirmModal],
  templateUrl: './perfil-view.html',
  styleUrl: './perfil-view.css',
})
export class PerfilView implements OnInit {
  user: User | null = null;
  publicaciones: Publicacion[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  fullAvatarUrl: string | null = null;

  isModalOpen = false;
  isEditModalOpen = false;

  publicacionAEliminar: Publicacion | null = null;

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
    private userService: Userservice,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.buildAvatarUrl();
        if (this.publicaciones.length === 0) {
          this.loadUserPosts();
        }
      } else if (!this.isLoading){
        this.errorMessage = 'No se pudo cargar la información del usuario.';
        // this.isLoading = false;
      }
    })

    const initialUser = this.authService.getCurrentUser();
      if (initialUser) {
        this.user = initialUser;
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
    this.publicacionesService.handleLikeToggle(publicacionId, this.publicaciones)
      .subscribe({
        next: (updatedPublicaciones) => {
          this.publicaciones = updatedPublicaciones;
        },
        error: (err) => console.error('Error al actualizar el like', err)
      });
  }

  onConfirmDelete(): void {
    if (!this.publicacionAEliminar) return;

    this.publicacionesService.handleDelete(this.publicacionAEliminar._id!, this.publicaciones)
      .subscribe({
        next: (updatedPublicaciones) => {
          this.publicaciones = updatedPublicaciones;
          this.publicacionAEliminar = null;
        },
        error: (err) => {
          console.error('Error al eliminar la publicación.', err);
          this.errorMessage = 'Error al eliminar la publicación.';
          this.publicacionAEliminar = null;
        }
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
    this.isModalOpen = false;
  }

  // MANEJAMOS LA ACTUALIZACION DEL USUARIO ACA
  onUserUpdated(updatedUser: User): void {
    this.authService.updateCurrentUser(updatedUser);
    this.isEditModalOpen = false;
  }
}
