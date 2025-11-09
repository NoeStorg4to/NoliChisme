import { Types } from 'mongoose';

export interface JwtPayload {
  sub: Types.ObjectId;
  nombreUsuario: string;
  email: string;
  perfil: 'usuario' | 'administrador';
}
