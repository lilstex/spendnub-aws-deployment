import { ApiProperty } from '@nestjs/swagger';

export class BucketSummaryDto {
  @ApiProperty({
    example: '65cbd1234567890abcdef',
    description: 'Unique category ID',
  })
  _id: string;

  @ApiProperty({ example: 'Savings' })
  name: string;

  @ApiProperty({
    example: 20,
    description: 'Percentage of total income allocated',
  })
  percentage: number;

  @ApiProperty({
    example: 400.5,
    description: 'Dollar value allocated based on income',
  })
  allocated: number;

  @ApiProperty({ example: 50.0, description: 'Total spent from this bucket' })
  spent: number;

  @ApiProperty({ example: 350.5, description: 'Calculated rolling balance' })
  remaining: number;
}

export class RecentTransactionDto {
  @ApiProperty({ example: '65ccf9876543210fedcba' })
  _id: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  type: 'income' | 'expense';

  @ApiProperty({ example: 120.0 })
  amount: number;

  @ApiProperty({ example: 'Grocery shopping at Whole Foods' })
  description: string;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({
    example: 'Needs',
    required: false,
    description: 'Name of parent category',
  })
  categoryName?: string;
}
export class DashboardResponseDto {
  @ApiProperty({
    example: 2450.75,
    description: 'Current total net worth across all buckets',
  })
  totalBalance: number;

  @ApiProperty({
    example: 5000.0,
    description: 'Total income logged this month',
  })
  totalIncome: number;

  @ApiProperty({
    example: 2549.25,
    description: 'Total expenses logged this month',
  })
  totalExpenses: number;

  @ApiProperty({
    type: [BucketSummaryDto],
    description: 'List of all budget buckets and their status',
  })
  buckets: BucketSummaryDto[];

  @ApiProperty({
    type: [RecentTransactionDto],
    description: 'List of the 5 most recent activities',
  })
  recentTransactions: RecentTransactionDto[];

  @ApiProperty({
    example: true,
    description: 'Upgrade required',
  })
  upgradeRequired: boolean;

  @ApiProperty({
    example: 10,
    description: 'Locked count',
  })
  lockedCount: number;

  @ApiProperty({
    example: false,
    description: 'Expired',
  })
  isExpired: boolean;
}
