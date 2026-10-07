import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateToiletFieldsDto } from './dto/update-toilet-fields.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/auth-user.decorator';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('submissions')
  listSubmissions() {
    return this.adminService.listSubmissions();
  }

  @Post('submissions/:id/approve')
  approve(@Param('id') id: string) {
    return this.adminService.approve(id);
  }

  @Post('submissions/:id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.reject(id, reason);
  }

  @Get('reports')
  listReports() {
    return this.adminService.listReports();
  }

  @Post('reports/:id/resolve')
  resolveReport(
    @Param('id') id: string,
    @Body() body: { adminNotes?: string; toiletFields?: UpdateToiletFieldsDto },
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.resolveReport(
      id,
      user.id,
      body?.adminNotes,
      body?.toiletFields,
    );
  }

  @Post('reports/:id/dismiss')
  dismissReport(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.dismissReport(id, user.id, body?.notes);
  }
}