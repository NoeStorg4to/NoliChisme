import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
    selector: 'img[appImagenDefault]', // Se aplica solo a etiquetas <img>
    standalone: true,
})
export class ImagenDefaultDirective {
    @Input() defaultImageUrl: string = 'imagenes/avatar-default.png';

    constructor(private el: ElementRef<HTMLImageElement>) {}

    @HostListener('error')
    onError() {
        this.el.nativeElement.src = this.defaultImageUrl;
    }
}