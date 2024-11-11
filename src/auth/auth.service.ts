import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { CreateCreditorDto } from 'src/creditor/dto/create-creditor.dto';
import { CreditorService } from 'src/creditor/creditor.service';
import { AuthJwtPayload } from './auth-jwtPayload';
import refreshJwtConfig from './refresh-jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private creditorService: CreditorService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateGoogleUser(googleUser) {
    if (!googleUser.email) {
        throw new UnauthorizedException('Google user email is required');
    }
    console.log("gg user", googleUser.googleId)
    //const user = await this.creditorService.findByEmail(googleUser.email);
    const user = await this.creditorService.checkGoogleId(googleUser.googleId)
    if (user != null) return user;
    return await this.creditorService.create(googleUser);
  }

  async phoneLogin(phoneNumber: string, password: string){
    const user = await this.creditorService.checkPhonePass(phoneNumber, password)
    if (user != null){
      const payload: AuthJwtPayload = { type: "phone", sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);

      return {
        accessToken,
        refreshToken
      };
    }
    return null
  }

  googleLogin(req){
    if (!req.user) {
        return 'No user from Google';
    }

    const payload: AuthJwtPayload = { type: "google", sub: req.user.id };
    console.log(req.user.email)
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);

    return {
      user: req.user,
      accessToken,
      refreshToken
    };
  }

  async validateJwtUser(userId: string) {
    const docRef = await this.creditorService.findById(userId);
    if (!docRef) throw new UnauthorizedException('User not found!');
    const user = (await docRef.get()).data();
    if (!user) throw new UnauthorizedException('User not found!');
    return { id: user.id, email: user.email };
  }

  async refreshToken(req) {
    const payload: AuthJwtPayload = { type: req.user.type, sub: req.user.id };
    const accessToken = this.jwtService.sign(payload);
    return {
      id: req.user.id,
      accessToken,
    };
  }
}