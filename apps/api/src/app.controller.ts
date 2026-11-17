import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): { service: 'api'; status: 'ok' } {
    const ciLintCheck = 1;
    return this.appService.getHealth();
  }
}
