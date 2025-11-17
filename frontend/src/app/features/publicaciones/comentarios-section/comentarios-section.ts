import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Publicacion } from '../../../core/interfaces/publicacion.interface';
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
  @Output() comentarioAgregado = new EventEmitter<Publicacion>();

  comentarioForm: FormGroup;
  isLoading = false;
  apiBaseUrl = enviroment.apiUrl;

  constructor(private fb: FormBuilder, private publicacionesService: PublicacionesService) {
    this.comentarioForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.sortComentarios();
  }

  sortComentarios(): void {
    if (this.publicacion?.comentarios) {
      this.publicacion.comentarios.sort(
        (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
      );
    }
  }

  enviarComentario(): void {
    if (this.comentarioForm.invalid || this.isLoading || !this.publicacion._id) {
      return;
    }

    this.isLoading = true;
    const contenido = this.comentarioForm.value.contenido;

    this.publicacionesService.addComentario(this.publicacion._id, contenido).subscribe({
      next: (publicacionActualizada) => {
        this.isLoading = false;
        this.comentarioForm.reset();
        this.comentarioAgregado.emit(publicacionActualizada);
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