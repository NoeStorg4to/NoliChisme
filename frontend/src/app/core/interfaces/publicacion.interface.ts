export interface Publicacion {
    _id?: string;
    usuarioId: string;
    contenido: string;
    fechaCreacion: Date;
    likes: number;
    comentarios: Comentario[];
}

export interface Comentario {
    usuarioId: string;
    contenido: string;
    fechaCreacion: Date;
}