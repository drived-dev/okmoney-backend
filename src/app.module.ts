import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CreditorModule } from './creditor/creditor.module';
import { ConfigModule } from '@nestjs/config';
import { DebtorModule } from './debtor/debtor.module';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), CreditorModule, DebtorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
