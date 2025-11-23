import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/interfaces/user.interface';
import { AdminService } from '../../../core/services/admin.service';
import { Router } from '@angular/router';
import { ConfirmModal } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmModal],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit{
  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  showCreateForm = false;
  createUserForm: FormGroup;
  userToToggle: User | null = null;

  constructor(private adminService: AdminService, private router: Router, private fb: FormBuilder) {
      this.createUserForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      fechaNacimiento: ['', Validators.required],
      perfil: ['usuario', Validators.required]
    });
  }

  ngOnInit(): void {
    if(!this.adminService.isAdmin()) {
      this.router.navigate(['/publicaciones'])
      return;
    }
    this.loadUsers();
  }

  goToStats(): void {
    this.router.navigate(['/admin/stats']);
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage= 'error al cargar los userss';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  onSubmitCreate() {
    if (this.createUserForm.invalid) return;
    
    this.isLoading = true;
    this.adminService.createUser(this.createUserForm.value).subscribe({
      next: (newUser) => {
        this.users.push(newUser);
        this.successMessage = 'Usuario creado correctamente';
        this.showCreateForm = false;
        this.createUserForm.reset({ perfil: 'usuario' });
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Error al crear usuario';
        this.isLoading = false;
      }
    });
  }

  confirmToggleStatus(user: User) {
    this.userToToggle = user;
  }

  onConfirmToggle() {
    if (!this.userToToggle || !this.userToToggle._id) return;
    
    const action$ = this.userToToggle.isActive 
      ? this.adminService.disableUser(this.userToToggle._id)
      : this.adminService.enableUser(this.userToToggle._id);

    action$.subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.userToToggle = null;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se pudo cambiar el estado';
        this.userToToggle = null;
      }
    });
  }

  changeRol(user: User): void {
    const newRol = user.perfil === 'usuario' ? 'administrador' : 'usuario';

    this.adminService.changesRolUser(user._id!, newRol).subscribe({
      next: (response) => {
        user.perfil = newRol;
        this.successMessage =  `${user.nombreUsuario} ahora es ${newRol}!!`;

        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Error al cambiar el rol'
        console.error('Error:', error);
      }
    })
  }

  getRolBadgeClass(perfil: string): string {
    return perfil === 'administrador' ? 'badge-admin' : 'badge-user';
  }

  get nombre() { return this.createUserForm.get('nombre'); }
  get apellido() { return this.createUserForm.get('apellido'); }
  get email() { return this.createUserForm.get('email'); }
  get nombreUsuario() { return this.createUserForm.get('nombreUsuario'); }
  get password() { return this.createUserForm.get('password'); }
  get fechaNacimiento() { return this.createUserForm.get('fechaNacimiento'); }
}
