import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { InvestmentType } from '../schema/investment.schema';

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsNotEmpty()
  @IsEnum(InvestmentType)
  investmentType: InvestmentType;

  @IsString()
  @IsNotEmpty()
  instrumentName: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  units?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
