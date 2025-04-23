import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RolePackage } from '@/creditor/entities/rolePackage.entity';
import { Profile, Strategy } from '@arendajaelu/nestjs-passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      key: process.env.APPLE_PRIVATE_KEY,
      callbackURL: process.env.APPLE_CALLBACK_URL,
      scope: ['email', 'name'],
      passReqToCallback: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log({ profile });
    const user = await this.authService.validateAppleUser({
      email: profile?.email || '',
      firstName: '',
      lastName: '',
      storeName: '',
      rolePackage: RolePackage.FREE,
      appleId: profile.id,
    });
    return user;
  }
}
