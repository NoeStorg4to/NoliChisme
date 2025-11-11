import { Pipe, PipeTransform } from "@angular/core";
import { User } from "../interfaces/user.interface";

@Pipe({
    name: 'iniciales',
    standalone: true,
})
export class InicialesPipe implements PipeTransform{
    transform(user: User | null): string {
        if (!user) return '?';

        const nombreInicial = user.nombre ? user.nombre.charAt(0) : '';
        const apellidoInicial = user.apellido ? user.apellido.charAt(0) : '';

        if (!nombreInicial || !apellidoInicial) { // Si no tiene apellido, usa las primeras 2 letras del nombre de usuario
            return user.nombreUsuario.substring(0, 2).toUpperCase();
        }
        
        return (nombreInicial + apellidoInicial).toUpperCase();
    }
}