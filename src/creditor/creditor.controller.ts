import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
} from '@nestjs/common';
import { CreditorService } from './creditor.service';
import {
  CreateCreditorDto,
  CreateCreditorSchema,
} from './dto/create-creditor.dto';
import {
  UpdateCreditorDto,
  UpdateCreditorSchema,
} from './dto/update-creditor.dto';

// TODO: Create test for all endpoints
@Controller('creditor')
export class CreditorController {
  constructor(private readonly creditorService: CreditorService) {}

  @Post()
  async create(@Body() createCreditorDto: CreateCreditorDto) {
    const parseResult = CreateCreditorSchema.safeParse(createCreditorDto);
    if (!parseResult.success) {
      throw new BadRequestException(
        {
          error: 'User input for creating Creditor is not valid',
        },
        { cause: parseResult.error.errors },
      );
    }
    return this.creditorService.create(parseResult.data);
  }

  @Get()
  async findAll() {
    console.log('Find all');
    const creditors = await this.creditorService.findAll();
    return creditors;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const creditor = await this.creditorService.findOne(id);
    return creditor;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCreditorDto: UpdateCreditorDto,
  ) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const parseResult = UpdateCreditorSchema.safeParse(updateCreditorDto);
    if (!parseResult.success) {
      throw new BadRequestException(
        {
          error: 'User input for updating Creditor is not valid',
        },
        { cause: parseResult.error.errors },
      );
    }
    return this.creditorService.update(id, parseResult.data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    return this.creditorService.remove(id);
  }
}
