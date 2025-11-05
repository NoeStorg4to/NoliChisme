// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AdminGuard implements CanActivate {
//   constructor(private jwtService: JwtService) {}

//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const token = request.headers.authorization?.replace('Bearer', '');

//     if (!token) {
//       throw new ForbiddenException('No autorizado');
//     }

//     try {
//       const payload = this.jwtService.verify(token);

//       if (payload.perfil !== 'administrador') {
//         throw new ForbiddenException('Se requieren permisos de administrador');
//       }

//       return true;
//     } catch {
//       throw new ForbiddenException('Token inválido');
//     }
//   }
// }
