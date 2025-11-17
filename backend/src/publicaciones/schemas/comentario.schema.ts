import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
// import { Users } from '../../users/schemas/users.schema';

@Schema({
  _id: true,
  timestamps: { createdAt: 'fechaCreacion', updatedAt: false },
})
export class Comentario {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  usuarioId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  contenido: string;

  // 'fechaCreacion' se añade automáticamente por timestamps
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
