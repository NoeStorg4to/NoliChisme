import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  // imagenUrl será manejado por el controlador de archivos
}
