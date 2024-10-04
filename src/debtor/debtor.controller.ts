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
import { DebtorService } from './debtor.service';
import {
  CreateExistingDebtorDto,
  CreateExistingDebtorSchema,
  CreateNewDebtorDto,
  CreateNewDebtorSchema,
} from './dto/create-debtor.dto';
import { UpdateDebtorDto, UpdateDebtorSchema } from './dto/update-debtor.dto';
import { ZodPipe } from '../utils/zodPipe';

@Controller('debtor')
export class DebtorController {
  constructor(private readonly debtorService: DebtorService) {}

  @Post('new')
  @UsePipes(new ZodPipe(CreateNewDebtorSchema))
  async createNew(@Body() createDebtorDto: CreateNewDebtorDto) {
    console.log(createDebtorDto);
    let data = await this.debtorService.createWithLoan({
      ...createDebtorDto,
      paidAmount: 0,
    });
    return data;
  }

  @Post('existing')
  @UsePipes(new ZodPipe(CreateExistingDebtorSchema))
  async createExist(@Body() createDebtorDto: CreateExistingDebtorDto) {
    let data = await this.debtorService.createWithLoan(createDebtorDto);
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
