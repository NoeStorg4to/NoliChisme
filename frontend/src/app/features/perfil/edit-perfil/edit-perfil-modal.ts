import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/interfaces/user.interface';
import { Userservice } from '../../../core/services/user.service';
import { enviroment } from '../../../../enviroments/enviroment';

@Component({
  selector: 'app-edit-perfil-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-perfil-modal.html',
  styleUrl: './edit-perfil-modal.css',
})
export class EditPerfilModal implements OnInit  {
  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

  editForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: Userservice
  ) {
    this.editForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.editForm.patchValue({
        nombreUsuario: this.user.nombreUsuario,
        descripcion: this.user.descripcion || '',
      });
      if (this.user.imagenPerfil) {
        this.previewUrl = `${enviroment.apiUrl}${this.user.imagenPerfil}`;
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('nombreUsuario', this.editForm.get('nombreUsuario')?.value);
    formData.append('descripcion', this.editForm.get('descripcion')?.value);

    if (this.selectedFile) {
      formData.append('imagenPerfil', this.selectedFile, this.selectedFile.name);
    }

    this.userService.updateUser(this.user._id!, formData).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.userUpdated.emit(updatedUser);
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al actualizar el perfil.';
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
