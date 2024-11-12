import { z } from 'zod';
import { RolePackage } from '../entities/rolePackage.entity';
import { createZodDto } from '@anatine/zod-nestjs';

export const GetRolePackageSchema = z.object({
  id: z.string(),
  rolePackage: z.nativeEnum(RolePackage),
});

export class GetRolePackageDto extends createZodDto(GetRolePackageSchema) {}
