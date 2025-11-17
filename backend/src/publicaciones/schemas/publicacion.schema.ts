import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comentario, ComentarioSchema } from './comentario.schema';

@Schema({
  timestamps: { createdAt: 'fechaCreacion', updatedAt: true },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Publicacion extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true, index: true })
  usuarioId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  descripcion: string;

  @Prop()
  imagenUrl?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Comentario[];

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  // 'fechaCreacion' se añade automáticamente por timestamps
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
