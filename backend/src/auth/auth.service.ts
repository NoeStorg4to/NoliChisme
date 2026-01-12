/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/schemas/users.schema';
import { JwtPayload } from './jwt.playload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto, imagenPerfil?: string) {
    const user = await this.usersService.create(createUserDto, imagenPerfil);

    const playload = {
      sub: user._id,
      nombreUsuario: user.nombreUsuario,
      email: user.email,
      perfil: user.perfil,
    };
    const token = this.jwtService.sign(playload);
    const { password, ...userSinPassword } = user.toObject();
    return {
      usuario: userSinPassword,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    //USANDO EL METODO ESPECIFICO
    const user = await this.usersService.findByEmailOrUsername(
      loginDto.usuarioEmail,
    );

    if (!user) {
      console.log('Usuario no encontrado');
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('ACCOUNT_DISABLED');
    }

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const playload = {
      sub: user._id,
      nombreUsuario: user.nombreUsuario,
      email: user.email,
      perfil: user.perfil,
    };
    const token = this.jwtService.sign(playload);

    const { password, ...userSinPassword } = user.toObject();
    return {
      usuario: userSinPassword,
      access_token: token,
    };
  }

  refreshToken(user: Users) {
    // ------------- ASYNC??????
    const playload: JwtPayload = {
      sub: user._id,
      nombreUsuario: user.nombreUsuario,
      email: user.email,
      perfil: user.perfil as 'usuario' | 'administrador',
    };
    const token = this.jwtService.sign(playload);

    return {
      access_token: token,
    };
  }
}
