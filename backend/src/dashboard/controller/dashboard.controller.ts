import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserGuard } from 'src/security/guards/auth.guard';
import { DashboardService } from '../service/dashboard.service';
import { DashboardResponseDto } from '../dto/dashboard.dto';

@ApiTags('Executive Dashboard')
@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get high-level financial overview' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  async getSummary(@Request() req) {
    return this.dashboardService.getDashboardData(req.user.id);
  }
}
