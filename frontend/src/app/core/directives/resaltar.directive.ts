import { Directive, ElementRef, HostListener, Input, Renderer2 } from "@angular/core";

@Directive({
    selector: '[appResaltar]',
    standalone: true,
})
export class ResaltarDirective {
    @Input('appResaltar') colorResaltado: string = 'var(--accent)'; 
    private colorOriginal: string;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        this.colorOriginal = this.el.nativeElement.style.backgroundColor;
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.cambiarColor(this.colorResaltado);
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.cambiarColor(this.colorOriginal);
    }

    private cambiarColor(color: string) {
        this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    }
}