import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService, // Assuming you have ConfigService injected for configuration access
  ) {}
  getHello(): string {
    const dbConfig = this.configService.get<string>('database');
    console.log('🚀 ~ AppService ~ getHello ~ dbConfig:', dbConfig);
    return 'Hello World!';
  }
}
