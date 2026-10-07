import { IsString, IsNumber, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class SubmitToiletDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  locationDetails?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

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