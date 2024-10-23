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
import { GuarantorService } from './guarantor.service';
import {
  CreateGuarantorDto,
  CreateGuarantorScehma,
} from './dto/create-guarantor.dto';
import {
  UpdateGuarantorDto,
  UpdateGuaratorSchema,
} from './dto/update-guarantor.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('guarantor')
@Controller('guarantor')
export class GuarantorController {
  constructor(private readonly guarantorService: GuarantorService) {}

  @Post()
  async create(@Body() createGuarantorDto: CreateGuarantorDto) {
    const parseResult = CreateGuarantorScehma.safeParse(createGuarantorDto);
    if (!parseResult.success) {
      throw new BadRequestException(
        {
          error: parseResult.error.errors,
        },
        { cause: parseResult.error.errors },
      );
    }
    const guarator = await this.guarantorService.create(parseResult.data);
    return guarator;
  }

  @Get()
  async findAll() {
    const guarantors = await this.guarantorService.findAll();
    return guarantors;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const guarantor = await this.guarantorService.findOne(id);
    return guarantor;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGuarantorDto: UpdateGuarantorDto,
  ) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const parseResult = UpdateGuaratorSchema.safeParse(updateGuarantorDto);
    if (!parseResult.success) {
      throw new BadRequestException(
        {
          error: parseResult.error.errors,
        },
        { cause: parseResult.error.errors },
      );
    }
    const status = await this.guarantorService.update(id, parseResult.data);
    return status;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const status = await this.guarantorService.remove(id);
    return status;
  }
}
