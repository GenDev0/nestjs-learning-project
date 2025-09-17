import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { EnvConfig } from 'src/common/config/env.types';
import { CLOUDINARY, CloudinaryType } from './cloudinary.constants';

export const CloudinaryProvider: Provider<CloudinaryType> = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService<EnvConfig>) => {
    cloudinary.config({
      cloud_name: configService.get('cloudinary.cloudName', { infer: true }),
      api_key: configService.get('cloudinary.apiKey', { infer: true }),
      api_secret: configService.get('cloudinary.apiSecret', { infer: true }),
    });
    return cloudinary;
  },
  inject: [ConfigService],
};
