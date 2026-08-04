import { Module } from '@nestjs/common';

import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';
import { SteamSessionService } from './steam-session/steam-session.service';
import { SteamScraperService } from './steam-scraper/steam-scraper.service';

import { UsersModule } from '../users/users.module';
import { SteamApiService } from './steam-api/steam-api.service';


@Module({

  imports: [
    UsersModule,
  ],

  controllers: [
    SteamController,
  ],

  providers: [
    SteamService,
    SteamSessionService,
    SteamScraperService,
    SteamApiService,
  ],

  exports: [
    SteamService,
  ],

})
export class SteamModule {}