import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CreditorModule } from './creditor/creditor.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), CreditorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
