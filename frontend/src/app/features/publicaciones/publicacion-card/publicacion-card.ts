import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { enviroment } from '../../../../enviroments/enviroment';
import { Publicacion } from '../../../core/interfaces/publicacion.interface';
import { User } from '../../../core/interfaces/user.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { ComentariosSection } from '../comentarios-section/comentarios-section';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule, DatePipe, ComentariosSection],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard implements OnInit {
  @Input() publicacion!: Publicacion;
  @Input() currentUser!: User | null;

  @Output() onLikeToggle = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  isLiked: boolean = false;
  isOwner: boolean = false;
  fullImageUrl: string | null = null;
  fullAvatarUrl: string | null = null;

  isComentariosOpen = false;

  ngOnInit(): void {
    this.checkLikeStatus();
    this.checkOwnership();
    this.buildImageUrls();
  }

  buildImageUrls(): void {
    if (this.publicacion.imagenUrl) {
      this.fullImageUrl = `${enviroment.apiUrl}${this.publicacion.imagenUrl}`;
    }
    if (this.publicacion.usuarioId?.imagenPerfil) {
      this.fullAvatarUrl = `${enviroment.apiUrl}${this.publicacion.usuarioId.imagenPerfil}`;
    }
  }

  checkLikeStatus(): void {
    if (this.currentUser?._id && this.publicacion.likes) {
      this.isLiked = this.publicacion.likes.includes(this.currentUser._id!);
    }
  }

  checkOwnership(): void {
    if (this.currentUser?._id && this.publicacion.usuarioId) {
      this.isOwner =
        this.publicacion.usuarioId._id === this.currentUser._id ||
        this.currentUser.perfil === 'administrador';
    }
  }

  toggleLike(): void {
    this.onLikeToggle.emit(this.publicacion._id);
    this.isLiked = !this.isLiked;
    this.isLiked
      ? this.publicacion.likesCount++
      : (this.publicacion.likesCount = Math.max(0, this.publicacion.likesCount - 1));
  }

  deletePost(): void {
    this.onDelete.emit(this.publicacion._id);
  }

  toggleComentarios(): void {
    this.isComentariosOpen = !this.isComentariosOpen;
  }

  actualizarPublicacion(publicacionActualizada: Publicacion): void {
    this.publicacion = publicacionActualizada;
  }
}
