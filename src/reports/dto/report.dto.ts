import { IsString, MaxLength, IsOptional } from 'class-validator';

export class ReportDto {
  @IsString()
  reportType: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  suggestedValue?: string;
}