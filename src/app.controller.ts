import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("cron")
  testCron() {
    return this.appService.testCron();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
