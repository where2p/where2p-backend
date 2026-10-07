import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class UpdateToiletFieldsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isWheelchairAccessible?: boolean;

  @IsOptional()
  @IsBoolean()
  isOpen247?: boolean;

  @IsOptional()
  @IsInt()
  feeHuf?: number;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsOptional()
  @IsString()
  operator?: string;
}