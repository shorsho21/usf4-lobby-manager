import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly defaultSystemPrompt =
    'Eres Chun Burger, un pequeño asistente de Discord amigable, cálido y divertido. Tu propósito principal es conversar con los usuarios y responder de manera natural. Tus respuestas deben ser relativamente cortas porque estás conversando en Discord.';

  constructor(private readonly configService: ConfigService) {}

  async chat(
    message: string,
  ): Promise<{ success: boolean; content?: string; message?: string }> {
    const rawBaseUrl =
      this.configService.get<string>('LM_STUDIO_URL') ||
      'http://127.0.0.1:1234';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const model =
      this.configService.get<string>('LM_STUDIO_MODEL') || 'qwen3-1.7b';

    try {
      const response = await axios.post<ChatCompletionResponse>(
        `${baseUrl}/v1/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: this.defaultSystemPrompt,
            },
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: 0.8,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        console.error(
          'LM Studio devolvió una respuesta sin contenido válido:',
          response.data,
        );
        return {
          success: false,
          message: 'No se pudo obtener una respuesta válida del modelo.',
        };
      }

      return {
        success: true,
        content: content.trim(),
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error comunicándose con LM Studio:',
          error.response?.data || error.message,
        );
      } else if (error instanceof Error) {
        console.error('Error comunicándose con LM Studio:', error.message);
      } else {
        console.error('Error desconocido con LM Studio:', error);
      }
      return {
        success: false,
        message: 'Error al comunicarse con el servicio de IA.',
      };
    }
  }
}
