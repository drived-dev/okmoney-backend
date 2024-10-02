import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DebtorService } from './debtor.service';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';

@Controller('debtor')
export class DebtorController {
  constructor(private readonly debtorService: DebtorService) {}

  @Post()
  create(@Body() createDebtorDto: CreateDebtorDto) {
    return this.debtorService.create(createDebtorDto);
  }

  @Get()
  findAll() {
    return this.debtorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtorDto: UpdateDebtorDto) {
    return this.debtorService.update(+id, updateDebtorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtorService.remove(+id);
  }
}
