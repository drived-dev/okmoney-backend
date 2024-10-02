import { Test, TestingModule } from '@nestjs/testing';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from '../firebase/firebase.module';

describe('DebtorController', () => {
  let controller: DebtorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      controllers: [DebtorController],
      providers: [DebtorService],
    }).compile();

    controller = module.get<DebtorController>(DebtorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
