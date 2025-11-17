import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PublicacionesController } from './publicacion.controller';
import { PublicacionesService } from './publicacion.service';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { ComentarioService } from './comentario/comentario.service';
import { ComentariosController } from './comentario/comentario.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService, ComentarioService],
})
export class PublicacionesModule {}
