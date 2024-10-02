import { Test, TestingModule } from '@nestjs/testing';
import { DebtorService } from './debtor.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from '../firebase/firebase.module';

describe('DebtorService', () => {
  let service: DebtorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FirebaseModule],
      providers: [DebtorService],
    }).compile();

    service = module.get<DebtorService>(DebtorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
