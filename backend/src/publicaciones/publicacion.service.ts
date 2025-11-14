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

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
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

  async findAll(
    queryDto: QueryPublicacionDto,
  ): Promise<{ data: Publicacion[]; total: number }> {
    const { sortBy, usuarioId, offset, limit } = queryDto;

    const filter: FilterQuery<Publicacion> = { isDeleted: false };
    if (usuarioId) {
      filter.usuarioId = new Types.ObjectId(usuarioId);
    }

    // const sortOptions = {};
    // if (sortBy === 'meGusta') {
    //   sortOptions['likesCount'] = -1;
    // } else {
    //   sortOptions['fechaCreacion'] = -1;
    // }

    const sortOptions: Record<string, 1 | -1> =
      sortBy === 'meGusta' ? { likesCount: -1 } : { fechaCreacion: -1 };

    const data = await this.publicacionModel
      .find(filter)
      .sort(sortOptions)
      .skip(offset) //salta a la 2da pag si es mas de 10 el offset
      .limit(limit)
      .populate('usuarioId', 'nombreUsuario imagenPerfil')
      .populate('comentarios.usuarioId', 'nombreUsuario imagenPerfil')
      .exec();

    const total = await this.publicacionModel.countDocuments(filter);

    return { data, total };
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
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { likes: usuarioId }, // $addToSet evita duplicados
        // Se usa $inc para incrementar likesCount solo si $addToSet tuvo éxito
      },
      { new: true },
    );

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    publicacion.likesCount = publicacion.likes.length;
    return publicacion.save();
  }

  async unlike(id: string, usuarioId: Types.ObjectId): Promise<Publicacion> {
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      id,
      {
        $pull: { likes: usuarioId }, // $pull saca el id del array
      },
      { new: true },
    );

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    publicacion.likesCount = publicacion.likes.length;
    return publicacion.save();
  }

  // METODOS PARA COMENTARIO
  async addComentario(
    publicacionId: string,
    usuarioId: Types.ObjectId,
    contenido: string,
  ): Promise<Publicacion> {
    const publicacion = await this.findOne(publicacionId);
    const nuevoComentario = {
      _id: new Types.ObjectId(),
      usuarioId: usuarioId,
      contenido: contenido,
    };

    publicacion.comentarios.push(nuevoComentario);
    await publicacion.save();
    await publicacion.populate([
      { path: 'usuarioId', select: 'nombreUsuario imagenPerfil' },
      { path: 'comentarios.usuarioId', select: 'nombreUsuario imagenPerfil' },
    ]);

    return publicacion;
  }
}
