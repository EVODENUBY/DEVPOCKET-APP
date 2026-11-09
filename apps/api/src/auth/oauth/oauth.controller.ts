import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OAuthExchangeDto } from '../dto/oauth-exchange.dto';
import { OAuthService } from './oauth.service';

@ApiTags('auth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauth: OAuthService) {}

  @Get(':provider/start')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Begin provider OAuth authorization' })
  @ApiResponse({ status: 302, description: 'Redirects to the provider.' })
  async start(
    @Param('provider') provider: string,
    @Query('redirect') redirect: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const url = await this.oauth.start(provider, redirect);
    response.redirect(url);
  }

  @Get(':provider/callback')
  @ApiOperation({ summary: 'Complete provider OAuth authorization' })
  @ApiResponse({
    status: 200,
    description:
      'Returns a mobile callback page that redirects back to the application.',
  })
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const url = await this.oauth.handleCallback(provider, {
      code,
      state,
      error,
    });
    const escapedUrl = url
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const scriptUrl = JSON.stringify(url).replace(/</g, '\\u003c');

    response
      .status(HttpStatus.OK)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${escapedUrl}" />
    <title>Returning to DevPocket</title>
  </head>
  <body>
    <p>Returning to DevPocket...</p>
    <p><a href="${escapedUrl}">Open DevPocket</a></p>
    <script>window.location.replace(${scriptUrl});</script>
  </body>
</html>`);
  }

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Exchange a one-time OAuth code for a session',
  })
  @ApiResponse({ status: 200, description: 'Session issued.' })
  @ApiResponse({ status: 401, description: 'Code is invalid or expired.' })
  exchange(@Body() body: OAuthExchangeDto) {
    return this.oauth.exchange(body.code);
  }
}
