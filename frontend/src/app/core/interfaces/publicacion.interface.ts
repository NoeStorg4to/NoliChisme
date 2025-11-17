import { User } from "./user.interface";

export interface Publicacion {
    _id?: string;
    usuarioId: User;
    // titulo: string;
    descripcion: string;
    imagenUrl?: string;
    contenido: string;
    fechaCreacion: Date;
    likes: string[];
    likesCount: number;
    comentarios: Comentario[];
    comentariosCount: number; 
    isDeleted?: boolean;
}

export interface Comentario {
    _id?: string;
    usuarioId: User;
    contenido: string;
    fechaCreacion: Date;
    publicacionId?: string;
    modificado?: boolean;
}

export interface ComentariosPaginados {
    data: Comentario[];
    total: number;
    paginaActual: number;
    totalPaginas: number;
}

export interface PublicacionesResponse {
    data: Publicacion[];
    total: number;
    paginaActual: number;
    totalPaginas: number;
}