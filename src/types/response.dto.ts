import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
  @ApiProperty({ example: true })
  success: boolean = false;

  @ApiProperty({ example: 'Success', required: false })
  message: string | undefined;
}
