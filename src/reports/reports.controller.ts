import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportDto } from './dto/report.dto';
import { CurrentUser } from '../auth/auth-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

@Controller('toilets')
@UseGuards(JwtGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':id/report')
  async report(
    @Param('id') id: string,
    @Body() dto: ReportDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reportsService.create(user.id, id, {
      reportType: dto.reportType,
      description: dto.description,
      suggestedValue: dto.suggestedValue,
    });
  }
}