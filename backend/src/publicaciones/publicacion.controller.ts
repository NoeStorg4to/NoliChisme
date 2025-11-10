import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PublicacionesService } from './publicacion.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { QueryPublicacionDto } from './dto/query-publicacion.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { Users } from '../users/schemas/users.schema';
import { CreateComentarioDto } from './dto/create-coments.dto';

@UseGuards(JwtAuthGuard) // Protege todas las rutas de este controlador
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post(':id/comentarios')
  addComentario(
    @Param('id') id: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @GetUser() user: Users,
  ) {
    return this.publicacionesService.addComentario(
      id,
      user._id,
      createComentarioDto.contenido,
    );
  }
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/publicaciones',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `pub-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Solo se permiten imágenes'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  create(
    @Body() createDto: CreatePublicacionDto,
    @GetUser() user: Users,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagenUrl = file
      ? `/uploads/publicaciones/${file.filename}`
      : undefined;
    return this.publicacionesService.create(createDto, user._id, imagenUrl);
  }

  @Get()
  findAll(@Query() queryDto: QueryPublicacionDto) {
    return this.publicacionesService.findAll(queryDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string, @GetUser() user: Users) {
    return this.publicacionesService.softDelete(id, user);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @GetUser() user: Users) {
    return this.publicacionesService.like(id, user._id);
  }

  @Delete(':id/like')
  unlike(@Param('id') id: string, @GetUser() user: Users) {
    return this.publicacionesService.unlike(id, user._id);
  }
}
