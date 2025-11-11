import { Pipe, PipeTransform } from "@angular/core";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'

@Pipe({
    name: 'tiempoTranscurrido',
    standalone: true,
})
export class TiempoTranscurrido implements PipeTransform{
    transform(value: string | Date): string {
        if(!value) return '';

        try {
            const fecha = new Date(value);
            return formatDistanceToNow(fecha, { addSuffix: true, locale: es });
        } catch(error) {
            console.error('Error en el pipe tiempoTranscurrido:', error);
            return 'Fecha invalida';
        }
    }
}
