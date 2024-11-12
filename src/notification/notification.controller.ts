import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getHello(): string {
    return this.notificationService.getHello();
  }

  @Post('send')
  async sendSms(@Body('to') to: string, @Body('msg') msg: string) {
    const result = await this.notificationService.sendSms(to, msg);
    return result;
  }
}
