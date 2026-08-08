import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateDuelDto } from './dto/create-duel.dto';

export interface UserRecord {
  discord_id: string;
  discord_user: string;
  steam_profile: string;
  steam_ID: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async upsertUser(user: UserRecord): Promise<void> {
    const { error } = await this.supabase.client.from('users').upsert([user]);
    if (error) throw error;
  }

  async findByDiscordId(discordId: string): Promise<UserRecord | null> {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .maybeSingle();

    if (error) throw error;
    return data as UserRecord | null;
  }

  async createDuel(duel: CreateDuelDto) {
    const { data, error } = await this.supabase.client
      .from('duel_history')
      .insert([duel])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
