import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { CreateCreditorDto } from 'src/creditor/dto/create-creditor.dto';
import { CreditorService } from 'src/creditor/creditor.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private creditorService: CreditorService
  ) {}

  async validateGoogleUser(googleUser: CreateCreditorDto) {
    if (!googleUser.email) {
        throw new UnauthorizedException('Google user email is required');
    }

    const user = await this.creditorService.findByEmail(googleUser.email);
    if (user != null) return user;
    return await this.creditorService.create(googleUser);
  }

  googleLogin(req){
    if (!req.user) {
        return 'No user from Google';
    }

    const payload = { email: req.user.email, sub: req.user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
        accessToken,
        user: req.user,
    };
  }
}