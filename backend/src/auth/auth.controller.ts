import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Users } from 'src/users/schemas/users.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
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
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagenUrl = file ? `/uploads/perfiles/${file.filename}` : undefined;
    return this.authService.register(createUserDto, imagenUrl);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('autorizar')
  @UseGuards(JwtAuthGuard)
  autorizar(@GetUser() user: Users) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userSinPassword } = user.toObject<Users>();
    return userSinPassword;
  }

  @Post('refrescar')
  @UseGuards(AuthGuard('jwt-refresh'))
  refrescarToken(@GetUser() user: Users) {
    return this.authService.refreshToken(user);
  }
}
