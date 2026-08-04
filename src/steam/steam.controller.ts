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
    console.log("Estoy entrando al endpoint de lobby con discordID: ", discordId);

    return this.steamService.getLobby(
      discordId,
    );

  }

}