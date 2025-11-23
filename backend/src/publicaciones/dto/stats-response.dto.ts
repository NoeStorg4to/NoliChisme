import { Types } from 'mongoose';

export interface PublicationsByUserStat {
  _id: Types.ObjectId;
  username: string;
  count: number;
}

export interface TotalCommentsStat {
  totalComments: number;
  startDate: Date;
  endDate: Date;
}

export interface CommentsPerPostStat {
  _id: Types.ObjectId;
  descripcion: string;
  comentariosCount: number;
}
