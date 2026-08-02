import { Test, TestingModule } from '@nestjs/testing';
import { SteamSessionService } from './steam-session.service';

describe('SteamSessionService', () => {
  let service: SteamSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteamSessionService],
    }).compile();

    service = module.get<SteamSessionService>(SteamSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
