import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from 'passport-line';

@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, 'line') {
  constructor() {
    super({
      channelID: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      callbackURL: process.env.LINE_CALLBACK_URL,
      scope: 'openid',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const { id, displayName, pictureUrl, email } = profile;
    const user = {
      id,
      displayName,
      pictureUrl,
      email,
    };
    done(null, user);
  }
}
