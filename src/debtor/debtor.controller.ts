import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';
import { ZodPipe } from '../utils/zodPipe';
import { DebtorService } from './debtor.service';
import {
  BulkCreateDebtorDto,
  BulkCreateDebtorSchema,
  CreatedResponseDto,
  CreateExistingDebtorDto,
  CreateExistingDebtorSchema,
  GetAllDebtorDto,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto, UpdateDebtorSchema } from './dto/update-debtor.dto';
import { UpdateLoanDto, UpdateLoanSchema } from '../loan/dto/update-loan.dto';
import { LoanService } from '../loan/loan.service';
import { ApiAuthorizationHeader } from '@/utils/auth.decorator';
import { ResponseDto } from '@/types/response.dto';

@ApiTags('Debtor')
@Controller('debtor')
export class DebtorController {
  constructor(
    private readonly debtorService: DebtorService,
    private readonly loanService: LoanService,
  ) {}

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Post('bulk')
  @ApiCreatedResponse({
    type: CreatedResponseDto,
    isArray: true,
    description:
      'Bulk create debtors where the payment is included for exisiting debtors',
  })
  async createBulk(
    @Req() req: AuthReqType,
    @Body(new ZodPipe(BulkCreateDebtorSchema))
    bulkCreateDebtorDto: BulkCreateDebtorDto,
  ) {
    const data = await this.debtorService.createBulk(
      bulkCreateDebtorDto,
      req.user.id,
    );
    return data;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @ApiCreatedResponse({
    type: CreatedResponseDto,
    description:
      'Create a debtor where the payment is included for an exisiting debtor',
  })
  @Post()
  async create(
    @Req() req: AuthReqType,
    @Body(new ZodPipe(CreateExistingDebtorSchema))
    createDebtorDto: CreateExistingDebtorDto,
  ) {
    if (!createDebtorDto.paidAmount) createDebtorDto.paidAmount = 0;
    const data = await this.debtorService.createWithLoan(
      createDebtorDto,
      req.user.id,
    );
    return data;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get('/mydebtors')
  @ApiOkResponse({
    type: GetAllDebtorDto,
    description: 'Get all debtors by creditor Id',
  })
  async findLoansWithDebtorDetails(@Req() req: AuthReqType) {
    const id = req.user?.id;
    const debtors = await this.debtorService.findLoansWithDebtorDetails(id);
    return debtors;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Patch(':id')
  @ApiOkResponse({
    type: ResponseDto,
    description: 'Update debtor with debtor id as param',
  })
  async update(
    @Param('id') id: string,
    @Req() req: AuthReqType,
    @Body(new ZodPipe(UpdateDebtorSchema)) updateDebtorDto: UpdateDebtorDto,
  ) {
    const creditorId = req.user?.id;
    await this.loanService.authorizeDebtorByCreditorId(id, creditorId);
    const status = await this.debtorService.update(id, updateDebtorDto);
    return status;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Patch('loan/:id')
  @ApiOkResponse({
    type: ResponseDto,
    description: 'Update loan with loan id as param',
  })
  async updateLoan(
    @Param('id') loanId: string,
    @Req() req: AuthReqType,
    @Body(new ZodPipe(UpdateLoanSchema)) updateLoanDto: UpdateLoanDto,
  ) {
    const creditorId = req.user?.id;
    await this.loanService.authorizeLoanByCreditorId(loanId, creditorId);
    const status = await this.loanService.update(loanId, updateLoanDto);
    return status;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Delete(':id')
  @ApiOkResponse({
    type: ResponseDto,
    description: 'Delete debtor and loan with debtor id as param',
  })
  async remove(@Param('id') debtorId: string, @Req() req: AuthReqType) {
    if (!debtorId) {
      throw new BadRequestException('Id is required');
    }
    const creditorId = req.user?.id;
    const loan = await this.loanService.authorizeDebtorByCreditorId(
      debtorId,
      creditorId,
    );

    await this.loanService.remove(loan.id);
    const status = await this.debtorService.remove(debtorId);
    return status;
  }

  // TODO: remove on production
  @Get()
  async findAll() {
    const debtors = await this.debtorService.findAll();
    return debtors;
  }

  // TODO: remove on production
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const debtor = await this.debtorService.findOne(id);
    return debtor;
  }
}
