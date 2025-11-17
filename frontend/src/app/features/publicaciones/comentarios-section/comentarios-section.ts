import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Comentario, Publicacion } from '../../../core/interfaces/publicacion.interface';
import { User } from '../../../core/interfaces/user.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { enviroment } from '../../../../enviroments/enviroment';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { CommonModule } from '@angular/common';
import { EnfocarDirective } from '../../../core/directives/enfocar.directive';
import { ImagenDefaultDirective } from '../../../core/directives/img-default.directive';

@Component({
  selector: 'app-comentarios-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EnfocarDirective, ImagenDefaultDirective], //AÑADIR  PIPE EN TIEMPOTRANSCURRIDO
  templateUrl: './comentarios-section.html',
  styleUrl: './comentarios-section.css',
})
export class ComentariosSection implements OnInit {
  @Input() publicacion!: Publicacion;
  @Input() currentUser!: User | null;
  @Output() comentarioAgregado = new EventEmitter<void>();

  comentarioForm: FormGroup;
  isLoading = false;
  apiBaseUrl = enviroment.apiUrl;

  comentarios: Comentario[] = [];
  paginaActual = 1;
  limitePorPagina = 5;
  totalComentarios = 0;
  isLoadingMore = false;
  noHayMasComentarios = false;

  editingCommentId: string | null = null;
  editForm: FormGroup;

  constructor(private fb: FormBuilder, private publicacionesService: PublicacionesService) {
    this.comentarioForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(1)]],
    });
    this.editForm = this.fb.group({
      contenidoEdicion: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  // ngOnInit(): void {
  //   if (this.publicacion?._id) {
  //     this.totalComentarios = this.publicacion.comentariosCount;
  //     if (this.totalComentarios > 0) {
  //       this.cargarComentarios(1);
  //     } else {
  //       this.noHayMasComentarios = true;
  //     }
  //   }
  // }
  ngOnInit(): void {
    if (this.publicacion?._id) {
      this.totalComentarios = this.publicacion.comentariosCount;
      this.cargarComentarios(1);
    }
  }

  cargarComentarios(page: number): void {
    if (!this.publicacion._id || this.isLoadingMore) return;

    if (page === 1) {
      this.isLoading = true;
      this.comentarios = [];
    } else {
      this.isLoadingMore = true;
    }

    this.publicacionesService
      .getComentarios(this.publicacion._id, page, this.limitePorPagina)
      .subscribe({
        next: (response) => {
          this.comentarios = [...this.comentarios, ...response.data];
          this.paginaActual = response.paginaActual;
          this.totalComentarios = response.total;
          this.noHayMasComentarios = this.comentarios.length >= this.totalComentarios;
          
          this.isLoading = false;
          this.isLoadingMore = false;
        },
        error: (err) => {
          console.error('Error al cargar comentarios', err);
          this.isLoading = false;
          this.isLoadingMore = false;
        },
      });
  }

  cargarMas(): void {
    // if (!this.isLoadingMore && !this.noHayMasComentarios) {
      
    // }
    this.cargarComentarios(this.paginaActual + 1);
  }

  enviarComentario(): void {
    if (this.comentarioForm.invalid || this.isLoading || !this.publicacion._id) {
      return;
    }

    this.isLoading = true;
    const contenido = this.comentarioForm.value.contenido;

    this.publicacionesService.addComentario(this.publicacion._id, contenido).subscribe({
      next: (nuevoComentario) => {
        this.isLoading = false;
        this.comentarioForm.reset();
        this.comentarios.unshift(nuevoComentario); 
        this.totalComentarios++;
        this.publicacion.comentariosCount++;
        this.noHayMasComentarios = this.comentarios.length >= this.totalComentarios;
        this.comentarioAgregado.emit();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al enviar comentario', err);
      },
    });
  }

  iniciarEdicion(comentario: Comentario): void {
    this.editingCommentId = comentario._id!;
    this.editForm.patchValue({ contenidoEdicion: comentario.contenido });
  }

  cancelarEdicion(): void {
    this.editingCommentId = null;
    this.editForm.reset();
  }

  guardarEdicion(comentario: Comentario): void {
    if (this.editForm.invalid || !comentario._id) return;

    const nuevoContenido = this.editForm.value.contenidoEdicion;
    if (nuevoContenido === comentario.contenido) {
      this.cancelarEdicion();
      return;
    }
    
    this.publicacionesService
      .updateComentario(comentario._id, nuevoContenido)
      .subscribe({
        next: (comentarioActualizado) => {
          const index = this.comentarios.findIndex(c => c._id === comentarioActualizado._id);
          if (index !== -1) {
            this.comentarios[index] = comentarioActualizado;
          }
          this.cancelarEdicion();
        },
        error: (err) => {
          console.error('Error al actualizar el comentario', err);
        },
      });
  }

  getAvatarUrl(user: User): string {
    if (user?.imagenPerfil) {
      return `${this.apiBaseUrl}${user.imagenPerfil}`;
    }
    return 'imagenes/Noli-sonrisita.png';
  }
}