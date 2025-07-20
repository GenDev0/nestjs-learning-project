import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hasing.service';

@Global()
@Module({
  providers: [HashingService],
  exports: [HashingService],
})
export class CommonModule {}
