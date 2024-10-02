import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuarantorService } from './guarantor.service';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';

@Controller('guarantor')
export class GuarantorController {
  constructor(private readonly guarantorService: GuarantorService) {}

  @Post()
  create(@Body() createGuarantorDto: CreateGuarantorDto) {
    return this.guarantorService.create(createGuarantorDto);
  }

  @Get()
  findAll() {
    return this.guarantorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guarantorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuarantorDto: UpdateGuarantorDto) {
    return this.guarantorService.update(+id, updateGuarantorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guarantorService.remove(+id);
  }
}
