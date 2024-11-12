import { ResponseDto } from '@/types/response.dto';
import { ApiAuthorizationHeader } from '@/utils/auth.decorator';
import {
  BadRequestException,
  Body,
  Controller,
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
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
import { RolePackage } from './entities/rolePackage.entity';

// TODO: Create test for all endpoints
// TODO: Add token required on header for all endpoints

@ApiTags('Creditor')
@Controller('creditor')
export class CreditorController {
  private readonly logger = new Logger(CreditorController.name);

  constructor(private readonly creditorService: CreditorService) {}

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Post('profileimage')
  @UseInterceptors(FileInterceptor('file'))
  @ApiCreatedResponse({
    type: ResponseDto,
    description: 'The image has been successfully uploaded.',
  })
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
    const creditor =
      await this.creditorService.createWithPhone(createCreditorDto);
    return creditor;
  }

  // TODO: remove this on production
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: [Creditor] })
  async findAll(): Promise<Creditor[]> {
    const creditors = await this.creditorService.findAll();
    return creditors;
  }

  // TODO: remove this on production
  @Get(':id')
  @ApiOkResponse({ type: Creditor })
  async findOneTmp(@Param('id') id: string): Promise<Creditor> {
    if (!id) {
      throw new BadRequestException('Id is required');
    }
    const creditor = await this.creditorService.findOneWithProfileImage(id);
    return creditor;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get('/rolepackage')
  @ApiOkResponse({
    schema: { type: 'string', enum: Object.values(RolePackage) },
  })
  async getRolePackage(@Req() req: AuthReqType): Promise<RolePackage> {
    const rolePackage = await this.creditorService.getRolePackage(req.user.id);
    return rolePackage;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get()
  @ApiOkResponse({ type: Creditor })
  async findOne(@Req() req: AuthReqType): Promise<Creditor> {
    const creditor = await this.creditorService.findOneWithProfileImage(
      req.user?.id,
    );
    return creditor;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Patch()
  @ApiOkResponse({ type: ResponseDto })
  async update(
    @Req() req: AuthReqType,
    @Body(new ZodPipe(UpdateCreditorSchema)) // apply pipe to only body
    updateCreditorDto: UpdateCreditorDto,
  ) {
    const status = await this.creditorService.update(
      req.user?.id,
      updateCreditorDto,
    );
    return status;
  }

  // @UseGuards(MockAuthGuard)
  // @ApiAuthorizationHeader()
  // @Delete()
  // @ApiOkResponse({ type: ResponseDto })
  // async remove(@Req() req: AuthReqType) {
  //   const status = await this.creditorService.remove(req.user?.id);
  //   return status;
  // }
}
