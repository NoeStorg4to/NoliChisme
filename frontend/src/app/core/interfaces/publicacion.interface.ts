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
    isDeleted?: boolean;
}

export interface Comentario {
    _id?: string;
    usuarioId: User;
    contenido: string;
    fechaCreacion: Date;
}

export interface PublicacionesResponse {
    data: Publicacion[];
    total: number;
}