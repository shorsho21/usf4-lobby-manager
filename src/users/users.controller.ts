import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreateDuelDto } from './dto/create-duel.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RematchActionDto } from './dto/rematch-action.dto';
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

  @Post('duels/:duelId/rematch')
  requestRematch(
    @Param('duelId') duelId: string,
    @Body() body: RematchActionDto,
  ) {
    return this.usersService.requestRematch(duelId, body.discordId);
  }

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
}
