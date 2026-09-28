import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FarmModule } from './farm/farm.module';
import { WeatherModule } from './weather/weather.module';
import { AdvisoryModule } from './advisory/advisory.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisoryRulesModule } from './advisory-rules/advisory-rules.module';
import { WeatherForecastsModule } from './weather-forecasts/weather-forecasts.module';
import { FarmCropsModule } from './farm_crops/farm_crops.module';
import { CropsModule } from './crops/crops.module';
import { UserModule } from './user/user.module';
import { RuleEngineModule } from './rule-engine/rule-engine.module';
import { CropsGrowthStagesModule } from './crops-growth-stages/crops-growth-stages.module';
import { CropGrowthModule } from './crop-growth/crop-growth.module';
import { AuthModule } from './auth/auth.module';
import { MarketPriceModule } from './market-price/market-price.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Set to false in production!
      }),
    }),
    FarmModule,
    CropsModule,
    CropsGrowthStagesModule,
    WeatherModule,
    AdvisoryModule,
    AdvisoryRulesModule,
    WeatherForecastsModule,
    FarmCropsModule,
    UserModule,
    RuleEngineModule,
    CropGrowthModule,
    AuthModule,
    MarketPriceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
