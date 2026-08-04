import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SteamApiService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async getLobbyLink(
    steamId: string,
  ): Promise<string | null> {

    try {

      const apiKey =
        this.configService.get<string>(
          'STEAM_API_KEY',
        );

      const response =
        await axios.get(
          'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
          {
            params: {
              key: apiKey,
              steamids: steamId,
            },
          },
        );

      const player =
        response.data.response.players[0];

      if (!player) {
        console.log('Jugador no encontrado.');

        return null;
      }

      console.log('Steam API Response:');
      console.log(player);

      // ¿Está jugando algo?
      if (!player.gameid) {
        console.log('El jugador no está jugando.');

        return null;
      }

      // ¿Tiene lobby?
      if (!player.lobbysteamid) {
        console.log('El jugador no tiene un lobby.');

        return null;
      }

      const joinLink =
        `steam://joinlobby/${player.gameid}/${player.lobbysteamid}/${player.steamid}`;

      return joinLink;

    } catch (error: any) {

      console.error(
        'Error consultando Steam API:',
        error.response?.data || error.message,
      );

      return null;
    }
  }
}