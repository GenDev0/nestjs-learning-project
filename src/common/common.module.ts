import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  providers: [HashingService, JwtService],
  exports: [HashingService],
  imports: [UsersModule],
})
export class CommonModule {}
