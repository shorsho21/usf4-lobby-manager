import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createUser(@Body() body: any) {
    return await this.usersService.createUser(body);
  }

  // Este método responde a POST /users/duels sin necesidad de carpetas extra
  @Post('duels')
  async createDuel(@Body() body: any) {
    return await this.usersService.createDuelRecord(body);
  }
}