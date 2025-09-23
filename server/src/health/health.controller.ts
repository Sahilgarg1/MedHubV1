import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('ready')
  readiness() {
    return { 
      status: 'ready', 
      timestamp: new Date().toISOString() 
    };
  }

  @Get('live')
  liveness() {
    return { 
      status: 'alive', 
      timestamp: new Date().toISOString() 
    };
  }
}
