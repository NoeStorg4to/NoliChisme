/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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
    };
    const token = this.jwtService.sign(playload);
    const { password, ...userSinPassword } = user.toObject();
    return {
      user: userSinPassword,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    // const user = await this.usersService.findOne({
    //   $or: [
    //     { email: loginDto.usuarioEmail },
    //     { nombreUsuario: loginDto.usuarioEmail },
    //   ],
    // });
    //USANDO EL METODO ESPECIFICO
    const user = await this.usersService.findByEmailOrUsername(
      loginDto.usuarioEmail,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
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
    };
    const token = this.jwtService.sign(playload);

    const { password, ...userSinPassword } = user.toObject();
    return {
      user: userSinPassword,
      access_token: token,
    };
  }
}
