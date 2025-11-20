export interface User {
    _id?: string;
    nombre: string;
    apellido: string;
    email: string;
    nombreUsuario: string;
    password: string;
    fechaNacimiento: Date;
    descripcion?: string;
    imagenPerfil?: string;
    perfil: 'usuario' | 'administrador';
    isActive?: boolean;
}

export interface LoginRequest {
    usuarioEmail: string;
    password: string;
}