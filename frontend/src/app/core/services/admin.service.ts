import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { User } from "../interfaces/user.interface";
import { enviroment } from "../../../enviroments/enviroment";


@Injectable({
    providedIn: 'root'
})

export class AdminService {
    private apiUrl = enviroment.apiUrl;

    constructor(private http: HttpClient, private authService: AuthService){}

    // private getHeaders(): HttpHeaders { LO HACE EL INTERCEPTOR ESTO ASI QUE BYE
    //     const token = this.authService.getToken();
    //     return new HttpHeaders({
    //         'Autorization': `Bearer ${token}`
    //     });
    // }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    changesRolUser(userId: string, newRol: string): Observable<any> {
        return this.http.patch(
            `${this.apiUrl}/users/${userId}/rol`,
            { perfil: newRol },
        )
    }

    isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.perfil === 'administrador';
}
}