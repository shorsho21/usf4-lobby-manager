import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  let chatMock: jest.Mock;

  beforeEach(async () => {
    chatMock = jest.fn().mockResolvedValue({
      success: true,
      content: 'Hola luchador',
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            chat: chatMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call aiService.chat with provided message', async () => {
    const result = await controller.chat({ message: 'Hola' });
    expect(chatMock).toHaveBeenCalledWith('Hola');
    expect(result).toEqual({ success: true, content: 'Hola luchador' });
  });
});
