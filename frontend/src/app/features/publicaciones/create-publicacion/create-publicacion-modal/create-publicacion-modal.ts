import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Publicacion } from '../../../../core/interfaces/publicacion.interface';
import { PublicacionesService } from '../../../../core/services/publicaciones.service';
import { TruncarPipe } from '../../../../core/pipes/truncar.pipe';

@Component({
  selector: 'app-create-publicacion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-publicacion-modal.html',
  styleUrl: './create-publicacion-modal.css',
})
export class CreatePublicacionModal {
  @Output() close = new EventEmitter<void>();
  @Output() publicacionCreada = new EventEmitter<Publicacion>();

  createForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private fb: FormBuilder, private publicacionesService: PublicacionesService) {
    this.createForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    })
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if(file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    // formData.append('titulo', this.createForm.get('titulo')?.value);
    formData.append('descripcion', this.createForm.get('descripcion')?.value);

    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile, this.selectedFile.name);
    }

    this.publicacionesService.createPublicacion(formData).subscribe({
      next: (nuevaPublicacion) => {
        this.isLoading = false;
        this.publicacionCreada.emit(nuevaPublicacion);
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error al crear la publicación. Intenta de nuevo.';
        console.error(err);
      },
    });
  }

  closeModal(): void {
    if (!this.isLoading) {
      this.close.emit();
    }
  }
}
