import { Module } from '@nestjs/common';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';
import { UsersModule } from '../users/users.module';
import { SteamApiModule } from './steam-api/steam-api.module';

@Module({
  imports: [UsersModule, SteamApiModule],
  controllers: [SteamController],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
