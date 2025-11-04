import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      usuarioEmail: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if(this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Datos que se envían:', this.loginForm.value);

    this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login exitosaah', response);
          this.router.navigate(['publicaciones'])
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login amooor', error);
          console.error('Error del back:', error.error);
          console.error('Mensajes de todos los errores:', error.error?.message);

          if(error.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos';
          } else if(error.status === 404) {
            this.errorMessage = 'Usuario no encontrado'
          } else {
            this.errorMessage = 'Error al iniciar sesion. Intenta de nuevoo.'
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  get usuarioEmail() { return this.loginForm.get('usuarioEmail'); }
  get password() { return this.loginForm.get('password'); }
}
