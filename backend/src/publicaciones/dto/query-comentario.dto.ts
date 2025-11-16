import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryComentariosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 3;
}
