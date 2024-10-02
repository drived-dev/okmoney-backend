import { Module } from '@nestjs/common';
import { GuarantorService } from './guarantor.service';
import { GuarantorController } from './guarantor.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [GuarantorController],
  providers: [GuarantorService],
})
export class GuarantorModule {}
