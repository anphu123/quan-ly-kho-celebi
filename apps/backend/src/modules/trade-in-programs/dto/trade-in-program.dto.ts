import { IsString, IsOptional, IsBoolean, IsDateString, MinLength, IsArray, IsObject } from 'class-validator';

export class CreateTradeInProgramDto {
  @IsString()
  @MinLength(2)
  code: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  customFields?: CustomFieldDef[];

  @IsOptional()
  @IsObject()
  defaultFieldConfig?: Record<string, { visible: boolean; required: boolean }>;
}

export class UpdateTradeInProgramDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  customFields?: CustomFieldDef[];

  @IsOptional()
  @IsObject()
  defaultFieldConfig?: Record<string, { visible: boolean; required: boolean }>;
}

export interface CustomFieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[]; // for select type
}
