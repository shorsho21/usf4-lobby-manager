import { Injectable } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class UsersService {
  private usersFile = path.join(
    process.cwd(),
    'data',
    'users.json',
  );

  async createUser(body: any) {
    const data = fs.readFileSync(
      this.usersFile,
      'utf8',
    );

    const users = JSON.parse(data);

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

    const existingUser = users.find(
      (user) => user.discordId === body.discordId,
    );

    if (existingUser) {
      existingUser.username = body.username;
      existingUser.steamProfile = body.steamProfile;
      existingUser.steamId = steamId;
    } else {
      users.push({
        discordId: body.discordId,
        username: body.username,
        steamProfile: body.steamProfile,
        steamId: steamId,
      });
    }

    fs.writeFileSync(
      this.usersFile,
      JSON.stringify(users, null, 2),
    );

    return {
      success: true,
      message: 'Usuario guardado correctamente.',
    };
  }

  getUserByDiscordId(discordId: string) {
    const data = fs.readFileSync(
      this.usersFile,
      'utf8',
    );

    const users = JSON.parse(data);

    return users.find(
      (user) => user.discordId === discordId,
    );
  }
}