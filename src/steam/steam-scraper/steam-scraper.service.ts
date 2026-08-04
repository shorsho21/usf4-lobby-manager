import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';


@Injectable()
export class SteamScraperService {


  constructor(
    private readonly configService: ConfigService,
  ) {}



  async getLobbyLink(
    profileUrl: string,
  ) {


    const steamLoginSecure =
      this.configService.get<string>(
        'STEAM_LOGIN_SECURE'
      );


    const sessionId =
      this.configService.get<string>(
        'STEAM_SESSION_ID'
      );


    const browserId =
      this.configService.get<string>(
        'STEAM_BROWSER_ID'
      );



    const cookie = [

      `steamLoginSecure=${steamLoginSecure}`,

      `sessionid=${sessionId}`,

      `browserid=${browserId}`,

    ].join('; ');



    try {


      const response =
        await axios.get(
          profileUrl,
          {
            headers: {

              Cookie: cookie,

              'User-Agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/138 Safari/537.36',

            },
          },
        );



      const $ =
        cheerio.load(
          response.data
        );



      const game =
        $('.profile_in_game_name')
          .text()
          .trim();



      const joinLink =
        $('.profile_in_game_joingame a')
          .attr('href');



      if (!joinLink) {

        return null;

      }



      return joinLink;



    } catch (error: any) {
      console.log(
        'Error obteniendo lobby:',
        error.message
      );


      console.error(
        error.message
      );


      return null;


    }


  }


}