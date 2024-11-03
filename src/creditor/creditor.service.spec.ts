import { Test, TestingModule } from '@nestjs/testing';
import { CreditorService } from './creditor.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

describe('CreditorService', () => {
  let service: CreditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      providers: [CreditorService],
    }).compile();

    service = module.get<CreditorService>(CreditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
