import { Injectable } from '@nestjs/common';
import { SteamScraperService } from './steam-scraper/steam-scraper.service';

@Injectable()
export class SteamService {

  constructor(
    private readonly steamScraperService: SteamScraperService,
  ) {}

  test() {
    return {
      message: 'Steam API funcionando',
    };
  }

  async getProfile() {
    return this.steamScraperService.getLobbyLink();
  }
}