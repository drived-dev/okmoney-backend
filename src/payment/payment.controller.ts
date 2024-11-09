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
    @Body() createPaymentDto: { data: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.debug(`Received payment creation request from user: ${req.user?.id}`);
    this.logger.debug(`File received: ${file ? 'yes' : 'no'}`);
    
    if (!req.user?.id) {
      this.logger.error('User id is missing in the request');
      throw new BadRequestException('User id is required');
    }

    // if (!createPaymentDto?.data) {
    //   this.logger.error('Payment data is missing in the request');
    //   throw new BadRequestException('Data is required');
    // }

    this.logger.debug(`Raw payment data received: ${createPaymentDto[0]}`, { depth: null } );
    const data = JSON.parse(createPaymentDto?.data);
    this.logger.debug(`Parsed payment data: ${JSON.stringify(data, null, 2)}`);
    
    data.creditorId = req.user.id;
    const parsedData = CreatePaymentSchema.safeParse(data);

    if (parsedData.success === false) {
      this.logger.error(`Schema validation failed: ${JSON.stringify(parsedData.error.errors)}`);
      throw new BadRequestException(parsedData.error);
    }
    this.logger.debug('Payment data validation successful');

    // check if user id is the owner of loan
    this.logger.debug(`Fetching loan details for loanId: ${parsedData.data.loanId}`);
    const loan = await this.loanService.findByIdWithData(
      parsedData.data.loanId,
    );
    
    this.logger.debug(`Loan found: ${JSON.stringify(loan, null, 2)}`);
    if (loan?.creditorId !== req.user.id) {
      this.logger.error(
        `User ${req.user?.id} attempted to access loan ${loan.id} owned by ${loan.creditorId}`,
      );
      throw new BadRequestException('You are not the owner of this loan');
    }

    this.logger.debug('Starting payment creation process');
    const payment = await this.paymentService.create(parsedData.data, file);
    this.logger.debug(`Payment created successfully with ID: ${payment.id}`);
    return payment;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get('history')
  @ApiOkResponse({
    type: [Payment],
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
    type: [Payment],
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
