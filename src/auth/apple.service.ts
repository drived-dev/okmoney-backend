import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateCreditorDto } from 'src/creditor/dto/create-creditor.dto';
import { CreditorService } from 'src/creditor/creditor.service';
import { RolePackage } from '@/creditor/entities/rolePackage.entity';

@Injectable()
export class AppleService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly creditorService: CreditorService,
  ) {}

  async registerByIDtoken(payload: any) {
    console.log(payload);
    if (!payload?.id_token) {
      throw new UnauthorizedException('Missing id_token');
    }

    const decodedObj: any = this.jwtService.decode(payload.id_token);
    const appleId = decodedObj?.sub;
    const email = decodedObj?.email || '';
    let firstName = '';
    let lastName = '';

    console.info(`Apple ID: ${appleId}`);
    if (email) {
      console.info(`Apple Email: ${email}`);
    }

    if (payload.user) {
      try {
        const userData = JSON.parse(payload.user);
        firstName = userData.name?.firstName || '';
        lastName = userData.name?.lastName || '';
      } catch (err) {
        console.warn('Error parsing Apple user JSON:', err);
      }
    }

    if (!appleId) {
      throw new UnauthorizedException('Invalid Apple ID token');
    }

    // Check or create user
    let user = await this.creditorService.checkAppleId(appleId);
    if (!user) {
      const newUser: CreateCreditorDto = {
        email,
        firstName,
        lastName,
        appleId,
        storeName: '',
        rolePackage: RolePackage.FREE,
      };
      return await this.creditorService.create(newUser);
    }

    return user;
  }
}
