import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateDuelDto } from './dto/create-duel.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RematchActionDto } from './dto/rematch-action.dto';
import { UsersService } from './users.service';
import { get } from 'axios';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //CREA UN NUEVO USUARIO
  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  //CREA UN NUEVO DUELO
  @Post('duels')
  createDuel(@Body() body: CreateDuelDto) {
    return this.usersService.createDuelRecord(body);
  }

  //SOLICITA UN REMATCH
  @Post('duels/:duelId/rematch')
  requestRematch(
    @Param('duelId') duelId: string,
    @Body() body: RematchActionDto,
  ) {
    return this.usersService.requestRematch(duelId, body.discordId);
  }

  //ACEPTA UN REMATCH
  @Post('duels/:duelId/rematch/accept')
  acceptRematch(
    @Param('duelId') duelId: string,
    @Body() body: RematchActionDto,
  ) {
    return this.usersService.acceptRematch(
      duelId,
      body.discordId,
      body.requestId,
    );
  }

  //RECHAZA UN REMATCH
  @Post('duels/:duelId/rematch/reject')
  rejectRematch(
    @Param('duelId') duelId: string,
    @Body() body: RematchActionDto,
  ) {
    return this.usersService.rejectRematch(
      duelId,
      body.discordId,
      body.requestId,
    );
  }

  @Get(':discordId/profile')
  getProfile(@Param('discordId') discordId: string) {
    return this.usersService.getProfile(discordId);
  }
}
