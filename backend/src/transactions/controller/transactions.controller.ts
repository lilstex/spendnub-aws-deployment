import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TransactionsService } from '../service/transactions.service';
import { UserGuard } from 'src/security/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('transactions')
@ApiBearerAuth()
@UseGuards(UserGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * GET /transactions
   * Query params:
   *   page    (default 1)
   *   limit   (default 20, max 100)
   *   type    'income' | 'expense' | undefined = all
   *   from    ISO date string (YYYY-MM-DD)
   *   to      ISO date string (YYYY-MM-DD)
   */
  @Get()
  getHistory(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.transactionsService.getHistory((req as any).user.id, {
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, parseInt(limit, 10) || 20),
      type: type as 'income' | 'expense' | undefined,
      from,
      to,
    });
  }
}
