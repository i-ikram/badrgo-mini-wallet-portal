import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily summary metrics report' })
  @ApiResponse({ status: 200, description: 'Return daily summary metrics.' })
  @ApiResponse({ status: 400, description: 'Invalid query format.' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  getDailySummary(@Query() query: ReportQueryDto) {
    return this.reportsService.getDailySummary(query);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get overall dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return overall dashboard statistics.',
  })
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }
}
