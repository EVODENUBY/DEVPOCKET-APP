import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getEnvironment } from '../config/environment';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { OAuthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getEnvironment().JWT_ACCESS_SECRET,
        signOptions: { algorithm: 'HS256', expiresIn: '15m' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, AuthGuard, OAuthService],
})
export class AuthModule {}
