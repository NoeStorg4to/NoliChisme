import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Users extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion?: string;

  @Prop({ default: '' })
  imagenPerfil?: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Users);
