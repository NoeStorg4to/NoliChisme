import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PublicacionesService } from './publicacion.service';

class TimeQueryDto {
  startDate: string = new Date(0).toISOString();
  endDate: string = new Date().toISOString();
}

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('stats/publicaciones')
export class PublicacionesStatsController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  private getDates(query: TimeQueryDto) {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (!query.endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  @Get('by-user')
  getPublicationsByUser(@Query() query: TimeQueryDto) {
    const { startDate, endDate } = this.getDates(query);
    return this.publicacionesService.countPublicationsByUser(
      startDate,
      endDate,
    );
  }

  @Get('comments-total')
  getTotalComments(@Query() query: TimeQueryDto) {
    const { startDate, endDate } = this.getDates(query);
    return this.publicacionesService.countTotalComments(startDate, endDate);
  }

  @Get('comments-per-post')
  getCommentsPerPost(@Query() query: TimeQueryDto) {
    const { startDate, endDate } = this.getDates(query);
    return this.publicacionesService.countCommentsPerPost(startDate, endDate);
  }
}
