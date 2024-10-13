import {
  BadRequestException,
  Body,
  Controller,
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
import { ApiTags } from '@nestjs/swagger';
import { MockAuthGuard } from '../auth/mockAuthGuard';
import { AuthReqType } from '../auth/reqType';
import { LoanService } from '../loan/loan.service';
import { CreatePaymentSchema } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly loanService: LoanService,
  ) {}

  @UseGuards(MockAuthGuard)
  @Post('/create')
  @UseInterceptors(FileInterceptor('file'))
  async createPayment(
    @Req() req: AuthReqType,
    @Body() createPaymentDto: any,
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

  // TODO: Make pagination?
  @UseGuards(MockAuthGuard)
  @Get()
  async findAll(@Req() req: AuthReqType) {
    const payments = await this.paymentService.findAll(req.user.id);
    return payments;
  }

  @UseGuards(MockAuthGuard)
  @Get(':id')
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
}
