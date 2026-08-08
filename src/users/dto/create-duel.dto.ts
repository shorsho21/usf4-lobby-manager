export class CreateDuelDto {
  challenger_discord_id!: string;
  opponent_discord_id!: string;
  winner_discord_id!: string;
  ft!: number;
  game!: string;
}
