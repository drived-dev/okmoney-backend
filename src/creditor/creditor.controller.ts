import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CreditorService } from './creditor.service';
// import { CreateCreditorDto } from './dto/create-creditor.dto';
// import { UpdateCreditorDto } from './dto/update-creditor.dto';

@Controller('creditor')
export class CreditorController {
  constructor(private readonly creditorService: CreditorService) {}

  // @Post()
  // create(@Body() createCreditorDto: CreateCreditorDto) {
  //   return this.creditorService.create(createCreditorDto);
  // }

  @Get()
  findAll() {
    console.log('Find all');
    return this.creditorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`id: ${id}`);
    const creditor = await this.creditorService.findOne(id);
    console.log(creditor);
    return creditor;
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCreditorDto: UpdateCreditorDto) {
  //   return this.creditorService.update(+id, updateCreditorDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditorService.remove(+id);
  }
}
