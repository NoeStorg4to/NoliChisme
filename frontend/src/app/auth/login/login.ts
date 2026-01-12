import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private adminService: AdminService) {
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

    this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const currentUser = this.authService.getCurrentUser();
          if(currentUser && currentUser.perfil === 'administrador'){
            this.router.navigate(['/admin/dashboard'])
          } else {
            //console.log('Login exitosaah', response);
            this.router.navigate(['/publicaciones'])
          }
        },
        error: (error) => {
          this.isLoading = false;

          const backendMessage = error.error?.message;

          if (backendMessage === 'ACCOUNT_DISABLED') {
              this.errorMessage = 'Tu cuenta ha sido deshabilitada. Contacta al administrador para más información.';
          } else if(error.status === 401) {
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
