import { Module } from '@nestjs/common';
import { GuarantorService } from './guarantor.service';
import { GuarantorController } from './guarantor.controller';

@Module({
  controllers: [GuarantorController],
  providers: [GuarantorService],
})
export class GuarantorModule {}
