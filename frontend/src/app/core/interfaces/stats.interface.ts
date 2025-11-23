import { ChartType } from 'chart.js';

export interface PublicationsByUserStat { //BARRAS
    _id: string;
    username: string;
    count: number;
}

export interface TotalCommentsStat {
    totalComments: number;
    startDate: Date;
    endDate: Date;
}

export interface CommentsPerPostStat { //BARRAS HORIZONTALES
    _id: string;
    descripcion: string;
    comentariosCount: number;
}

export interface ChartDataset {
    data: number[];
    label: string;
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    hoverBackgroundColor?: string | string[];
    hoverBorderColor?: string | string[];
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    type?: ChartType;
}