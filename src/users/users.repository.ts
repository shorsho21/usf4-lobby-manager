import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateDuelDto } from './dto/create-duel.dto';

export interface UserRecord {
  discord_id: string;
  discord_user: string;
  steam_profile: string;
  steam_ID: string;
}

export interface DuelRecord extends CreateDuelDto {
  id: string | number;
  created_at?: string;
  finished_at?: string;
}

export type RematchStatus = 'pending' | 'accepted' | 'rejected';

export interface RematchRequestRecord {
  id: string;
  original_duel_id: string;
  requester_discord_id: string;
  status: RematchStatus;
  created_at: string;
  resolved_at?: string;
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

  async findDuelById(duelId: string): Promise<DuelRecord | null> {
    const { data, error } = await this.supabase.client
      .from('duel_history')
      .select('*')
      .eq('id', duelId)
      .maybeSingle();

    if (error) throw error;
    return data as DuelRecord | null;
  }

  async findRematchByDuelId(
    duelId: string,
  ): Promise<RematchRequestRecord | null> {
    const { data, error } = await this.supabase.client
      .from('rematch_requests')
      .select('*')
      .eq('original_duel_id', duelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as RematchRequestRecord | null;
  }

  async findRematchById(
    requestId: string,
  ): Promise<RematchRequestRecord | null> {
    const { data, error } = await this.supabase.client
      .from('rematch_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (error) throw error;
    return data as RematchRequestRecord | null;
  }

  async createRematchRequest({
    duelId,
    requesterDiscordId,
  }: {
    duelId: string;
    requesterDiscordId: string;
  }): Promise<RematchRequestRecord> {
    const { data, error } = await this.supabase.client
      .from('rematch_requests')
      .insert([
        {
          original_duel_id: duelId,
          requester_discord_id: requesterDiscordId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as RematchRequestRecord;
  }

  async resolveRematchRequest(
    requestId: string,
    status: Extract<RematchStatus, 'accepted' | 'rejected'>,
  ): Promise<RematchRequestRecord | null> {
    const { data, error } = await this.supabase.client
      .from('rematch_requests')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as RematchRequestRecord | null;
  }
}
