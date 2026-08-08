import { Module } from '@nestjs/common';
import { SteamApiModule } from '../steam/steam-api/steam-api.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [SteamApiModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
