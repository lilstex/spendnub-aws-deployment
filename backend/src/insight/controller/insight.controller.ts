import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserGuard } from 'src/security/guards/auth.guard';
import { SubscriptionGuard } from 'src/security/guards/subscription.guard';
import { InsightService } from '../service/insight.service';

@ApiTags('Financial Intelligence')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('insights')
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Get('balances')
  @ApiOperation({
    summary: 'Get detailed balances per category',
    description:
      'Returns monthly allocation, current spending, and accumulated rolling balances.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category balances retrieved successfully',
  })
  async getBalances(@Request() req) {
    return this.insightService.getCategoryBalances(req.user.id);
  }

  @Get('forecasting')
  @ApiOperation({
    summary: 'Get Burn Rate and Rolling Balances',
    description:
      'Calculates if you will exceed your budget and shows accumulated savings per category.',
  })
  @ApiResponse({ status: 200, description: 'Forecasting data retrieved' })
  async getInsights(@Request() req) {
    return this.insightService.getForecasting(req.user.id);
  }

  @Get('enhanced-forecasting')
  @UseGuards(SubscriptionGuard)
  @ApiOperation({
    summary: 'Get enhanced forecasting with per-category projections',
    description:
      'Returns projected month-end spend, savings rate, and per-category budget projections with recommendations.',
  })
  @ApiResponse({ status: 200, description: 'Enhanced forecasting data retrieved' })
  async enhancedForecasting(@Request() req) {
    return this.insightService.getEnhancedForecasting(req.user.id);
  }
}
