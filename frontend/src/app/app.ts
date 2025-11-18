import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { ConfirmModal } from './shared/confirm-modal/confirm-modal';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, ConfirmModal],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  isSessionModalOpen = false;
  private sessionModalSubscription?: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionModalSubscription = this.authService.showSessionModal.subscribe(show => {
      this.isSessionModalOpen = show;
    });
  }

  ngOnDestroy(): void {
    this.sessionModalSubscription?.unsubscribe();
  }

  onConfirmRefresh(): void {
    this.authService.refreshToken().subscribe({
      next: () => {
        console.log('Sesión extendida.');
        this.authService.resetSessionTimer();
      },
      error: (err) => {
        console.error('Error al refrescar, deslogueando.', err);
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  onCancelLogout(): void {
    console.log('Usuario eligio no extender sesión. Deslogueando.');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
