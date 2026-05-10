import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserGuard } from 'src/security/guards/auth.guard';
import { IncomeService } from '../service/income.service';
import { CreateIncomeDto } from '../dto/income.dto';

@ApiTags('Income Management')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Log income and auto-split into budget buckets' })
  async logIncome(@Request() req, @Body() dto: CreateIncomeDto) {
    return this.incomeService.createIncome(req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an income record' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.incomeService.remove(req.user.id, id);
  }
}
