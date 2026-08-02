import { Injectable } from '@nestjs/common';
import { SteamScraperService } from './steam-scraper/steam-scraper.service';
import { UsersService } from './users/users.service';


@Injectable()
export class SteamService {


  constructor(

    private readonly steamScraperService: SteamScraperService,

    private readonly usersService: UsersService,

  ) {}



  async getLobby(
    discordId: string,
  ) {


    const user =
      this.usersService.getUserByDiscordId(
        discordId,
      );



    if (!user) {

      return {

        success: false,

        message:
          'Usuario no registrado. Usa !setsteam primero.',

      };

    }



    const steamProfile =
      user.steamProfile;



    try {


      const joinLink =
        await this.steamScraperService.getLobbyLink(
          steamProfile,
        );



      if (!joinLink) {

        return {

          success: false,

          message:
            'No se encontró un lobby activo de Ultra Street Fighter IV.',

        };

      }



      return {


        success: true,


        game:
          'Ultra Street Fighter IV',


        joinLink,


      };



    } catch (error) {


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