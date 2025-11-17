import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
// import { Users } from '../../users/schemas/users.schema';

@Schema({
  collection: 'comentarios',
  timestamps: { createdAt: 'fechaCreacion', updatedAt: true },
})
export class Comentario extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  usuarioId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Publicacion',
    required: true,
    index: true,
  })
  publicacionId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  contenido: string;

  @Prop({ type: Boolean, default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
