import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-modal.css',
  styleUrl: '../../features/publicaciones/create-publicacion/create-publicacion-modal/create-publicacion-modal.css',
})
export class ConfirmModal {
  @Input() message: string = '¿Estás seguro?';
  @Input() confirmButtonText: string = 'Confirmar';
  @Input() cancelButtonText: string = 'Cancelar';
  @Input() danger: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();

  closeModal(): void {
    this.onClose.emit();
  }

  confirm(): void {
    this.onConfirm.emit();
  }
}
