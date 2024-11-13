import { ResponseDto } from '@/types/response.dto';
import { ApiAuthorizationHeader } from '@/utils/auth.decorator';
import {
  Body,
  Controller,
  Get,
  Logger,
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
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';
import { ZodPipe } from '../utils/zodPipe';
import { CreditorService } from './creditor.service';
import {
  CreateCreditorDto,
  CreateCreditorSchema,
} from './dto/create-creditor.dto';
import { GetRolePackageDto } from './dto/get-creditor.dto';
import {
  UpdateCreditorDto,
  UpdateCreditorSchema,
} from './dto/update-creditor.dto';
import { Creditor } from './entities/creditor.entity';

// TODO: Create test for all endpoints

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

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get('/rolepackage')
  @ApiOkResponse({
    type: GetRolePackageDto,
  })
  async getRolePackage(@Req() req: AuthReqType): Promise<GetRolePackageDto> {
    const result = await this.creditorService.getRolePackage(req.user?.id);
    return result;
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
    @Body(new ZodPipe(UpdateCreditorSchema))
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
