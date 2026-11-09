import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { ProvidersService } from './providers.service';

const DEFAULT_REPOSITORY_LIMIT = 10;
const MAX_REPOSITORY_LIMIT = 30;

function parseLimit(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_REPOSITORY_LIMIT;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_REPOSITORY_LIMIT;
  }
  return Math.min(Math.trunc(parsed), MAX_REPOSITORY_LIMIT);
}

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get('connections')
  @ApiOperation({ summary: 'List provider connection state for the user' })
  @ApiResponse({ status: 200, description: 'Connection state returned.' })
  listConnections(@Req() request: AuthenticatedRequest) {
    return this.providers.listConnections(request.user.id);
  }

  @Get('github/repositories')
  @ApiOperation({
    summary: 'List repositories from the connected GitHub account',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: `Maximum repositories to return (1-${MAX_REPOSITORY_LIMIT}).`,
  })
  @ApiResponse({ status: 200, description: 'Repositories returned.' })
  @ApiResponse({ status: 404, description: 'GitHub is not connected.' })
  @ApiResponse({ status: 409, description: 'GitHub token is unavailable.' })
  @ApiResponse({ status: 502, description: 'GitHub request failed.' })
  listGithubRepositories(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit: string | undefined,
  ) {
    return this.providers.listGithubRepositories(
      request.user.id,
      parseLimit(limit),
    );
  }
}
