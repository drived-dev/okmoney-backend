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
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';
import { ZodPipe } from '../utils/zodPipe';
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
    @Body(new ZodPipe(CreateCreditorSchema))
    createCreditorDto: CreateCreditorDto,
  ): Promise<Creditor> {
    const creditor = await this.creditorService.create(createCreditorDto);
    return creditor;
  }

  // TODO: remove this on production
  @Get(':id')
  @ApiOkResponse({ type: Creditor })
  async findOneTmp(@Param('id') id: string): Promise<Creditor> {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const creditor = await this.creditorService.findOne(id);
    return creditor;
  }

  @UseGuards(MockAuthGuard)
  @Get()
  @ApiOkResponse({ type: Creditor })
  async findOne(@Req() req: AuthReqType): Promise<Creditor> {
    const creditor = await this.creditorService.findOne(req.user?.id);
    return creditor;
  }

  // TODO: get id from token instead
  @Patch(':id')
  @ApiOkResponse({ type: ResponseDto })
  async update(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateCreditorSchema)) // apply pipe to only body
    updateCreditorDto: UpdateCreditorDto,
  ) {
    const status = await this.creditorService.update(id, updateCreditorDto);
    return status;
  }

  @Delete(':id')
  @ApiOkResponse({ type: ResponseDto })
  async remove(@Param('id') id: string) {
    const status = await this.creditorService.remove(id);
    return status;
  }
}
