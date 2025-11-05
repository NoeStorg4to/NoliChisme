import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/interfaces/user.interface';
import { AdminService } from '../../../core/services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit{
  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    if(!this.adminService.isAdmin()) {
      this.router.navigate(['/login']) //CAMBIARLO POR ALGUN HOME
      return;
    }
    
    this.loadUsers();
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
}
