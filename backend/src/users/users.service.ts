import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Users } from './schemas/users.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usuarioModel: Model<Users>) {}

  async create(
    createUserDto: CreateUserDto,
    imagenPerfil?: string,
  ): Promise<Users> {
    const emailExist = await this.usuarioModel.findOne({
      email: createUserDto.email,
    });
    if (emailExist) {
      throw new ConflictException('El mail ya esta registrado');
    }

    const userExist = await this.usuarioModel.findOne({
      nombreUsuario: createUserDto.nombreUsuario,
    });
    if (userExist) {
      throw new ConflictException('El nombre de usuario ya se uso');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncripted = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new this.usuarioModel({
      ...createUserDto,
      password: passwordEncripted,
      imagenPerfil: imagenPerfil,
    });

    return newUser.save();
  }

  async findOne(query: FilterQuery<Users>): Promise<Users | null> {
    return this.usuarioModel.findOne(query).exec();
  }

  async searchByEmailUser(userEmail: string): Promise<Users | null> {
    return this.usuarioModel
      .findOne({
        $or: [{ email: userEmail }, { nombreUsuario: userEmail }],
      })
      .exec();
  }

  async searchById(id: string): Promise<Users | null> {
    return this.usuarioModel
      .findById(id)
      .select('-password')
      .exec() as Promise<Users | null>;
  }

  async findByEmailOrUsername(identifier: string): Promise<Users | null> {
    return this.usuarioModel
      .findOne({
        $or: [{ email: identifier }, { nombreUsuario: identifier }],
      })
      .exec();
  }
}
