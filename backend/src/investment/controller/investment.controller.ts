import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserGuard } from 'src/security/guards/auth.guard';
import { SubscriptionGuard } from 'src/security/guards/subscription.guard';
import { InvestmentService } from '../service/investment.service';
import { CreateInvestmentDto } from '../dto/investment.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('investments')
@ApiBearerAuth()
@UseGuards(UserGuard, SubscriptionGuard)
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateInvestmentDto) {
    return this.investmentService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.investmentService.findAllByUser(req.user.id);
  }

  @Get('summary')
  async summary(@Request() req: any) {
    return this.investmentService.getPortfolioSummary(req.user.id);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.investmentService.remove(req.user.id, id);
    return { message: 'Investment removed' };
  }
}
