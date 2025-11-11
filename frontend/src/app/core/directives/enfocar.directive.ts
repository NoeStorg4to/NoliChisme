import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

@Directive({
    selector: '[appEnfocar]',
    standalone: true,
})
export class EnfocarDirective {
    constructor(private el: ElementRef, private renderer: Renderer2) {}

    @HostListener('focus') onFocus() {
        this.renderer.setStyle(this.el.nativeElement, 'border-color', 'var(--primary-dark)');
        this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 0 3px rgba(139, 92, 246, 0.2)');
        this.renderer.setStyle(this.el.nativeElement, 'outline', 'none');
    }

    @HostListener('blur') onBlur() {
        this.renderer.setStyle(this.el.nativeElement, 'border-color', '#e5e7eb');
        this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
    }
}