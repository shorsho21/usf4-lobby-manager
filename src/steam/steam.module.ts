import { Module } from '@nestjs/common';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';
import { SteamSessionService } from './steam-session/steam-session.service';
import { SteamScraperService } from './steam-scraper/steam-scraper.service';
import { UsersService } from './users/users.service';


@Module({
  controllers: [
    SteamController
  ],

  providers: [
    SteamService,
    SteamSessionService,
    SteamScraperService,
    UsersService,
  ],

  exports: [
    SteamService
  ],
})
export class SteamModule {}