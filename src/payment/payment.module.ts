import { DebtorModule } from '../debtor/debtor.module';
import { LoanModule } from '../loan/loan.module';
import { forwardRef, Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth/jwt.config';

@Module({
  imports: [
    FirebaseModule,
    forwardRef(() => DebtorModule),
    LoanModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
