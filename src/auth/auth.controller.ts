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
    Query
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { AuthGuard } from '@nestjs/passport';
  import { GoogleAuthGuard } from './google.guard';
import { RefreshAuthGuard } from './refresh-auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('phone/login')
    async login(@Request() req){
      const token = await this.authService.phoneLogin(req.user.phone);
      console.log(token)
      return { accessToken: token.accessToken, refreshToken: token.refreshToken }
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
        // TODO: change redirect url (to app)
        return res.redirect(`http://localhost:3000/api/auth/test?token=${token.accessToken}&refreshToken=${token.refreshToken}`);
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

    @UseGuards(GoogleAuthGuard)
    @Get("test2")
    test2() {
        return `Success`
    }
  }