import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SteamApiService } from '../steam/steam-api/steam-api.service';
import { CreateDuelDto } from './dto/create-duel.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly steamApiService: SteamApiService,
  ) {}

  async createUser(body: CreateUserDto) {
    const username = body.username ?? body.discordUser;
    if (!body.discordId || !username || !body.steamProfile) {
      throw new BadRequestException(
        'discordId, username y steamProfile son obligatorios.',
      );
    }

    const steamId = await this.steamApiService.resolveProfileId(
      body.steamProfile,
    );
    if (!steamId) {
      return { success: false, message: 'No se pudo obtener el SteamID.' };
    }

    try {
      await this.usersRepository.upsertUser({
        discord_id: body.discordId,
        discord_user: username,
        steam_profile: body.steamProfile,
        steam_ID: steamId,
      });
    } catch (error) {
      this.logger.error('Error al guardar el usuario en Supabase:', error);
      return {
        success: false,
        message: 'Error al guardar el usuario en Supabase.',
      };
    }
    return { success: true, message: 'Usuario guardado correctamente.' };
  }

  async getUserByDiscordId(discordId: string) {
    try {
      return await this.usersRepository.findByDiscordId(discordId);
    } catch (error) {
      this.logger.error('Error al obtener el usuario de Supabase:', error);
      return null;
    }
  }

  async createDuelRecord(body: CreateDuelDto) {
    try {
      const data = await this.usersRepository.createDuel(body);
      return {
        success: true,
        message: 'Duelo registrado correctamente.',
        data,
      };
    } catch (error) {
      this.logger.error('Error al insertar el duelo en Supabase:', error);
      return {
        success: false,
        message: 'Error al registrar el resultado del duelo.',
      };
    }
  }
}
