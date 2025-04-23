import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { CreateCreditorDto } from 'src/creditor/dto/create-creditor.dto';
import { CreditorService } from 'src/creditor/creditor.service';
import { AuthJwtPayload } from './auth-jwtPayload';
import refreshJwtConfig from './refresh-jwt.config';
import { FirebaseRepository } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private creditorService: CreditorService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private firebaseRepository: FirebaseRepository,
  ) {}

  async validateGoogleUser(googleUser: CreateCreditorDto) {
    if (!googleUser.email) {
      throw new UnauthorizedException('Google user email is required');
    }
    if (!googleUser.googleId) {
      throw new UnauthorizedException('Google user id is required');
    }
    console.log('google user ', googleUser.googleId);
    const user = await this.creditorService.checkGoogleId(googleUser.googleId);
    if (user != null) {
      console.log('google user login');
      return user;
    }
    console.log('creating user with google account');
    return await this.creditorService.create(googleUser);
  }

  async validateLineUser(lineUser: CreateCreditorDto) {
    if (!lineUser.lineId) {
      throw new UnauthorizedException('Line user is required');
    }
    console.log('line user ', lineUser.lineId);
    const user = await this.creditorService.checkLineId(lineUser.lineId);
    if (user != null) {
      console.log('line user login');
      return user;
    }
    console.log('creating user with line account');
    return await this.creditorService.create(lineUser);
  }

  async validateFacebookUser(facebookUser: CreateCreditorDto) {
    if (!facebookUser.facebookId) {
      throw new UnauthorizedException('Facebook user is required');
    }
    console.log('facebook user ', facebookUser.facebookId);
    const user = await this.creditorService.checkFacebookId(
      facebookUser.facebookId,
    );
    if (user != null) {
      console.log('facebook user login');
      return user;
    }
    console.log('creating user with facebook account');
    return await this.creditorService.create(facebookUser);
  }

  async validateAppleUser(appleUser: CreateCreditorDto) {
    if (!appleUser.appleId) {
      throw new UnauthorizedException('Apple user ID is required');
    }

    console.log('apple user ', appleUser.appleId);
    const user = await this.creditorService.checkAppleId(appleUser.appleId);
    if (user != null) {
      console.log('apple user login');
      return user;
    }

    console.log('creating user with apple account');
    return await this.creditorService.create(appleUser);
  }

  async phoneRegister(phoneUser: CreateCreditorDto) {
    if (phoneUser.phoneNumber) {
      return await this.creditorService.createWithPhone(phoneUser);
    }
    return 'missing phone number';
  }

  async phoneLogin(phoneNumber: string, password: string) {
    const user = await this.creditorService.checkPhonePass(
      phoneNumber,
      password,
    );

    if (user) {
      const payload: AuthJwtPayload = { type: 'phone', sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(
        payload,
        this.refreshTokenConfig,
      );

      // Remove password from the user's record after successful login
      await this.firebaseRepository.db
        .collection('creditor')
        .doc(user.id)
        .update({
          password: admin.firestore.FieldValue.delete(),
          updatedAt: Date.now(),
        });

      return {
        accessToken,
        refreshToken,
      };
    }

    return null;
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from Google';
    }

    const payload: AuthJwtPayload = { type: 'google', sub: req.user.id };
    console.log(req.user.email);
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);

    return {
      user: req.user,
      accessToken,
      refreshToken,
    };
  }

  async lineLogin(userId) {
    const payload: AuthJwtPayload = { type: 'line', sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return { accessToken, refreshToken };
  }

  async facebookLogin(userId) {
    const payload: AuthJwtPayload = { type: 'line', sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return { accessToken, refreshToken };
  }

  async appleLogin(userId) {
    const payload: AuthJwtPayload = { type: 'apple', sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);

    return {
      accessToken,
      refreshToken,
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
