import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Request,
    Res,
    UseGuards,
    Query,
    Body
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { AuthGuard } from '@nestjs/passport';
  import { GoogleAuthGuard } from './google.guard';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { MockAuthGuard } from './mockAuthGuard';
import { JwtAuthGuard } from './jwt-auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('phone/login')
    async login(
      @Body('phone') phone: string,
      @Body('password') password: string,
    ){
      const token = await this.authService.phoneLogin(phone, password);
      console.log(token)
      if(token) return { accessToken: token.accessToken, refreshToken: token.refreshToken }
      return "Invalid PhoneNumber or Password"
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
        console.log(token)
        console.log(user.id)
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/google?token=${token.accessToken}&refreshToken=${token.refreshToken}&userId=${user.id}`;
        return res.redirect(302, redirectUrl);
    }

    @UseGuards(RefreshAuthGuard)
    @Post("refresh")
    refreshToken(@Req() req) {
      return this.authService.refreshToken(req);
    }

    @Get("test?")
    test(
        @Query('token') token: string,
        @Query('refreshToken') refreshToken: string,
    ) {
        return `Token: ${token}<br>RefreshToken: ${refreshToken}`
    }

    @UseGuards(JwtAuthGuard)
    @Get("test2")
    test2() {
        return `Success`
    }
  }