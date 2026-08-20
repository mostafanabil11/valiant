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

  // The canonical site URL — used wherever a single address is needed, such as
  // the post-OAuth redirect.
  get frontendUrl(): string {
    return this.frontendUrls[0];
  }

  // FRONTEND_URL may hold several comma-separated origins, because a deployed
  // site legitimately has more than one: the production domain, a custom
  // domain, and Vercel's per-branch preview URLs. All of them need to pass
  // CORS. The first entry is treated as canonical.
  get frontendUrls(): string[] {
    return this.configService
      .get<string>('FRONTEND_URL')!
      .split(',')
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean);
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // Order confirmations, OTPs and password resets all go through here. Without
  // credentials the app still runs — orders are placed, accounts still work —
  // but nothing is delivered, so this is checked explicitly rather than left to
  // fail per-message against placeholder credentials.
  get isEmailConfigured(): boolean {
    return Boolean(this.get('EMAIL_USER') && this.get('EMAIL_PASSWORD'));
  }

  // Google sign-in is optional, exactly like Paymob card payments: all three
  // values or none. Passport's OAuth2 strategy throws from its constructor if
  // clientID is missing, so a half-configured deployment doesn't degrade to
  // "Google button doesn't work" — it takes the whole process down at boot.
  get isGoogleAuthConfigured(): boolean {
    return Boolean(
      this.get('GOOGLE_CLIENT_ID') && this.get('GOOGLE_CLIENT_SECRET') && this.get('GOOGLE_CALLBACK_URL'),
    );
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
