import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    request['user'] = {
      id: '3Hbj3S8WhbYjyz93kWg1',
    };

    return true;
  }
}
