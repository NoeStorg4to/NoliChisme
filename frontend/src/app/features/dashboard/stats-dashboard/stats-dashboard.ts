import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartDataset, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { AdminService } from '../../../core/services/admin.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { Router } from '@angular/router';
import { CommentsPerPostStat, PublicationsByUserStat, TotalCommentsStat } from '../../../core/interfaces/stats.interface';
import { User } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './stats-dashboard.html',
  styleUrl: './stats-dashboard.css',
})
export class StatsDashboard implements OnInit{
  isLoading = true;
  errorMessage = '';

  startDate: string = this.getPastDate(30);
  endDate: string = this.getTodayDate();

  // --> GRAFICO PARA PUBLICACIONES POR USUARIO (BARRAS)
  pubChartDatasets: ChartDataset[] = [{ data: [], label: 'Publicaciones' }];
  pubChartLabels: string[] = [];
  pubChartOptions: any = { responsive: true, maintainAspectRatio: false };
  pubChartType: ChartType = 'bar';

  // --> GRAFICO TOTAL DE COMENTARIOS (TORTA)
  commentChartDatasets: ChartDataset[] = [{ data: [1], label: 'Total Comentarios', backgroundColor: ['#8b5cf6', '#e9d5ff'] }];
  commentChartLabels: string[] = ['Comentarios Realizados', ''];
  commentChartType: ChartType = 'doughnut';
  commentChartTotal: number = 0;

  // --> GRAFICO COMENTARIOS POR POST (BARRAS PERO HORIZONTALES)
  postCommentChartDatasets: ChartDataset[] = [{ data: [], label: 'Comentarios por Post', backgroundColor: '#7c3aed' }];
  postCommentChartLabels: string[] = [];
  postCommentChartType: ChartType = 'bar';
  postCommentChartOptions: any = { 
    indexAxis: 'y', 
    responsive: true, 
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true } }
  };

  users: User[] = [];
  selectedUserId: string = '';

  constructor(
    private adminService: AdminService,
    private pubService: PublicacionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.adminService.isAdmin()) {
      this.router.navigate(['/publicaciones']);
      return;
    }
    this.loadUsers();
    this.loadStats();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getPastDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar la lista de usuarios para filtrar.';
        console.error(err);
      }
    });
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const userIdToFilter = this.selectedUserId || undefined;

    this.pubService.getPublicationsByUserStats(start, end, userIdToFilter).subscribe({
      next: (data: PublicationsByUserStat[]) => {
        this.pubChartLabels = data.map(item => `@${item.username}`);
        this.pubChartDatasets = [{
          data: data.map(item => item.count),
          label: 'Publicaciones Realizadas',
          backgroundColor: '#8b5cf6'
        }];
      },
      error: (err) => this.errorMessage = 'Error al cargar estadisticas de publicaciones por usuario'
    });

    this.pubService.getTotalCommentsStats(start, end).subscribe({
      next: (data: TotalCommentsStat) => {
        this.commentChartTotal = data.totalComments;
        this.commentChartDatasets = [{
          data: [data.totalComments, 0],
          label: 'Total Comentarios',
          backgroundColor: ['#8b5cf6', '#e9d5ff']
        }];
        this.commentChartLabels = [`Total (${data.totalComments})`, ''];
      },
      error: (err) => this.errorMessage = 'Error al cargar estadisticas de comentarios totales'
    });

    this.pubService.getCommentsPerPostStats(start, end).subscribe({
      next: (data: CommentsPerPostStat[]) => {
        this.postCommentChartLabels = data.map(item => item.descripcion ? item.descripcion.substring(0, 30) + (item.descripcion.length > 30 ? '...' : '') : 'Sin Descripcion')
        this.postCommentChartDatasets = [{
          data: data.map(item => item.comentariosCount),
          label: 'Comentarios por Post',
          backgroundColor: '#7c3aed'
        }];
      },
      error: (err) => this.errorMessage = 'Error al cargar las estadisticas de comentarios por post.'
    });

    this.isLoading = false;
  }
}
