import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css',
})
export class Paginacion implements OnChanges {
  @Input() paginaActual: number = 1;
  @Input() totalPaginas: number = 1;
  @Output() paginaCambiada = new EventEmitter<number>();

  paginas: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.crearPaginas();
  }

  crearPaginas() {
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);

    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    this.paginas = [];
    for (let i = inicio; i <= fin; i++) {
      this.paginas.push(i);
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaActual) {
      this.paginaCambiada.emit(pagina);
    }
  }
}
