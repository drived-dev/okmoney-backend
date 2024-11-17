import { Module } from '@nestjs/common';
import { CreditorService } from './creditor.service';
import { CreditorController } from './creditor.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@/auth/jwt.config';

@Module({
  imports: [FirebaseModule, NotificationModule, JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [CreditorController],
  providers: [CreditorService],
  exports: [CreditorService],
})
export class CreditorModule {}
