import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { SteamApiService } from './steam-api/steam-api.service';
import { SteamService } from './steam.service';

describe('SteamService', () => {
  let service: SteamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SteamService,
        { provide: UsersService, useValue: { getUserByDiscordId: jest.fn() } },
        { provide: SteamApiService, useValue: { getLobbyLink: jest.fn() } },
      ],
    }).compile();

    service = module.get<SteamService>(SteamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
