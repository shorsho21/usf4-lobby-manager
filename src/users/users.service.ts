import { Injectable } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { supabase } from 'src/supabase';

@Injectable()
export class UsersService {
  private usersFile = path.join(process.cwd(), 'data', 'users.json');

  async createUser(body: any) {
    const data = fs.readFileSync(this.usersFile, 'utf8');

    const users = JSON.parse(data);
    const supaUser = {
      discord_id: '',
      discord_user: '',
      steam_profile: '',
      steam_ID: '',
    };

    let steamId = '';

    // Si ya vino un SteamID64
    const profilesMatch = body.steamProfile.match(/\/profiles\/(\d+)/);

    if (profilesMatch) {
      steamId = profilesMatch[1];
    } else {
      // Si vino una vanity URL (/id/...)
      const vanityMatch = body.steamProfile.match(/\/id\/([^/]+)/);

      if (vanityMatch) {
        const vanity = vanityMatch[1];

        const response = await axios.get(
          'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/',
          {
            params: {
              key: process.env.STEAM_API_KEY,
              vanityurl: vanity,
            },
          },
        );

        if (response.data.response.success !== 1) {
          return {
            success: false,
            message: 'No se pudo obtener el SteamID.',
          };
        }

        steamId = response.data.response.steamid;
      }
    }

    //guardamos los datos en supauser
    console.log("guardando los datos en local")

    supaUser.discord_id = body.discordId;
    supaUser.discord_user = body.discordUser;
    supaUser.steam_profile = body.steamProfile;
    supaUser.steam_ID = steamId;

    console.log("Datos a guardar:", supaUser);

    console.log("Guardando usuario en Supabase...");
    try {
      await supabase.from('users').upsert([supaUser]);
    } catch (error) {
      console.error('Error al guardar el usuario en Supabase:', error);
      return {
        success: false,
        message: 'Error al guardar el usuario en Supabase.',
      };
    }

    return {
      success: true,
      message: 'Usuario guardado correctamente.',
    };
  }

  async getUserByDiscordId(discordId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    return data;
  }
}
