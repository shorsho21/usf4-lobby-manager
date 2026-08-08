import { Test, TestingModule } from '@nestjs/testing';
import { SteamApiService } from '../steam/steam-api/steam-api.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            upsertUser: jest.fn(),
            findByDiscordId: jest.fn(),
            createDuel: jest.fn(),
          },
        },
        { provide: SteamApiService, useValue: { resolveProfileId: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
