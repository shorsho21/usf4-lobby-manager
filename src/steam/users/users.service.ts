import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  private usersFile = path.join(
    process.cwd(),
    'discord-bot',
    'data',
    'users.json',
  );

  getUserByDiscordId(discordId: string) {
    const data = fs.readFileSync(this.usersFile, 'utf-8');

    const users = JSON.parse(data);

    return users.find((user) => user.discordId === discordId);
  }
}
