import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SteamApiService {
  private readonly playerSummariesUrl =
    'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';
  private readonly resolveVanityUrl =
    'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/';

  constructor(private readonly configService: ConfigService) {}

  async getLobbyLink(steamId: string): Promise<string | null> {
    try {
      const response = await axios.get(this.playerSummariesUrl, {
        params: {
          key: this.configService.getOrThrow<string>('STEAM_API_KEY'),
          steamids: steamId,
        },
      });
      const player = response.data.response.players[0];

      if (!player) {
        console.log('Jugador no encontrado.');
        return null;
      }
      if (!player.gameid) {
        console.log('El jugador no está jugando.');
        return null;
      }
      if (!player.lobbysteamid) {
        console.log('El jugador no tiene un lobby.');
        return null;
      }
      return `steam://joinlobby/${player.gameid}/${player.lobbysteamid}/${player.steamid}`;
    } catch (error: any) {
      console.error(
        'Error consultando Steam API:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  async resolveProfileId(profile: string): Promise<string | null> {
    const profileIdMatch = profile.match(/\/profiles\/(\d+)/);
    if (profileIdMatch) return profileIdMatch[1];

    const vanityMatch = profile.match(/\/id\/([^/]+)/);
    if (!vanityMatch) return null;

    try {
      const response = await axios.get(this.resolveVanityUrl, {
        params: {
          key: this.configService.getOrThrow<string>('STEAM_API_KEY'),
          vanityurl: vanityMatch[1],
        },
      });
      return response.data.response.success === 1
        ? response.data.response.steamid
        : null;
    } catch (error: any) {
      console.error(
        'Error resolviendo el perfil de Steam:',
        error.response?.data || error.message,
      );
      return null;
    }
  }
}
