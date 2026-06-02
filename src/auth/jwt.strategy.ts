import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUserPayload } from './current-user.decorator';

type JwtPayload = { sub: number; username: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'admatch-dev-secret-change-me'),
    });
  }

  validate(payload: JwtPayload): AuthUserPayload {
    if (payload.sub == null || !payload.username) {
      throw new UnauthorizedException();
    }
    return { userId: String(payload.sub), username: payload.username };
  }
}
