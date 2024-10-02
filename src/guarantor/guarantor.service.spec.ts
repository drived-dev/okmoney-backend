import { Test, TestingModule } from '@nestjs/testing';
import { GuarantorService } from './guarantor.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

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
