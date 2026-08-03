import { Injectable } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {

  private usersFile = path.join(
    process.cwd(),
    'data',
    'users.json',
  );

  createUser(body: any) {

    const data = fs.readFileSync(
      this.usersFile,
      'utf8',
    );

    const users = JSON.parse(data);

    const existingUser = users.find(
      (user) => user.discordId === body.discordId,
    );

    if (existingUser) {

      existingUser.username = body.username;

      existingUser.steamProfile = body.steamProfile;

    } else {

      users.push({
        discordId: body.discordId,
        username: body.username,
        steamProfile: body.steamProfile,
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