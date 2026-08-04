import { Injectable } from '@nestjs/common';
import { supabase } from './supabase';

@Injectable()
export class AppService {
  async test() {

    const { data, error } =
        await supabase
            .from('users')
            .select('*');

    console.log(data);

}
  getHello(): string {
    this.test();
    
    return 'Hello World!';
  }
}
