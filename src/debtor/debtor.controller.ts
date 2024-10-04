import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodPipe } from '../utils/zodPipe';
import { DebtorService } from './debtor.service';
import {
  CreateExistingDebtorDto,
  CreateExistingDebtorSchema,
  CreateNewDebtorDto,
  CreateNewDebtorSchema,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto, UpdateDebtorSchema } from './dto/update-debtor.dto';

@ApiTags('Debtor')
@Controller('debtor')
export class DebtorController {
  constructor(private readonly debtorService: DebtorService) {}

  // TODO: get id from token
  @Post('new')
  @UsePipes(new ZodPipe(CreateNewDebtorSchema))
  async createNew(@Body() createDebtorDto: CreateNewDebtorDto) {
    console.log(createDebtorDto);
    const data = await this.debtorService.createWithLoan({
      ...createDebtorDto,
      paidAmount: 0,
    });
    return data;
  }

  // TODO: get id from token
  @Post('existing')
  @UsePipes(new ZodPipe(CreateExistingDebtorSchema))
  async createExist(@Body() createDebtorDto: CreateExistingDebtorDto) {
    const data = await this.debtorService.createWithLoan(createDebtorDto);
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
  @Get('/mydebtors/:id')
  async findLoansWithDebtorDetails(@Param('id') id: string) {
    const debtors = await this.debtorService.findLoansWithDebtorDetails(id);
    return debtors;
  }

  @Post('/test')
  async test(@Body() body: any) {
    try {
      const dateNum = z.coerce
        .date()
        .transform((date) => new Date(date).getTime());
      return dateNum.parse(body.dueDate);
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err);
    }
    return body;
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
