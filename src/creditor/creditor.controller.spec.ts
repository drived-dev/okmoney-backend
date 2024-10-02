import { Test, TestingModule } from '@nestjs/testing';
import { CreditorController } from './creditor.controller';
import { CreditorService } from './creditor.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

describe('CreditorController', () => {
  let controller: CreditorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      controllers: [CreditorController],
      providers: [CreditorService],
    }).compile();

    controller = module.get<CreditorController>(CreditorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
