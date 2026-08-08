import { Module } from '@nestjs/common';
import { SteamApiService } from './steam-api.service';

@Module({
  providers: [SteamApiService],
  exports: [SteamApiService],
})
export class SteamApiModule {}
