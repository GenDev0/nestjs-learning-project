// common/decorators/check-ownership.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CHECK_OWNERSHIP_KEY = 'checkOwnership';
export const CheckOwnership = (entity: string) =>
  SetMetadata(CHECK_OWNERSHIP_KEY, entity);
