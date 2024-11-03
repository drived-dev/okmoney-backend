import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
