import { Injectable } from '@nestjs/common';
import { SteamScraperService } from './steam-scraper/steam-scraper.service';
import { UsersService } from '../users/users.service';
import { SteamApiService } from './steam-api/steam-api.service';
@Injectable()
export class SteamService {


  constructor(

    private readonly steamScraperService: SteamScraperService,

    private readonly usersService: UsersService,
    private readonly steamApiService: SteamApiService,
  ) {}



  async getLobby(
    discordId: string,
  ) {


    const user =
      await this.usersService.getUserByDiscordId(
        discordId,
      );



    if (!user) {
      console.log(
        'Usuario no registrado o no encontrado. Usa /setsteam primero.',
      );

      return {

        success: false,

        message:
          'Usuario no registrado. Usa /setsteam primero.',

      };

    }



    const steamId =
      user.steam_ID;



    try {
      console.log(
        'Obteniendo lobby para el usuario con discordID:',
        discordId,steamId
      );


      const joinLink =
        await this.steamApiService.getLobbyLink(
          steamId,
        );



      if (!joinLink) {
        console.log(
          'No se encontró un lobby activo de Ultra Street Fighter IV.',
        );

        return {

          success: false,

          message:
            'No se encontró un lobby activo de Ultra Street Fighter IV.',

        };

      }


      console.log(
        'Lobby encontrado para el usuario con discordID:',
        discordId,
        'Join Link:',
        joinLink,
      );
      return {
        


        success: true,


        game:
          'Ultra Street Fighter IV',


        joinLink,


      };



    } catch (error) {
      console.log(
        'Error obteniendo lobby:',
        error,
      );


      console.error(
        'Error obteniendo lobby:',
        error,
      );



      return {

        success: false,

        message:
          'Error buscando el lobby.',

      };


    }


  }


}