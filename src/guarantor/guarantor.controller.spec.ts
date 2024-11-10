import { Test, TestingModule } from '@nestjs/testing';
import { GuarantorController } from './guarantor.controller';
import { GuarantorService } from './guarantor.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { LoanService } from '@/loan/loan.service';

describe('GuarantorController', () => {
  let controller: GuarantorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      controllers: [GuarantorController],
      providers: [GuarantorService, LoanService],
    }).compile();

    controller = module.get<GuarantorController>(GuarantorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
