import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserGuard } from 'src/security/guards/auth.guard';
import { BudgetService } from '../service/budget.service';
import { CreateBudgetDto } from '../dto/budget.dto';

@ApiTags('Budget Configuration')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('templates')
  getTemplates() {
    return [
      {
        id: 'fifty-thirty-twenty',
        name: '50/30/20 Rule',
        description:
          'The classic split. 50% covers essentials, 30% lifestyle, 20% savings.',
        icon: '⚖️',
        categories: [
          { name: 'Needs', percentage: 50 },
          { name: 'Wants', percentage: 30 },
          { name: 'Savings', percentage: 20 },
        ],
      },
      {
        id: 'sixty-twenty-twenty',
        name: '60/20/20 Rule',
        description:
          'Higher needs allocation — ideal for high rent or family obligations.',
        icon: '🏠',
        categories: [
          { name: 'Fixed Expenses', percentage: 60 },
          { name: 'Discretionary', percentage: 20 },
          { name: 'Savings', percentage: 20 },
        ],
      },
      {
        id: 'nigerian-standard',
        name: 'Nigerian Standard',
        description:
          'Weighted for Nigerian salaries — rent, feeding, and transport prioritised.',
        icon: '🇳🇬',
        categories: [
          { name: 'Rent / Housing', percentage: 30 },
          { name: 'Feeding', percentage: 20 },
          { name: 'Transportation', percentage: 10 },
          { name: 'Utility', percentage: 10 },
          { name: 'Savings', percentage: 15 },
          { name: 'Investment', percentage: 10 },
          { name: 'Miscellaneous', percentage: 5 },
        ],
      },
      {
        id: 'aggressive-saver',
        name: 'Aggressive Saver',
        description:
          'Minimum lifestyle, maximum accumulation. For those on a mission.',
        icon: '🚀',
        categories: [
          { name: 'Essentials', percentage: 50 },
          { name: 'Savings', percentage: 30 },
          { name: 'Investment', percentage: 15 },
          { name: 'Flex', percentage: 5 },
        ],
      },
      {
        id: 'business-owner',
        name: 'Business Owner',
        description:
          'Cleanly separates personal and business cash flows with a tax provision.',
        icon: '💼',
        categories: [
          { name: 'Personal Needs', percentage: 35 },
          { name: 'Business Reserve', percentage: 25 },
          { name: 'Tax Provision', percentage: 15 },
          { name: 'Savings', percentage: 15 },
          { name: 'Wants', percentage: 10 },
        ],
      },
    ];
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve your current budget structure' })
  @ApiResponse({ status: 200 })
  async getBudget(@Request() req) {
    return this.budgetService.getBudget(req.user.id);
  }

  @Post('configure')
  @ApiOperation({ summary: 'Set or update budget percentages' })
  async setBudget(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetService.configureBudget(req.user.id, dto.categories);
  }

  @Post('categories/:categoryId/sub')
  @ApiOperation({ summary: 'Add a subcategory to a specific bucket' })
  async addSubCategory(
    @Request() req,
    @Param('categoryId') categoryId: string,
    @Body('name') subName: string,
  ) {
    return this.budgetService.addSubCategory(req.user.id, categoryId, subName);
  }

  @Delete('categories/:categoryId/sub/:name')
  @ApiOperation({ summary: 'Remove a subcategory from a specific bucket' })
  async deleteSubCategory(
    @Request() req,
    @Param('categoryId') categoryId: string,
    @Param('name') subName: string,
  ) {
    return this.budgetService.deleteSubCategory(
      req.user.id,
      categoryId,
      subName,
    );
  }
}
