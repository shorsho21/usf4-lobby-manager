/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { AiService } from './ai.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string): string | null => {
              if (key === 'LM_STUDIO_URL') return 'http://127.0.0.1:1234';
              if (key === 'LM_STUDIO_MODEL') return 'qwen3-1.7b';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return assistant reply content on success', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              role: 'assistant',
              content: '¡Hola! Soy Chun Burger 🍔',
            },
          },
        ],
      },
    });

    const result = await service.chat('Hola Chun');

    expect(result).toEqual({
      success: true,
      content: '¡Hola! Soy Chun Burger 🍔',
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:1234/v1/chat/completions',
      expect.objectContaining({
        model: 'qwen3-1.7b',
      }),
      expect.any(Object),
    );
  });

  it('should handle missing choices/content gracefully', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [],
      },
    });

    const result = await service.chat('Hola Chun');

    expect(result).toEqual({
      success: false,
      message: 'No se pudo obtener una respuesta válida del modelo.',
    });
  });

  it('should handle network/HTTP errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await service.chat('Hola Chun');

    expect(result).toEqual({
      success: false,
      message: 'Error al comunicarse con el servicio de IA.',
    });
  });
});
