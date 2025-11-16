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
  imports: [CommonModule, ReactiveFormsModule, EnfocarDirective, ImagenDefaultDirective],
  templateUrl: './comentarios-section.html',
  styleUrl: './comentarios-section.css',
})
export class ComentariosSection implements OnInit {
  @Input() publicacion!: Publicacion;
  @Input() currentUser!: User | null;
  @Output() comentarioAgregado = new EventEmitter<Comentario>();

  comentarioForm: FormGroup;
  isLoading = false;
  apiBaseUrl = enviroment.apiUrl;
  isLoadingComentarios = false;

  comentarios: Comentario[] = [];
  limit = 5;
  totalComentarios = 0;

  constructor(private fb: FormBuilder, private publicacionesService: PublicacionesService) {
    this.comentarioForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    // this.sortComentarios();
    this.totalComentarios = this.publicacion.comentariosCount || 0;
    if (this.totalComentarios > 0) {
      this.cargarComentarios();
    }
  }

  cargarComentarios(): void {
    if (!this.publicacion._id) return;

    const currentOffset = this.comentarios.length;
    this.isLoadingComentarios = true;

    this.publicacionesService.getComentarios(this.publicacion._id, currentOffset, this.limit)
      .subscribe({
        next: (response) => {
          this.comentarios = [...this.comentarios, ...response.data]; 
          this.totalComentarios = response.total;
          this.isLoadingComentarios = false;
        },
        error: (err) => {
          console.error('Error al cargar comentarios', err);
          this.isLoadingComentarios = false;
        }
      });
  }

  // sortComentarios(): void {
  //   if (this.publicacion?.comentarios) {
  //     this.publicacion.comentarios.sort(
  //       (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
  //     );
  //   }
  // }

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
        this.comentarios.push(nuevoComentario);
        this.totalComentarios++;
        this.comentarioAgregado.emit(nuevoComentario);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al enviar comentario', err);
      },
    });
  }

  getAvatarUrl(user: User): string {
    if (user?.imagenPerfil) {
      return `${this.apiBaseUrl}${user.imagenPerfil}`;
    }
    return 'imagenes/avatar-default.png';
  }
}
