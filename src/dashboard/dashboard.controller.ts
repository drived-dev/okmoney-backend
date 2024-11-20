import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthReqType } from '../auth/reqType';
import { DashboardService } from './dashboard.service';
import {
  GetDashboardDebtorDto,
  GetLoanByTimeDto,
  GetDashboardLoanDto,
} from './dashboard.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOkResponse({
    type: GetDashboardDebtorDto,
    description: 'Get debtors with 3 types: total, cleared, uncleared',
  })
  @Get('debtors')
  async getDebtors(@Req() req: AuthReqType) {
    return this.dashboardService.getDebtors(req.user?.id);
  }

  @ApiOkResponse({
    type: GetDashboardLoanDto,
    description: "Get total loan's data",
  })
  @Get('loan')
  async getLoan(@Req() req: AuthReqType) {
    return this.dashboardService.getLoan(req.user?.id);
  }

  @ApiOkResponse({
    type: GetLoanByTimeDto,
    description: 'Get total loan for the last 5 years',
  })
  @Get('loan/year')
  async getLoanYear(@Req() req: AuthReqType) {
    return this.dashboardService.getLoanYear(req.user?.id);
  }

  @ApiOkResponse({
    type: GetLoanByTimeDto,
    description: 'Get total loan for the last 5 months',
  })
  @Get('loan/month')
  async getLoanMonth(@Req() req: AuthReqType) {
    return this.dashboardService.getLoanMonth(req.user?.id);
  }
}
