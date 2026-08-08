import { Test, TestingModule } from '@nestjs/testing';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';

describe('SteamController', () => {
  let controller: SteamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SteamController],
      providers: [{ provide: SteamService, useValue: {} }],
    }).compile();

    controller = module.get<SteamController>(SteamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
