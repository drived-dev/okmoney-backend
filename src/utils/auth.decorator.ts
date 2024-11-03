import { ApiHeader } from '@nestjs/swagger';

export function ApiAuthorizationHeader() {
  return ApiHeader({
    name: 'Authorization',
    description: 'Authorization token for authentication',
    required: true,
  });
}
