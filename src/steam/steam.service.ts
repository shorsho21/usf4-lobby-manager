import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SteamApiService } from './steam-api/steam-api.service';

@Injectable()
export class SteamService {
  constructor(
    private readonly usersService: UsersService,
    private readonly steamApiService: SteamApiService,
  ) {}

  async getLobby(discordId: string) {
    const user = await this.usersService.getUserByDiscordId(discordId);
    if (!user) {
      console.log(
        'Usuario no registrado o no encontrado. Usa /setsteam primero.',
      );
      return {
        success: false,
        message: 'Usuario no registrado. Usa /setsteam primero.',
      };
    }

    try {
      const joinLink = await this.steamApiService.getLobbyLink(user.steam_ID);
      if (!joinLink) {
        return {
          success: false,
          message: 'No se encontró un lobby activo de Ultra Street Fighter IV.',
        };
      }
      return {
        success: true,
        game: 'Ultra Street Fighter IV',
        joinLink,
      };
    } catch (error) {
      console.error('Error obteniendo lobby:', error);
      return { success: false, message: 'Error buscando el lobby.' };
    }
  }
}
