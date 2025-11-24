import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';
import { Users } from '../users/schemas/users.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { QueryPublicacionDto } from './dto/query-publicacion.dto';
import { PublicacionesResponse } from './dto/publicacion-response.dto';
import { Comentario } from './schemas/comentario.schema';
import {
  CommentsPerPostStat,
  PublicationsByUserStat,
  TotalCommentsStat,
} from './dto/stats-response.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  async create(
    createDto: CreatePublicacionDto,
    usuarioId: Types.ObjectId,
    imagenUrl?: string,
  ): Promise<Publicacion> {
    const nuevaPublicacion = new this.publicacionModel({
      ...createDto,
      usuarioId,
      imagenUrl,
    });
    await nuevaPublicacion.save();

    await nuevaPublicacion.populate('usuarioId', 'nombreUsuario imagenPerfil');
    return nuevaPublicacion;
  }

  async findAll(queryDto: QueryPublicacionDto): Promise<PublicacionesResponse> {
    const { sortBy, usuarioId, page = 1, limit = 10 } = queryDto;

    const filter: FilterQuery<Publicacion> = { isDeleted: false };
    if (usuarioId) {
      filter.usuarioId = new Types.ObjectId(usuarioId);
    }

    const sortOptions: Record<string, 1 | -1> =
      sortBy === 'meGusta' ? { likesCount: -1 } : { fechaCreacion: -1 };
    const skip = (page - 1) * limit;
    const data = await this.publicacionModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip) //salta a la 2da pag si es mas de 10 el offset
      .limit(limit)
      .populate('usuarioId', 'nombreUsuario imagenPerfil')
      // .populate('comentarios.usuarioId', 'nombreUsuario imagenPerfil')
      .exec();

    const total = await this.publicacionModel.countDocuments(filter);

    return {
      data,
      total,
      paginaActual: page,
      totalPaginas: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Publicacion> {
    const publicacion = await this.publicacionModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('usuarioId', 'nombreUsuario imagenPerfil');
    // .populate('comentarios.usuarioId', 'nombreUsuario imagenPerfil');
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  async softDelete(id: string, usuario: Users): Promise<Publicacion> {
    const publicacion = await this.findOne(id);
    const esPropietario =
      publicacion.usuarioId._id.toString() === usuario._id.toString();
    const esAdmin = usuario.perfil === 'administrador';

    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta publicación',
      );
    }

    publicacion.isDeleted = true;
    return publicacion.save();
  }

  // METODOS PARA LIKESSS
  async like(id: string, usuarioId: Types.ObjectId): Promise<Publicacion> {
    const publicacion = await this.publicacionModel
      .findByIdAndUpdate(
        id,
        {
          $addToSet: { likes: usuarioId }, // $addToSet evita duplicados
          // Se usa $inc para incrementar likesCount solo si $addToSet tuvo éxito
        },
        { new: true },
      )
      .populate('usuarioId', 'nombreUsuario imagenPerfil');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    publicacion.likesCount = publicacion.likes.length;
    return publicacion.save();
  }

  async unlike(id: string, usuarioId: Types.ObjectId): Promise<Publicacion> {
    const publicacion = await this.publicacionModel
      .findByIdAndUpdate(
        id,
        {
          $pull: { likes: usuarioId }, // $pull saca el id del array
        },
        { new: true },
      )
      .populate('usuarioId', 'nombreUsuario imagenPerfil');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    publicacion.likesCount = publicacion.likes.length;
    return publicacion.save();
  }

  // METODOS PARA ESTADISTICA DEL DASHBOARD
  async countPublicationsByUser(
    startDate: Date,
    endDate: Date,
    userId?: string,
  ): Promise<PublicationsByUserStat[]> {
    const matchStage: FilterQuery<Publicacion> = {
      fechaCreacion: { $gte: startDate, $lte: endDate },
      isDeleted: false,
    };
    if (userId) {
      matchStage.usuarioId = new Types.ObjectId(userId);
    }
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: '$usuarioId',
          username: { $first: '$user.nombreUsuario' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'usuarioId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $sort: { count: -1 } },
    ];

    return this.publicacionModel
      .aggregate<PublicationsByUserStat>(pipeline)
      .exec();
  }

  async countTotalComments(
    startDate: Date,
    endDate: Date,
  ): Promise<TotalCommentsStat> {
    const data = await this.comentarioModel
      .aggregate<{ totalComments: number }>([
        {
          $match: {
            fechaCreacion: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $count: 'totalComments',
        },
      ])
      .exec();

    return {
      totalComments: data.length > 0 ? data[0].totalComments : 0,
      startDate,
      endDate,
    };
  }

  async countCommentsPerPost(
    startDate: Date,
    endDate: Date,
  ): Promise<CommentsPerPostStat[]> {
    const data = await this.publicacionModel
      .aggregate<CommentsPerPostStat>([
        {
          $match: {
            fechaCreacion: { $gte: startDate, $lte: endDate },
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 1,
            descripcion: 1,
            comentariosCount: '$comentariosCount',
          },
        },
        { $sort: { comentariosCount: -1 } },
        { $limit: 10 },
      ])
      .exec();

    return data;
  }
}
