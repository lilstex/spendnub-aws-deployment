import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UserGuard } from 'src/security/guards/auth.guard';
import { ExpenseService } from '../service/expense.service';
import { CreateExpenseDto } from '../dto/expense.dto';

@ApiTags('Expense Management')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new expense' })
  @ApiResponse({ status: 201, description: 'Expense recorded successfully.' })
  async create(@Request() req, @Body() dto: CreateExpenseDto) {
    return this.expenseService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all user expenses' })
  async findAll(@Request() req) {
    return this.expenseService.findAllByUser(req.user.id);
  }

  @Get('monthly-total')
  @ApiOperation({ summary: 'Get total spent this month' })
  @ApiQuery({ name: 'category', required: false })
  async getTotal(@Request() req, @Query('category') category?: string) {
    const total = await this.expenseService.getMonthlyTotal(
      req.user.id,
      category,
    );
    return { total };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an expense record' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.expenseService.remove(req.user.id, id);
  }
}
