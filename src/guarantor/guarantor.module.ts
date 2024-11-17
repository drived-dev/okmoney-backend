import { LoanModule } from '@/loan/loan.module';
import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { GuarantorController } from './guarantor.controller';
import { GuarantorService } from './guarantor.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@/auth/jwt.config';

@Module({
  imports: [FirebaseModule, LoanModule, JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [GuarantorController],
  providers: [GuarantorService],
  exports: [GuarantorService],
})
export class GuarantorModule {}
