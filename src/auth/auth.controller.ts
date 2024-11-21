import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LineAuthGuard } from './line.guard';
import { HttpService } from '@nestjs/axios';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { FacebookAuthGuard } from './facebook.guard';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { RolePackage } from '@/creditor/entities/rolePackage.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly httpService: HttpService) {}

  @Post('phone/register')
  async register(
    @Body('phoneNumber') phoneNumber: string
  ) {
    const success = await this.authService.phoneRegister({
      email: "",
      firstName: "",
      lastName: "",
      storeName: "",
      rolePackage: RolePackage.FREE,
      phoneNumber: phoneNumber
    });
    if(success) return "OTP Sent"
    return "Error"
  }

  @Post('phone/login')
  async login(
    @Body('phoneNumber') phoneNumber: string,
    @Body('password') password: string,
  ) {
    const token = await this.authService.phoneLogin(phoneNumber, password);
    console.log(token);
    if (token)
      return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    throw new HttpException('Invalid PhoneNumber or OTP', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;
    if (!user) {
      return res.status(400).send('No user found');
    }

    const token = await this.authService.googleLogin(req);
    if (typeof token === 'string') {
      return res.status(400).send(token);
    }
    console.log(token);
    console.log(user.id);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google?token=${token.accessToken}&refreshToken=${token.refreshToken}&userId=${user.id}`;
    return res.redirect(302, redirectUrl);
  }

    @UseGuards(LineAuthGuard)
    @Get('line/login')
    lineLogin() {}

    @Get('line/callback')
    async lineCallback(
      @Query('code') code: string,
      @Res() res
    ) {
      const url = 'https://api.line.me/oauth2/v2.1/token';
      
      const data = qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/api/auth/line/callback',
        client_id: process.env.LINE_CHANNEL_ID,
        client_secret: process.env.LINE_CHANNEL_SECRET,
      });
  
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
  
      try {
        const response = await firstValueFrom(
          this.httpService.post(url, data, { headers })
        );
        console.log(response.data);
        const lineId = jwt.decode(response.data.id_token)?.sub?.toString();
        
        const user = await this.authService.validateLineUser({
          email: "",
          firstName: "",
          lastName: "",
          storeName: "",
          rolePackage: RolePackage.FREE,
          lineId: lineId,
        });

        const token = await this.authService.lineLogin(user.id);
        console.log('Generated tokens:', token);
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/line?token=${token.accessToken}&refreshToken=${token.refreshToken}`;
        return res.redirect(302, redirectUrl);
      } catch (error) {
        console.error('Error making POST request', error);
      }
    }

    @UseGuards(FacebookAuthGuard)
    @Get('facebook/login')
    facebookLogin() {}

    @Get('facebook/callback')
    async facebookCallback(
      @Query('code') code: string,
      @Res() res,
    ) {
      const url = 'https://graph.facebook.com/v12.0/oauth/access_token';
    
      const data = qs.stringify({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: 'http://localhost:3000/api/auth/facebook/callback',
        code: code,
      });
    
      try {
        // Exchange authorization code for access token
        const response = await firstValueFrom(
          this.httpService.post(url, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        );
    
        const accessToken = response.data.access_token;
        const userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
        
        // Get user info from Facebook
        const userInfoResponse = await firstValueFrom(this.httpService.get(userInfoUrl));
        const { id: facebookId, name, email } = userInfoResponse.data;
        
        // Authenticate or register the user
        const user = await this.authService.validateFacebookUser({
          email: "",
          firstName: "",
          lastName: "",
          storeName: "",
          rolePackage: RolePackage.FREE,
          facebookId: facebookId,
        });
    
        const token = await this.authService.facebookLogin(user.id);
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/facebook?token=${token.accessToken}&refreshToken=${token.refreshToken}`;
        return res.redirect(302, redirectUrl);
    
      } catch (error) {
        console.error('Error in Facebook authentication', error);
        return res.status(500).send('Facebook authentication failed');
      }
    }

    @UseGuards(RefreshAuthGuard)
    @Post("refresh")
    refreshToken(@Req() req) {
      return this.authService.refreshToken(req);
    }

  @Get('test?')
  test(
    @Query('token') token: string,
    @Query('refreshToken') refreshToken: string,
  ) {
    return `Token: ${token}<br>RefreshToken: ${refreshToken}`;
  }

  @UseGuards(JwtAuthGuard)
  @Get('test2')
  test2() {
    return `Success`;
  }
}
