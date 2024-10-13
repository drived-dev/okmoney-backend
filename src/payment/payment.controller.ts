import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly loanService: LoanService,
  ) {}

  @UseGuards(MockAuthGuard)
  @Post('/create')
  // @UseInterceptors(FileInterceptor('file'))
  async createPayment(
    @Req() req: AuthReqType,
    // @Body() createPaymentDto: any,
    // @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('Hello world');
    if (!req.user?.id) {
      throw new BadRequestException('User id is required');
    }

    return { message: 'Hello wrodl' };

    // console.log(createPaymentDto?.data);
    // // check if user id is the owner of loan
    // const loan = await this.loanService.findByIdWithData(
    //   createPaymentDto.loanId,
    // );
    // console.log(loan);
    // if (loan?.creditorId !== req.user.id) {
    //   throw new BadRequestException('You are not the owner of this loan');
    // }

    // console.log('Pass user check');
    // const payment = await this.paymentService.create(createPaymentDto, file);
    // return payment;
  }

  // TODO: Make pagination?
  // @UseGuards(MockAuthGuard)
  @Get()
  async findAll(@Req() req: AuthReqType) {
    console.log('Hello world');
    return 'hello';
    // const payments = await this.paymentService.findAll(req.user.id);
    // return payments;
  }

  @UseGuards(MockAuthGuard)
  @Get(':id')
  async findAllByLoadId(@Req() req: AuthReqType, @Param('id') id: string) {
    const payment = await this.paymentService.findAllByLoadId(req.user.id, id);
    return payment;
  }
}
