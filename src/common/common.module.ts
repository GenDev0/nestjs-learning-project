import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hasing.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  providers: [HashingService, JwtService],
  exports: [HashingService],
})
export class CommonModule {}
