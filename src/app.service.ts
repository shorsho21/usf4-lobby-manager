import { Injectable } from '@nestjs/common';
import { supabase } from './supabase';

@Injectable()
export class AppService {
  getHello(): string {
    
    
    return 'Hello World!';
  }
}
