import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from './jwt.config';
import { AuthJwtPayload } from './auth-jwtPayload';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import refreshJwtConfig from './refresh-jwt.config';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refrshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refrshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // authorization: Bearer sldfk;lsdkf'lskald'sdkf;sdl

  validate(req: Request, payload: AuthJwtPayload) {
    return { id: payload.sub }
    // const authHeader = req.get('authorization');
    // if (!authHeader) {
    //     throw new UnauthorizedException('Authorization header is missing');
    // }

    // const refreshToken = authHeader.replace('Bearer', '').trim();
    // const userId = payload.sub;
    // return this.authService.validateRefreshToken(userId, refreshToken);
  }
}