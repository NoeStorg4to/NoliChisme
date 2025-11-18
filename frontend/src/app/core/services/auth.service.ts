import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { Userservice } from './user.service';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, User } from '../interfaces/user.interface';
import { tap } from 'rxjs/operators';
import { enviroment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = enviroment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable()

  private sessionTimerSubscription?: Subscription;
  private readonly TEN_MINUTES_IN_MS = 10 * 60 * 1000; // 1 * 60 * 1000;
  public showSessionModal = new BehaviorSubject<boolean>(false);
  
  constructor(private http: HttpClient){
    this.loadUserFromStorage();
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // TRAE EL USUARIO DESDE EL LOCAL. CHEQUEA SI EXISTE ACTUALMENTE
  private loadUserFromStorage(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
      this.startSessionTimer();
    }
  }

  register(user: Userservice | FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if(response.access_token && response.usuario) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.usuario));
          this.currentUserSubject.next(response.usuario);
          this.startSessionTimer();
        }
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refrescar`, {}).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.access_token);
        this.resetSessionTimer();
        console.log('Token refrescado!');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.stopSessionTimer();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(updatedUser: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);
    }
  }

// TIMER PARA AVISO DE REFRESH TOKEN
  startSessionTimer(): void {
    this.stopSessionTimer();

    this.sessionTimerSubscription = timer(this.TEN_MINUTES_IN_MS).subscribe(() => {
      console.log('Sesión a punto de expirar, mostrando modal.');
      this.showSessionModal.next(true);
    });
  }

  stopSessionTimer(): void {
    this.sessionTimerSubscription?.unsubscribe();
    this.showSessionModal.next(false);
  }

  resetSessionTimer(): void {
    this.showSessionModal.next(false);
    this.startSessionTimer();
  }
}
