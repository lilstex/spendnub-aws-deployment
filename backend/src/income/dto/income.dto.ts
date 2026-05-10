import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'Salary' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
