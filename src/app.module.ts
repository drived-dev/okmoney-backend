import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CreditorModule } from './creditor/creditor.module';
import { ConfigModule } from '@nestjs/config';
import { DebtorModule } from './debtor/debtor.module';
import { LoanModule } from './loan/loan.module';
import { GuarantorModule } from './guarantor/guarantor.module';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), CreditorModule, DebtorModule, LoanModule, GuarantorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
