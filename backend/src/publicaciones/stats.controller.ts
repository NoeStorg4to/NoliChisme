import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PublicacionesService } from './publicacion.service';
import { TimeQueryDto } from './dto/time-query.dto';
import { PublicationsByUserStat } from './dto/stats-response.dto';

// interface ChartResponse {
//   labels: string[];
//   data: number[];
// }

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('stats/publicaciones')
export class PublicacionesStatsController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  private getDates(query: TimeQueryDto) {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (query.endDate) {
      endDate.setUTCHours(23, 59, 59, 999);
    } else {
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate, userId: query.userId };
  }

  @Get('by-user')
  async getPublicationsByUser(
    @Query() query: TimeQueryDto,
  ): Promise<PublicationsByUserStat[]> {
    const { startDate, endDate, userId } = this.getDates(query);

    const stats: PublicationsByUserStat[] =
      await this.publicacionesService.countPublicationsByUser(
        startDate,
        endDate,
        userId,
      );

    return stats;
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
