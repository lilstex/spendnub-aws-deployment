import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 45.0, description: 'The amount spent' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'Uber ride',
    description: 'Brief description of the expense',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '1234545', description: 'The main budget category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Transport', required: false })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiProperty({ example: '2026-01-21T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;
}
