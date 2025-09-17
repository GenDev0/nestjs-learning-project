export interface EnvConfig {
  database: {
    type: 'postgres';
    database: string;
    host: string;
    port: number;
    username: string;
    password: string;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
  cloudinary: {
    cloudinaryUrl: string;
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}
