import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
          error: parseResult.error.errors,
        },
        { cause: parseResult.error.errors },
      );
    }
    const creditor = await this.creditorService.create(parseResult.data);
    return creditor;
  }

  @Get()
  async findAll() {
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
  async update(
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
          error: parseResult.error.errors,
        },
        { cause: parseResult.error.errors },
      );
    }
    const status = await this.creditorService.update(id, parseResult.data);
    return status;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const status = await this.creditorService.remove(id);
    return status;
  }
}
