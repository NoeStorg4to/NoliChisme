import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

// CREO UNA APP NESTJS SIN SERVIDOR WEB
async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule); //EL METODO ES PARA NO ESCUCHAR PUERTOS, NO NECESITO EL SERVIDOR WEB
  const usersService = app.get(UsersService);
  const configService = app.get(ConfigService);

  const adminData = {
    nombre: 'Admin',
    apellido: 'Principal',
    email: configService.get<string>('ADMIN_EMAIL')!,
    nombreUsuario: configService.get<string>('ADMIN_USERNAME')!,
    password: configService.get<string>('ADMIN_PASSWORD')!,
    fechaNacimiento: '1990-01-01',
    descripcion: 'Administrador del sistema',
    perfil: 'administrador' as const,
  };

  try {
    const existingAdmin = await usersService.findByEmailOrUsername(
      adminData.email,
    );

    if (existingAdmin) {
      console.log('El usuario admin ya existe');
      await app.close();
      return;
    }

    const admin = await usersService.create(adminData);
    console.log('Usuario administrador creado exitosamente');
    console.log(' Email:', admin.email);
    console.log('Usuario:', admin.nombreUsuario);
  } catch (error) {
    console.error('Error creando admin:', error);
  }

  await app.close();
}

void createAdminUser();
