import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { LoanService } from '../loan/loan.service';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      controllers: [PaymentController],
      providers: [LoanService, PaymentService],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
