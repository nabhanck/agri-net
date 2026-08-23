import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FarmModule } from './farm/farm.module'; 
import { WeatherModule } from './weather/weather.module';
import { AdvisoryModule } from './advisory/advisory.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisoryRulesModule } from './advisory-rules/advisory-rules.module';
import { WeatherForecastsModule } from './weather-forecasts/weather-forecasts.module';
import { FarmCropsModule } from './farm_crops/farm_crops.module'; 
import { CropsModule } from './crops/crops.module';
import { UserModule } from './user/user.module';
import { RuleEngineModule } from './rule-engine/rule-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production!
    }),
    FarmModule, CropsModule, WeatherModule, AdvisoryModule, AdvisoryRulesModule, WeatherForecastsModule, FarmCropsModule, CropsModule, UserModule, RuleEngineModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
