import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from '../dto/create-coments.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { Users } from 'src/users/schemas/users.schema';

// (Crea un UpdateComentarioDto similar al CreateComentarioDto)
// import { UpdateComentarioDto } from './dto/update-coments.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ComentariosController {
  constructor(private readonly comentariosService: ComentarioService) {}

  @Get('publicaciones/:publicacionId/comentarios')
  getComentarios(
    @Param('publicacionId') publicacionId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ) {
    return this.comentariosService.getComentarios(publicacionId, page, limit);
  }

  // REQ: POST para agregar
  @Post('publicaciones/:publicacionId/comentarios')
  addComentario(
    @Param('publicacionId') publicacionId: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @GetUser() user: Users,
  ) {
    return this.comentariosService.addComentario(
      publicacionId,
      user._id,
      createComentarioDto.contenido,
    );
  }

  @Put('comentarios/:id')
  updateComentario(
    @Param('id') comentarioId: string,
    @Body() updateComentarioDto: CreateComentarioDto,
    @GetUser() user: Users,
  ) {
    return this.comentariosService.updateComentario(
      comentarioId,
      user._id,
      updateComentarioDto.contenido,
    );
  }
}
