import { Test, TestingModule } from '@nestjs/testing';
import { GuarantorService } from './guarantor.service';

describe('GuarantorService', () => {
  let service: GuarantorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuarantorService],
    }).compile();

    service = module.get<GuarantorService>(GuarantorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
