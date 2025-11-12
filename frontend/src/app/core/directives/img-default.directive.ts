import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
    selector: 'img[appImgDefault]', // Se aplica solo a etiquetas <img>
    standalone: true,
})
export class ImagenDefaultDirective {
    @Input('appImgDefault') defaultImageUrl: string = 'imagenes/Noli-sonrisita.png';

    private hasTriedDefault = false;
    constructor(private el: ElementRef<HTMLImageElement>) {}

    @HostListener('error')
    onError() {
        if (this.hasTriedDefault) {
            return; 
        }
        this.hasTriedDefault = true;
        this.el.nativeElement.src = this.defaultImageUrl;
    }
}