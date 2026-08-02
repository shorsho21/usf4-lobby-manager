import { Test, TestingModule } from '@nestjs/testing';
import { SteamScraperService } from './steam-scraper.service';

describe('SteamScraperService', () => {
  let service: SteamScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteamScraperService],
    }).compile();

    service = module.get<SteamScraperService>(SteamScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
