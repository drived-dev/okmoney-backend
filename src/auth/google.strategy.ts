import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from './google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('CONFIGURATION(googleOAuth)')
    private readonly googleOAuthConfig: {
      clientID: string;
      clientSecret: string;
      callbackURL: string;
    },
    private authService: AuthService,
  ) {
    super({
      clientID: googleOAuthConfig.clientID,
      clientSecret: googleOAuthConfig.clientSecret,
      callbackURL: googleOAuthConfig.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log({ profile });
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      storeName: "",
      rolePackage: "FREE",
      googleId: profile.id,
      //avatarUrl: profile.photos[0].value,
      //password: '',
    });
    done(null, user);
    return user;
  }
}
