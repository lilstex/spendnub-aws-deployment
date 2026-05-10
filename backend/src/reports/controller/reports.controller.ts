import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserGuard } from '../../security/guards/auth.guard';
import { SubscriptionGuard } from '../../security/guards/subscription.guard';
import { ReportsService } from '../service/reports.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('reports')
@ApiBearerAuth()
@UseGuards(UserGuard, SubscriptionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  async monthly(
    @Req() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12 || y < 2000 || y > 2100) {
      throw new BadRequestException('Invalid year or month parameter');
    }
    return this.reportsService.getMonthlyReport(req.user.id, y, m);
  }
}
