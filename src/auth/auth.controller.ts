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
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { AuthGuard } from '@nestjs/passport';
  import { GoogleAuthGuard } from './google.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
    
        // Generate JWT token or any other session token
        const jwt = await this.authService.googleLogin(req);
        if (typeof jwt === 'string') {
            // Handle the case where no user is found
            return res.status(400).send(jwt);
          }
        
        console.log(jwt.accessToken)
        return res.redirect(`http://localhost:5173?token=${jwt.accessToken}`);
    }
  }