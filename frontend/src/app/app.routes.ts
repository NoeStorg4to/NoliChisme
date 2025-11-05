import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/Login', pathMatch: 'full' },
    { path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
    },
    { path: 'register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register)
    },
    { path: 'publicaciones',
        loadComponent: () => import('./features/publicaciones/publicaciones-list').then(m => m.PublicacionesList)
    },
    { path: 'perfil-view',
        loadComponent: () => import('./features/perfil/perfil-view').then(m => m.PerfilView)
    },
    { path: 'admin/dashboard',
        loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
        canActivate: [authGuard, adminGuard]
    },
    { path: '**', redirectTo: '/login' }
];

