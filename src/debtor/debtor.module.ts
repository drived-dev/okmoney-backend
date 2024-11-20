import { LoanModule } from '@/loan/loan.module';
import { PaymentModule } from '@/payment/payment.module';
import { forwardRef, Module } from '@nestjs/common';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DebtorController } from './debtor.controller';
import { DebtorService } from './debtor.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@/auth/jwt.config';

@Module({
  imports: [FirebaseModule, forwardRef(() => PaymentModule), LoanModule, JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [DebtorController],
  providers: [DebtorService],
  exports: [DebtorService],
})
export class DebtorModule {}
