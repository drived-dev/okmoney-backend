import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { LoanService } from '@/loan/loan.service';
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
import { AuthReqType } from '../auth/reqType';
import { ZodPipe } from '../utils/zodPipe';
import { CreditorService } from './creditor.service';
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

  constructor(
    private readonly creditorService: CreditorService,
    private loanService: LoanService,
  ) {}

  @UseGuards(JwtAuthGuard)
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

  // @Post()
  // @ApiCreatedResponse({
  //   type: Creditor,
  //   description: 'The record has been successfully created.',
  // })
  // @ApiBadRequestResponse({
  //   description: 'Bad Request',
  // })
  // async create(
  //   @Body(new ZodPipe(CreateCreditorSchema))
  //   createCreditorDto: CreateCreditorDto,
  // ): Promise<Creditor> {
  //   const creditor =
  //     await this.creditorService.createWithPhone(createCreditorDto);
  //   return creditor;
  // }

  @UseGuards(JwtAuthGuard)
  @ApiAuthorizationHeader()
  @Get('/rolepackage')
  @ApiOkResponse({
    type: GetRolePackageDto,
  })
  async getRolePackage(@Req() req: AuthReqType): Promise<GetRolePackageDto> {
    const result = await this.creditorService.getRolePackage(req.user?.id);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiAuthorizationHeader()
  @Post('/sms')
  @ApiCreatedResponse({
    type: ResponseDto,
    description: 'The SMS reminder has been successfully sent.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  async sendReminderSms(@Body('loanId') loanId: string): Promise<ResponseDto> {
    const result = await this.loanService.sendReminderSmsByLoanId(loanId);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiAuthorizationHeader()
  @Get()
  @ApiOkResponse({ type: Creditor })
  async findOne(@Req() req: AuthReqType): Promise<Creditor> {
    const creditor = await this.creditorService.findOneWithProfileImage(
      req.user?.id,
    );
    return creditor;
  }

  @UseGuards(JwtAuthGuard)
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

  // @UseGuards(JwtAuthGuard)
  // @ApiAuthorizationHeader()
  // @Delete()
  // @ApiOkResponse({ type: ResponseDto })
  // async remove(@Req() req: AuthReqType) {
  //   const status = await this.creditorService.remove(req.user?.id);
  //   return status;
  // }
}
