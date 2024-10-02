import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { DebtorService } from './debtor.service';
import { CreateDebtorDto, CreateDebtorSchema } from './dto/create-debtor.dto';
import { UpdateDebtorDto, UpdateDebtorSchema } from './dto/update-debtor.dto';

@Controller('debtor')
export class DebtorController {
  constructor(private readonly debtorService: DebtorService) {}

  @Post()
  async create(@Body() createDebtorDto: CreateDebtorDto) {
    const parseResult = CreateDebtorSchema.safeParse(createDebtorDto);
    if (!parseResult.success) {
      throw new BadRequestException(
        {
          error: parseResult.error.errors,
        },
        { cause: parseResult.error.errors },
      );
    }
    const debtor = await this.debtorService.create(parseResult.data);
    return debtor;
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
