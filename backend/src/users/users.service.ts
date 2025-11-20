import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Users } from './schemas/users.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

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

    const birthDate = new Date(createUserDto.fechaNacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      throw new BadRequestException('Debes tener al menos 13 años');
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    imagenPerfil?: string,
  ): Promise<Users | null> {
    const updateData: Partial<Users> = {};

    if (updateUserDto.nombreUsuario) {
      const userExist = await this.usuarioModel.findOne({
        nombreUsuario: updateUserDto.nombreUsuario,
        _id: { $ne: id },
      });
      if (userExist) {
        throw new ConflictException('El nombre de usuario ya se uso');
      }
      updateData.nombreUsuario = updateUserDto.nombreUsuario;
    }

    if (updateUserDto.descripcion !== undefined) {
      updateData.descripcion = updateUserDto.descripcion;
    }
    if (imagenPerfil) {
      updateData.imagenPerfil = imagenPerfil;
    }
    if (updateUserDto.nombreUsuario) {
      const userExist = await this.usuarioModel.findOne({
        nombreUsuario: updateUserDto.nombreUsuario,
        _id: { $ne: id },
      });
      if (userExist) {
        throw new ConflictException('El nombre de usuario ya esta en uso');
      }
    }

    delete updateData.email;
    delete updateData.password;

    const updatedUser = await this.usuarioModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select('-password')
      .exec();

    return updatedUser;
  }

  // METODO PARA LISTAR TODOS PARA LE ADMIN
  async findAllUsers(): Promise<Users[]> {
    return this.usuarioModel.find().select('-password').exec();
  }

  // METODO PARA ACTIVAR O DESACTIVAR DEL ADMIN
  async setStatus(id: string, status: boolean): Promise<Users> {
    const user = await this.usuarioModel
      .findByIdAndUpdate(id, { isActive: status }, { new: true })
      .select('-password');

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
