import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUserPayload = { userId: string; username: string };

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return req.user;
  },
);
