import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): { service: 'api'; status: 'ok' } {
    const ciTypecheck: number = 'not a number';
    void ciTypecheck;
    return this.appService.getHealth();
  }
}
