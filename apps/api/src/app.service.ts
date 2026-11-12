import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { service: 'api'; status: 'ok' } {
    return {
      status: 'ok',
      service: 'api',
    };
  }
}
