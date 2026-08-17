import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<EnvConfig>) {}

  get<T = any>(key: keyof EnvConfig): T | undefined {
    return this.configService.get<T>(key);
  }

  get mongodbUri(): string {
    return this.configService.get<string>('MONGODB_URI')!;
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET')!;
  }

  get jwtExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION')!;
  }

  get jwtRefreshExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION')!;
  }

  get port(): number {
    return this.configService.get<number>('PORT')!;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV')!;
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL')!;
  }

  get paymobApiKey(): string {
    return this.configService.get<string>('PAYMOB_API_KEY')!;
  }

  get paymobIntegrationId(): string {
    return this.configService.get<string>('PAYMOB_INTEGRATION_ID')!;
  }

  get paymobIframeId(): string {
    return this.configService.get<string>('PAYMOB_IFRAME_ID')!;
  }

  get paymobHmacSecret(): string {
    return this.configService.get<string>('PAYMOB_HMAC_SECRET')!;
  }
}
