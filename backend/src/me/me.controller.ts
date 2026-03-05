import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventsService } from '../events/events.service';

@ApiTags('Me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events')
  @UseGuards(JwtAuthGuard)
  getMyEvents(
    @Req() req: any,
    @Query('view') _view?: 'month' | 'week',
    @Query('fromDate') _fromDate?: string,
    @Query('toDate') _toDate?: string,
  ) {
    return this.eventsService.findForUser(req.user.userId);
  }
}

