import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ConfigService } from './config/config.service';
import { validateEnv } from './config/env.validation';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConfigModule as MyConfigModule } from './config/config.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    // Baseline for every route that doesn't opt into a stricter or looser
    // tier via @Throttle — see auth.controller.ts (5/min on login, register,
    // OTP, password reset) and products/categories controllers' public GET
    // handlers (120/min for normal catalog browsing).
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 60,
    }]),
    MongooseModule.forRootAsync({
      imports: [MyConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.mongodbUri,
      }),
    }),
    MyConfigModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
