import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm!: FormGroup;
  imagenPerfil: File | null = null;

  previewUrl: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: ['', [Validators.maxLength(500)]],
    }, { validators: this.passwordMatchValidator })
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword');

    if(confirmPassword && password !== confirmPassword.value) {
      return { passwordMismatch: true };
    } 
    return null;
  }

  onFileSelected(event: any): void {
    // this.imagenPerfil = event.target.files[0];
    const file = event.target.files[0];
    if (file) {
      this.imagenPerfil = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagenPerfil = null;
      this.previewUrl = null;
    }
  }

  onSubmit(): void {
    if(this.registerForm.valid) {
      const userData: User = {
        ...this.registerForm.value,
        perfil: 'usuario'
      };

      console.log('Fijate los datos que se van a enviar, a ver que pasa:');
      console.log('userData:', userData);

      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if(key !== 'confirmPassword') {
          const value = userData[key as keyof User];
          console.log(` campo por campo: ${key}: ${value}`); 
          formData.append(key, value as string);
        }
      });

      if(this.imagenPerfil) {
        formData.append('imagenPerfil', this.imagenPerfil);
      }

      console.log('Enviando al back...');

      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('Registro exitosaaah', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error completo en registro', error);
          console.error('Respuesta del back:', error.error);
          if (error.status === 409){
            console.log('El usuario o correo ya existe. Soorryy');
          } else {
            console.log('No se pudo registrar 😢');
          }
          
        }
      });
    }
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get email() { return this.registerForm.get('email'); }
  get nombreUsuario() { return this.registerForm.get('nombreUsuario'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get fechaNacimiento() { return this.registerForm.get('fechaNacimiento'); }
  get descripcion() { return this.registerForm.get('descripcion'); }
}
