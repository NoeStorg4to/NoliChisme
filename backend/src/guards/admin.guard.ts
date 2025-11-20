import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Users } from '../users/schemas/users.schema';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: Users;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.perfil !== 'administrador') {
      throw new ForbiddenException('Se requieren permisos de administrador');
    }

    return true;
  }
}
