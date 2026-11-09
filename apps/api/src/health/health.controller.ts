import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API process health' })
  @ApiResponse({ status: 200, description: 'The API process is responding.' })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check required service dependencies' })
  @ApiResponse({ status: 503, description: 'The database is unavailable.' })
  getReadiness() {
    return this.healthService.getReadiness();
  }
}
