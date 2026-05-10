import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryDto {
  @ApiProperty({ example: 'Savings' })
  @IsString()
  name: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({ example: ['Emergency Fund', 'Stocks'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subCategories: string[];
}

export class CreateBudgetDto {
  @ApiProperty({ type: [CategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}
