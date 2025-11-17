import { Publicacion } from '../schemas/publicacion.schema';

export interface PublicacionesResponse {
  data: Publicacion[];
  total: number;
  paginaActual: number;
  totalPaginas: number;
}
