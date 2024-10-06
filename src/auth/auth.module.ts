import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreditorService } from 'src/creditor/creditor.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'your_jwt_secret', // Replace this with a strong secret
      signOptions: { expiresIn: '1h' },
    }),
    FirebaseModule,
    ConfigModule.forRoot()
  ],
  providers: [AuthService, GoogleStrategy, CreditorService, {
    provide: 'CONFIGURATION(googleOAuth)',  // Provide the "googleOAuth" configuration
    useValue: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
  },],
  controllers: [AuthController],
})
export class AuthModule {}