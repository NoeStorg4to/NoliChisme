import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class TimeQueryDto {
  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate: string;

  @IsOptional()
  @IsMongoId({ message: 'El ID de usuario debe ser un ID de Mongo válido' })
  userId?: string;
}
