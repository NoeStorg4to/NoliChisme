import { Pipe, PipeTransform } from "@angular/core";

// SI EL COMENTARIO ES MUY LARGO LO TRUNCA A 100 LETRAS Y LE AGREGA ...
@Pipe({
    name: 'truncar',
    standalone: true,
})
export class TruncarPipe implements PipeTransform{
    transform(value: string, limit: number = 100, trail: string = '...'): string {
        if (!value) return '';
            return value.length > limit ? value.substring(0, limit) + trail : value;
        }
}