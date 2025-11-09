import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from '../users/schemas/users.schema';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Users => {
    const request = ctx.switchToHttp().getRequest<{ user: Users }>();
    return request.user;
  },
);
