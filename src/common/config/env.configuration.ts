import { EnvConfig } from './env.types';

export default (): EnvConfig => ({
  database: {
    type: 'postgres',
    database: process.env.DB_NAME ?? '',
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME ?? '',
    password: process.env.DB_PASSWORD ?? '',
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET ?? '',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '3s',
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
  },
  throttle: {
    ttl: process.env.THROTTLE_TTL ? parseInt(process.env.THROTTLE_TTL, 10) : 60,
    limit: process.env.THROTTLE_LIMIT
      ? parseInt(process.env.THROTTLE_LIMIT, 10)
      : 10,
  },
  cloudinary: {
    cloudinaryUrl: process.env.CLOUDINARY_URL ?? '',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
});
