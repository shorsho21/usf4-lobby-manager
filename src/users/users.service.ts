import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SteamApiService } from '../steam/steam-api/steam-api.service';
import { CreateDuelDto } from './dto/create-duel.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DuelRecord, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly steamApiService: SteamApiService,
    private readonly configService: ConfigService,
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
      const data = await this.usersRepository.createDuel({
        ...body,
        finished_at: new Date().toISOString(),
      });
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

  async requestRematch(duelId: string, requesterDiscordId: string) {
    const duel = await this.getCompletedDuel(duelId);
    const loserDiscordId = this.getLoserDiscordId(duel);

    if (requesterDiscordId !== loserDiscordId) {
      throw new BadRequestException(
        'Solo el jugador que perdió este duelo puede solicitar una revancha.',
      );
    }

    this.assertWithinRematchWindow(duel);

    const existingRequest = await this.usersRepository.findRematchByDuelId(
      duelId,
    );
    if (existingRequest?.status === 'pending') {
      throw new BadRequestException(
        'Ya existe una solicitud de revancha activa para este duelo.',
      );
    }

    try {
      const request = await this.usersRepository.createRematchRequest({
        duelId,
        requesterDiscordId,
      });
      return { success: true, data: { request, duel } };
    } catch (error: unknown) {
      if (this.isActiveRequestConstraintError(error)) {
        throw new BadRequestException(
          'Ya existe una solicitud de revancha activa para este duelo.',
        );
      }
      throw error;
    }
  }

  async acceptRematch(
    duelId: string,
    actorDiscordId: string,
    requestId?: string,
  ) {
    const { duel, request } = await this.getPendingRematch(duelId, requestId);
    if (actorDiscordId !== duel.winner_discord_id) {
      throw new BadRequestException(
        'Solo el ganador original puede aceptar esta solicitud de revancha.',
      );
    }

    const resolved = await this.usersRepository.resolveRematchRequest(
      request.id,
      'accepted',
    );
    if (!resolved) {
      throw new BadRequestException('La solicitud ya fue respondida.');
    }
    return { success: true, data: { duel, request: resolved } };
  }

  async rejectRematch(
    duelId: string,
    actorDiscordId: string,
    requestId?: string,
  ) {
    const { duel, request } = await this.getPendingRematch(duelId, requestId);
    if (actorDiscordId !== duel.winner_discord_id) {
      throw new BadRequestException(
        'Solo el ganador original puede rechazar esta solicitud de revancha.',
      );
    }

    const resolved = await this.usersRepository.resolveRematchRequest(
      request.id,
      'rejected',
    );
    if (!resolved) {
      throw new BadRequestException('La solicitud ya fue respondida.');
    }
    return { success: true, data: { duel, request: resolved } };
  }

  private async getCompletedDuel(duelId: string): Promise<DuelRecord> {
    const duel = await this.usersRepository.findDuelById(duelId);
    if (!duel) throw new NotFoundException('El duelo no existe.');
    if (!duel.winner_discord_id) {
      throw new BadRequestException('El duelo todavía no terminó.');
    }
    return duel;
  }

  private async getPendingRematch(duelId: string, requestId?: string) {
    const duel = await this.getCompletedDuel(duelId);
    const request = requestId
      ? await this.usersRepository.findRematchById(requestId)
      : await this.usersRepository.findRematchByDuelId(duelId);
    if (!request) throw new NotFoundException('La solicitud de revancha no existe.');
    if (request.original_duel_id !== duelId) {
      throw new BadRequestException('La solicitud no corresponde a este duelo.');
    }
    if (request.status === 'accepted') {
      throw new BadRequestException('La solicitud ya fue aceptada.');
    }
    if (request.status === 'rejected') {
      throw new BadRequestException('La solicitud ya fue rechazada.');
    }
    return { duel, request };
  }

  private getLoserDiscordId(duel: DuelRecord) {
    if (duel.winner_discord_id === duel.challenger_discord_id) {
      return duel.opponent_discord_id;
    }
    if (duel.winner_discord_id === duel.opponent_discord_id) {
      return duel.challenger_discord_id;
    }
    throw new BadRequestException('El resultado del duelo es incompatible.');
  }

  private assertWithinRematchWindow(duel: DuelRecord) {
    const finishedAt = duel.finished_at ?? duel.created_at;
    if (!finishedAt) {
      throw new BadRequestException('El duelo no tiene fecha de finalización.');
    }
    const windowMinutes = Number(
      this.configService.get<string>('REMATCH_WINDOW_MINUTES') ?? '60',
    );
    const validWindowMinutes =
      Number.isFinite(windowMinutes) && windowMinutes > 0 ? windowMinutes : 60;
    const expiresAt = new Date(finishedAt).getTime() + validWindowMinutes * 60_000;
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      throw new BadRequestException('La ventana para solicitar revancha expiró.');
    }
  }

  private isActiveRequestConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
