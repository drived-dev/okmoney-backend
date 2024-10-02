import { Test, TestingModule } from '@nestjs/testing';
import { GuarantorController } from './guarantor.controller';
import { GuarantorService } from './guarantor.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

describe('GuarantorController', () => {
  let controller: GuarantorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      controllers: [GuarantorController],
      providers: [GuarantorService],
    }).compile();

    controller = module.get<GuarantorController>(GuarantorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
