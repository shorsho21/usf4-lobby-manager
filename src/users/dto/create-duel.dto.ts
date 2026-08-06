import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateDuelDto {
  @IsString()
  @IsNotEmpty()
  challenger_discord_id: string;

  @IsString()
  @IsNotEmpty()
  opponent_discord_id: string;

  @IsString()
  @IsNotEmpty()
  winner_discord_id: string;

  @IsInt()
  @Min(1)
  ft: number;

  @IsString()
  @IsNotEmpty()
  game: string;
}