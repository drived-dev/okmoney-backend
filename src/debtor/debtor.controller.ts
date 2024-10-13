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
import { ApiTags } from '@nestjs/swagger';
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';
import { ZodPipe } from '../utils/zodPipe';
import { DebtorService } from './debtor.service';
import {
  BulkCreateDebtorDto,
  BulkCreateDebtorSchema,
  CreateExistingDebtorDto,
  CreateExistingDebtorSchema,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto, UpdateDebtorSchema } from './dto/update-debtor.dto';
import { UpdateLoanDto, UpdateLoanSchema } from 'src/loan/dto/update-loan.dto';
import { LoanService } from 'src/loan/loan.service';

@ApiTags('Debtor')
@Controller('debtor')
export class DebtorController {
  constructor(
    private readonly debtorService: DebtorService,
    private readonly loanService: LoanService,
  ) {}

  @UseGuards(MockAuthGuard)
  @Post('bulk')
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

  @Get()
  async findAll() {
    const debtors = await this.debtorService.findAll();
    return debtors;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const debtor = await this.debtorService.findOne(id);
    return debtor;
  }

  // TODO: get id from token
  @UseGuards(MockAuthGuard)
  @Get('/mydebtors')
  async findLoansWithDebtorDetails(@Req() req: AuthReqType) {
    const id = req.user?.id;
    const debtors = await this.debtorService.findLoansWithDebtorDetails(id);
    return debtors;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateDebtorSchema)) updateDebtorDto: UpdateDebtorDto,
  ) {
    const status = await this.debtorService.update(id, updateDebtorDto);
    return status;
  }

  @Patch('loan/:id')
  async updateLoan(
    @Param('id') loanId: string,
    @Body(new ZodPipe(UpdateLoanSchema)) updateLoanDto: UpdateLoanDto,
  ) {
    const status = await this.loanService.update(loanId, updateLoanDto);
    return status;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const status = await this.debtorService.remove(id);
    return status;
  }
}
