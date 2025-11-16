import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';
import { Users } from '../users/schemas/users.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { QueryPublicacionDto } from './dto/query-publicacion.dto';
import { QueryComentariosDto } from './dto/query-comentario.dto';
import { Comentario } from './schemas/comentario.schema';

// type PublicacionConCount = Omit<Publicacion, 'comentarios'> & {
//   comentariosCount: number;
//   comentarios: [];
// };

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Users.name) private userModel: Model<Users>,
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
      comentariosCount: 0,
    });
    await nuevaPublicacion.save();

    await nuevaPublicacion.populate('usuarioId', 'nombreUsuario imagenPerfil');
    // const pubObject = nuevaPublicacion.toObject();
    return nuevaPublicacion;
  }

  async findAll(queryDto: QueryPublicacionDto): Promise<{
    data: Publicacion[];
    total: number;
    paginaActual: number;
    totalPaginas: number;
  }> {
    const { sortBy, usuarioId, page, limit } = queryDto;

    const filter: FilterQuery<Publicacion> = { isDeleted: false };
    if (usuarioId) {
      filter.usuarioId = new Types.ObjectId(usuarioId);
    }

    const sortOptions: Record<string, 1 | -1> =
      sortBy === 'meGusta' ? { likesCount: -1 } : { fechaCreacion: -1 };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.publicacionModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('usuarioId', 'nombreUsuario imagenPerfil')
        // .populate('comentarios.usuarioId', 'nombreUsuario imagenPerfil')
        .select('-comentarios')
        .exec(),
      this.publicacionModel.countDocuments(filter),
    ]);

    const totalPaginas = Math.ceil(total / limit);

    return { data, total, paginaActual: page, totalPaginas };
  }

  async findOne(id: string): Promise<Publicacion> {
    const publicacion = await this.publicacionModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('usuarioId', 'nombreUsuario imagenPerfil')
      .populate('comentarios.usuarioId', 'nombreUsuario imagenPerfil');
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
      .findOneAndUpdate(
        { _id: id, likes: { $ne: usuarioId } },
        {
          $addToSet: { likes: usuarioId }, // $addToSet evita duplicados
          // Se usa $inc para incrementar likesCount solo si $addToSet tuvo éxito
          $inc: { likesCount: 1 },
        },
        { new: true },
      )
      .populate('usuarioId', 'nombreUsuario imagenPerfil')
      .select('-comentarios');

    if (!publicacion) {
      return this.findOne(id);
      // throw new NotFoundException('Publicación no encontrada');
    }
    // return publicacion.save();
    return publicacion;
  }

  async unlike(id: string, usuarioId: Types.ObjectId): Promise<Publicacion> {
    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, likes: { $in: [usuarioId] } },
        {
          $pull: { likes: usuarioId }, // $pull saca el id del array
          $inc: { likesCount: -1 },
        },
        { new: true },
      )
      .populate('usuarioId', 'nombreUsuario imagenPerfil')
      .select('-comentarios');

    if (!publicacion) {
      return this.findOne(id);
      // throw new NotFoundException('Publicación no encontrada');
    }
    // return publicacion.save();
    return publicacion;
  }

  // METODOS PARA COMENTARIO
  async addComentario(
    publicacionId: string,
    usuarioId: Types.ObjectId,
    contenido: string,
  ): Promise<any> {
    // const publicacion = await this.findOne(publicacionId);
    const nuevoComentario = {
      _id: new Types.ObjectId(),
      usuarioId: usuarioId,
      contenido: contenido,
      fechaCreacion: new Date(),
    };

    // publicacion.comentarios.push(nuevoComentario);
    // await publicacion.save();
    // await publicacion.populate([
    //   { path: 'usuarioId', select: 'nombreUsuario imagenPerfil' },
    //   { path: 'comentarios.usuarioId', select: 'nombreUsuario imagenPerfil' },
    // ]);

    // return publicacion;
    const publicacionActualizada =
      await this.publicacionModel.findByIdAndUpdate(publicacionId, {
        $push: {
          comentarios: {
            $each: [nuevoComentario],
            $position: 0,
          },
        },
        $inc: { comentariosCount: 1 },
      });
    if (!publicacionActualizada) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comentarioConUsuario = await this.userModel
      .findById(usuarioId, 'nombreUsuario imagenPerfil')
      .lean();

    return {
      _id: nuevoComentario._id.toHexString(),
      usuarioId: comentarioConUsuario,
      contenido: nuevoComentario.contenido,
      fechaCreacion: nuevoComentario.fechaCreacion,
    };
  }

  async findComentarios(
    publicacionId: string,
    queryDto: QueryComentariosDto,
  ): Promise<{ data: Comentario[]; total: number }> {
    const { offset, limit } = queryDto;

    const publicacion = await this.publicacionModel
      .findById(publicacionId)
      .select('comentarios')
      .slice('comentarios', [offset, limit]) //le pido a mongo que de la lista me traiga los que estan en la posicion offset y offset+limit
      .populate('comentarios.usuarioId', 'nombreUsuario imagenPerfil')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // const totalComentarios = await this.publicacionModel
    //   .findById(publicacionId)
    //   .select('comentarios')
    //   .exec()
    //   .then((p) => p?.comentarios.length || 0);
    const totalPub = await this.publicacionModel
      .findById(publicacionId)
      .select('comentarios')
      .exec();
    const totalComentarios = totalPub ? totalPub.comentarios.length : 0;
    const dataOrdenada = publicacion.comentarios.sort(
      (a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime(),
    );

    return {
      data: dataOrdenada,
      total: totalComentarios,
    };
  }
}
