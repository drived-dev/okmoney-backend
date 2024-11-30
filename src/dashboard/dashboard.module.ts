import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth/jwt.config';

@Module({
  imports: [FirebaseModule, JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
