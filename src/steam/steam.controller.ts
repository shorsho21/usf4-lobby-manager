import { Controller, Get, Param } from '@nestjs/common';
import { SteamService } from './steam.service';


@Controller('steam')
export class SteamController {


  constructor(
    private readonly steamService: SteamService,
  ) {}



  @Get('lobby/:discordId')
  async getLobby(
    @Param('discordId') discordId: string,
  ) {

    return this.steamService.getLobby(
      discordId,
    );

  }

}