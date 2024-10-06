import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreditorService } from 'src/creditor/creditor.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './jwt.config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    FirebaseModule,
    ConfigModule.forRoot()
  ],
  providers: [AuthService, GoogleStrategy, CreditorService,
    {
      provide: 'CONFIGURATION(googleOAuth)',  // Provide the "googleOAuth" configuration
      useValue: {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
    },
    {
      provide: 'CONFIGURATION(jwt)',
      useValue: {
        secret: process.env.JWT_SECRET,
      },
    },
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}