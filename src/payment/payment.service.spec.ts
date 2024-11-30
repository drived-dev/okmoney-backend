import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { DebtorModule } from '../debtor/debtor.module';
import { LoanModule } from '../loan/loan.module';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        FirebaseModule,
        DebtorModule,
        LoanModule,
      ],
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
