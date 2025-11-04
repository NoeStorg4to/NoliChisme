import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"
import { Router } from "@angular/router";


export const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();

    if(currentUser && currentUser.perfil === 'administrador') {
        return true;
    }

    router.navigate(['/publicaciones']);
    return false;
}