import { Body, Controller, Post } from '@nestjs/common';
import { CreateDuelDto } from './dto/create-duel.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Post('duels')
  createDuel(@Body() body: CreateDuelDto) {
    return this.usersService.createDuelRecord(body);
  }
}
