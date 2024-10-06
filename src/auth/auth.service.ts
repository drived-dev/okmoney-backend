import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { CreateCreditorDto } from 'src/creditor/dto/create-creditor.dto';
import { CreditorService } from 'src/creditor/creditor.service';
import { AuthJwtPayload } from './auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private creditorService: CreditorService
  ) {}

  async validateGoogleUser(googleUser) {
    if (!googleUser.email) {
        throw new UnauthorizedException('Google user email is required');
    }
    console.log("gg user", googleUser)
    //const user = await this.creditorService.findByEmail(googleUser.email);
    const user = await this.creditorService.checkId(googleUser.id)
    if (user != null) return user;
    return await this.creditorService.createWithId(googleUser, googleUser.id);
  }

  googleLogin(req){
    if (!req.user) {
        return 'No user from Google';
    }

    const payload: AuthJwtPayload = { email: req.user.email, sub: req.user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
        accessToken,
        user: req.user,
    };
  }

  async validateJwtUser(userId: number) {
    const docRef = await this.creditorService.findById(""+userId);
    if (!docRef) throw new UnauthorizedException('User not found!');
    const user = (await docRef.get()).data();
    if (!user) throw new UnauthorizedException('User not found!');
    return { id: user.id, email: user.email };
  }
}