import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseModule } from '../firebase/firebase.module';
import { GuarantorService } from './guarantor.service';

describe('GuarantorService', () => {
  let service: GuarantorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      providers: [GuarantorService],
    }).compile();

    service = module.get<GuarantorService>(GuarantorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
