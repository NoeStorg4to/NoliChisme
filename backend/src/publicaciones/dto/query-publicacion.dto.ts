import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPublicacionDto {
  @IsOptional()
  @IsIn(['fechaCreacion', 'meGusta'])
  sortBy: string = 'fechaCreacion';

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50) // Poner un límite
  limit: number = 10;
}
