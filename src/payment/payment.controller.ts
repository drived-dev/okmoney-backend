import { ApiAuthorizationHeader } from '@/utils/auth.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';
import { LoanService } from '../loan/loan.service';
import {
  CreatePaymentDto,
  CreatePaymentSchema,
} from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { ResponseDto } from '@/types/response.dto';
import { GetPaymentDto } from './dto/get-payment.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly loanService: LoanService,
  ) {}

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Post('/create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiExtraModels(CreatePaymentDto)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          $ref: getSchemaPath(CreatePaymentDto),
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Create a payment with slip image as optional',
    description:
      'Request type is multipart/form-data where file attribute contains the slip image and data attribute contains the CreatePaymentDto object',
  })
  @ApiCreatedResponse({
    description: 'The payment has been successfully created.',
    type: Payment,
  })
  async createPayment(
    @Req() req: AuthReqType,
    @Body() createPaymentDto: { data: string }, // TODO: multipart form data send only file or string (JSON is not supported)
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('User id is required');
    }

    if (!createPaymentDto?.data) {
      this.logger.error('Data is required');
      throw new BadRequestException('Data is required');
    }

    const data = JSON.parse(createPaymentDto?.data);
    data.creditorId = req.user.id;
    const parsedData = CreatePaymentSchema.safeParse(data);

    if (parsedData.success === false) {
      this.logger.error(parsedData.error);
      throw new BadRequestException(parsedData.error);
    }

    // check if user id is the owner of loan
    const loan = await this.loanService.findByIdWithData(
      parsedData.data.loanId,
    );
    if (loan?.creditorId !== req.user.id) {
      this.logger.error(
        `${req.user?.id} are not the owner of the loan with id: ${loan.id}`,
      );
      throw new BadRequestException('You are not the owner of this loan');
    }

    const payment = await this.paymentService.create(parsedData.data, file);
    return payment;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get('history')
  @ApiOkResponse({
    type: [GetPaymentDto],
    description: 'Get all payments by creditor Id',
  })
  async findAll(@Req() req: AuthReqType) {
    const payments = await this.paymentService.findAll(req.user.id);
    return payments;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get('history/debtor/:id')
  @ApiOkResponse({
    type: [GetPaymentDto],
    description: 'Get all payments by debtor Id',
  })
  async findAllByDebtorId(
    @Req() req: AuthReqType,
    @Param('id') debtorId: string,
  ) {
    const payment = await this.paymentService.findAllByDebtorId(
      req.user.id,
      debtorId,
    );
    return payment;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Delete(':id')
  @ApiOkResponse({
    type: ResponseDto,
    description: 'Delete payment with payment id as param',
  })
  async remove(@Req() req: AuthReqType, @Param('id') paymentId: string) {
    return this.paymentService.remove(paymentId, req.user?.id);
  }
}
