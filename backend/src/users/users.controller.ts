import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDto, UsersService } from './users.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GetUser } from 'src/auth/get-user.decorator';
import { Users } from './schemas/users.schema';
import { extname } from 'path';
import { AdminGuard } from 'src/guards/admin.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put(':id')
  @UseGuards(JwtAuthGuard) // Proteger la ruta
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `perfil-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Solo se permiten imagenes'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: Users,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (user._id.toString() !== id) {
      throw new ForbiddenException(
        'No tienes permiso para editar este perfil.',
      );
    }

    const imagenUrl = file ? `/uploads/perfiles/${file.filename}` : undefined;

    return this.usersService.update(id, updateUserDto, imagenUrl);
  }

  // ENDPOINTS ADMIN
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, undefined);
  }

  @Delete(':id/disable')
  @UseGuards(JwtAuthGuard, AdminGuard)
  disableUser(@Param('id') id: string) {
    return this.usersService.setStatus(id, false);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  enableUser(@Param('id') id: string) {
    return this.usersService.setStatus(id, true);
  }
}
