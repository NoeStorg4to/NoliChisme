import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comentario } from '../schemas/comentario.schema';
import { Publicacion } from '../schemas/publicacion.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
  ) {}

  async getComentarios(
    publicacionId: string,
    page: number = 1,
    limit: number = 3,
  ) {
    const skip = (page - 1) * limit;
    const filter = { publicacionId: new Types.ObjectId(publicacionId) };

    const data = await this.comentarioModel
      .find(filter)
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limit)
      .populate('usuarioId', 'nombreUsuario imagenPerfil')
      .exec();

    const total = await this.comentarioModel.countDocuments(filter);

    return {
      data,
      total,
      paginaActual: page,
      totalPaginas: Math.ceil(total / limit),
    };
  }

  async addComentario(
    publicacionId: string,
    usuarioId: Types.ObjectId,
    contenido: string,
  ): Promise<Comentario> {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion || publicacion.isDeleted) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const nuevoComentario = new this.comentarioModel({
      contenido,
      usuarioId,
      publicacionId: new Types.ObjectId(publicacionId),
    });

    await nuevoComentario.save();
    publicacion.comentariosCount = (publicacion.comentariosCount || 0) + 1;
    await publicacion.save();

    return nuevoComentario.populate('usuarioId', 'nombreUsuario imagenPerfil');
  }

  async updateComentario(
    comentarioId: string,
    usuarioId: Types.ObjectId,
    contenido: string,
  ): Promise<Comentario> {
    const comentario = await this.comentarioModel.findById(comentarioId);

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.usuarioId.toString() !== usuarioId.toString()) {
      throw new ForbiddenException(
        'No tienes permiso para editar este comentario',
      );
    }

    comentario.contenido = contenido;
    comentario.modificado = true;
    return comentario.save();
  }
}
