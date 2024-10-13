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
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodPipe } from '../utils/zodPipe';
import { DebtorService } from './debtor.service';
import {
  BulkCreateDebtorDto,
  BulkCreateDebtorSchema,
  CreateExistingDebtorDto,
  CreateExistingDebtorSchema,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto, UpdateDebtorSchema } from './dto/update-debtor.dto';
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';

@ApiTags('Debtor')
@Controller('debtor')
export class DebtorController {
  constructor(private readonly debtorService: DebtorService) {}

  @UseGuards(MockAuthGuard)
  @Post('bulk')
  @UsePipes(new ZodPipe(BulkCreateDebtorSchema))
  async createBulk(
    @Req() req: AuthReqType,
    @Body() bulkCreateDebtorDto: BulkCreateDebtorDto,
  ) {
    const data = await this.debtorService.createBulk(
      bulkCreateDebtorDto,
      req.user.id,
    );
    return data;
  }

  @UseGuards(MockAuthGuard)
  @Post()
  @UsePipes(new ZodPipe(CreateExistingDebtorSchema))
  async create(
    @Req() req: AuthReqType,
    @Body() createDebtorDto: CreateExistingDebtorDto,
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
    @Body() updateDebtorDto: UpdateDebtorDto,
  ) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const parseResult = UpdateDebtorSchema.safeParse(updateDebtorDto);
    if (!parseResult.success) {
      throw new BadRequestException(
        {
          error: parseResult.error.errors,
        },
        { cause: parseResult.error.errors },
      );
    }
    const status = await this.debtorService.update(id, parseResult.data);
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
