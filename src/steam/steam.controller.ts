import { Controller, Get } from '@nestjs/common';
import { SteamService } from './steam.service';

@Controller('steam')
export class SteamController {

  constructor(
    private readonly steamService: SteamService,
  ) {}

  @Get('test')
  test() {
    return this.steamService.test();
  }

  @Get('lobby')
  lobby() {
    return this.steamService.getProfile();
  }
}