import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { CreditorService } from './creditor.service';
import {
  CreateCreditorDto,
  CreateCreditorSchema,
} from './dto/create-creditor.dto';
import {
  UpdateCreditorDto,
  UpdateCreditorSchema,
} from './dto/update-creditor.dto';
import { Creditor } from './entities/creditor.entity';
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';

// TODO: Create test for all endpoints

class ResponseDto {
  @ApiProperty({ example: 'Success' })
  message: string | undefined;
}

@ApiTags('creditor')
@Controller('creditor')
export class CreditorController {
  private readonly logger = new Logger(CreditorController.name);

  constructor(private readonly creditorService: CreditorService) {}

  @UseGuards(MockAuthGuard)
  @Post('profileimage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() req: AuthReqType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('User id is required');
    }
    await this.creditorService.uploadProfileImage(file, req.user?.id);
    return { message: 'Success' };
  }

  @Post()
  @ApiCreatedResponse({
    type: Creditor,
    description: 'The record has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  async create(
    @Body() createCreditorDto: CreateCreditorDto,
  ): Promise<Creditor> {
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
  @ApiOkResponse({ type: [Creditor] })
  async findAll(): Promise<Creditor[]> {
    const creditors = await this.creditorService.findAll();
    return creditors;
  }

  @Get(':id')
  @ApiOkResponse({ type: Creditor })
  async findOne(@Param('id') id: string): Promise<Creditor> {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const creditor = await this.creditorService.findOne(id);
    return creditor;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ResponseDto })
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
  @ApiOkResponse({ type: ResponseDto })
  async remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const status = await this.creditorService.remove(id);
    return status;
  }
}
