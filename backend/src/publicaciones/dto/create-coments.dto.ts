import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  contenido: string;
}
