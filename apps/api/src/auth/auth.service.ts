import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, verifyPassword } from './password-hasher';

const REFRESH_SESSION_DAYS = 30;

function digestRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: { email: string; name: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await hashPassword(input.password);
    const refreshToken = randomBytes(32).toString('base64url');

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name: input.name.trim(),
          passwordHash,
          sessions: {
            create: {
              tokenHash: digestRefreshToken(refreshToken),
              expiresAt: this.refreshExpiry(),
            },
          },
        },
      });
      return this.buildSessionResponse(user, refreshToken);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }
      throw error;
    }
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
    });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    return this.createSessionResponse(user);
  }

  async refresh(refreshToken: string) {
    const oldHash = digestRefreshToken(refreshToken);
    const nextRefreshToken = randomBytes(32).toString('base64url');
    const nextHash = digestRefreshToken(nextRefreshToken);
    const expiresAt = this.refreshExpiry();

    const user = await this.prisma.$transaction(async (transaction) => {
      const session = await transaction.refreshSession.findUnique({
        where: { tokenHash: oldHash },
        include: { user: true },
      });
      if (!session || session.revokedAt || session.expiresAt <= new Date()) {
        throw new UnauthorizedException('Refresh token is invalid or expired.');
      }

      const rotated = await transaction.refreshSession.updateMany({
        where: {
          id: session.id,
          tokenHash: oldHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { tokenHash: nextHash, expiresAt },
      });
      if (rotated.count !== 1) {
        throw new UnauthorizedException('Refresh token is invalid or expired.');
      }
      return session.user;
    });

    return {
      accessToken: await this.createAccessToken(user.id),
      refreshToken: nextRefreshToken,
      user: publicUser(user),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        tokenHash: digestRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async startSessionForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Account is no longer available.');
    }
    return this.createSessionResponse(user);
  }

  async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Account is no longer available.');
    }
    return publicUser(user);
  }

  private async createSessionResponse(user: User) {
    const refreshToken = randomBytes(32).toString('base64url');
    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: digestRefreshToken(refreshToken),
        expiresAt: this.refreshExpiry(),
      },
    });

    return this.buildSessionResponse(user, refreshToken);
  }

  private async buildSessionResponse(user: User, refreshToken: string) {
    return {
      accessToken: await this.createAccessToken(user.id),
      refreshToken,
      user: publicUser(user),
    };
  }

  private createAccessToken(userId: string) {
    return this.jwt.signAsync({ sub: userId });
  }

  private refreshExpiry() {
    return new Date(Date.now() + REFRESH_SESSION_DAYS * 24 * 60 * 60 * 1000);
  }
}
