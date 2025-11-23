import { IsDateString, IsOptional } from 'class-validator';

export class TimeQueryDto {
  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate: string;
}
