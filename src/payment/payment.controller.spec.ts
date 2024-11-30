import { DebtorModule } from '../debtor/debtor.module';
import { LoanModule } from '../loan/loan.module';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseModule } from '../firebase/firebase.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        FirebaseModule,
        DebtorModule,
        LoanModule,
      ],
      controllers: [PaymentController],
      providers: [PaymentService],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
