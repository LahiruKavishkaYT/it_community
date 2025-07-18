import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  Query,
  Put,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole, AttendeeStatus } from '../../../generated/prisma';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY)
  async create(
    @Body(ValidationPipe) createEventDto: CreateEventDto,
    @Request() req: any,
  ) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventDto: UpdateEventDto,
    @Request() req: any,
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.eventsService.remove(id, req.user.id);
    return { message: 'Event deleted successfully' };
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async registerForEvent(
    @Param('id') id: string, 
    @Request() req: any,
    @Body() registrationData?: {
      dietaryRestrictions?: string[];
      emergencyContact?: string;
      notes?: string;
    }
  ) {
    return this.eventsService.registerForEvent(id, req.user.id, registrationData);
  }

  @Get(':id/attendees')
  async getEventAttendees(@Param('id') id: string) {
    return this.eventsService.getEventAttendees(id);
  }

  @Get(':id/attendees/manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async getEventAttendeesForOrganizer(@Param('id') id: string, @Request() req: any) {
    const attendees = await this.eventsService.getEventAttendees(id, req.user.id);
    return { attendees, count: attendees.length };
  }

  @Put(':eventId/attendees/:attendeeId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async manageAttendeeStatus(
    @Param('eventId') eventId: string,
    @Param('attendeeId') attendeeId: string,
    @Body() statusData: { status: AttendeeStatus },
    @Request() req: any
  ) {
    return this.eventsService.manageAttendeeStatus(
      eventId, 
      attendeeId, 
      statusData.status, 
      req.user.id
    );
  }

  @Post(':eventId/attendees/:attendeeId/checkin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async checkInAttendee(
    @Param('eventId') eventId: string,
    @Param('attendeeId') attendeeId: string,
    @Request() req: any
  ) {
    return this.eventsService.checkInAttendee(eventId, attendeeId, req.user.id);
  }

  @Get('user/registrations')
  @UseGuards(JwtAuthGuard)
  async getUserRegistrations(@Request() req: any) {
    const registrations = await this.eventsService.getUserRegistrations(req.user.id);
    return { registeredEvents: registrations };
  }

  @Get('user/registered-events')
  @UseGuards(JwtAuthGuard)
  async getUserEventRegistrations(@Request() req: any) {
    const events = await this.eventsService.getUserEventRegistrations(req.user.id);
    return { events };
  }

  @Get('user/organized')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY)
  async getOrganizerEvents(@Request() req: any) {
    const events = await this.eventsService.getOrganizerEvents(req.user.id);
    return { events };
  }

  @Get('stats/overview')
  async getEventStats() {
    return this.eventsService.getEventStats();
  }

  @Get('stats/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.COMPANY)
  async getEventAnalytics(
    @Query('period') period?: '7d' | '30d' | '90d' | '1y',
    @Query('organizerId') organizerId?: string,
    @Request() req?: any
  ) {
    return this.eventsService.getEventAnalytics(period, organizerId || req?.user?.id);
  }

  @Get('stats/trends')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.COMPANY)
  async getEventTrends(
    @Query('period') period?: '7d' | '30d' | '90d' | '1y',
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
    @Query('organizerId') organizerId?: string,
    @Request() req?: any
  ) {
    return this.eventsService.getEventTrends(period, groupBy, organizerId || req?.user?.id);
  }

  @Post('bulk/register')
  @UseGuards(JwtAuthGuard)
  async bulkRegisterForEvents(
    @Body() body: { eventIds: string[]; registrationData?: any },
    @Request() req: any
  ) {
    return this.eventsService.bulkRegisterForEvents(body.eventIds, req.user.id, body.registrationData);
  }

  @Post('bulk/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async bulkUpdateEventStatus(
    @Body() body: { eventIds: string[]; status: string },
    @Request() req: any
  ) {
    return this.eventsService.bulkUpdateEventStatus(body.eventIds, body.status, req.user.id);
  }

  @Get('search/advanced')
  async advancedSearch(
    @Query('q') query?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
    @Query('organizer') organizer?: string,
    @Query('hasFood') hasFood?: boolean,
    @Query('hasDrinks') hasDrinks?: boolean,
    @Query('isVirtual') isVirtual?: boolean,
    @Query('maxFee') maxFee?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.eventsService.advancedSearch({
      query,
      type,
      status,
      dateFrom,
      dateTo,
      location,
      organizer,
      hasFood,
      hasDrinks,
      isVirtual,
      maxFee,
      page: page || 1,
      limit: limit || 10
    });
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getEventRecommendations(
    @Request() req: any,
    @Query('limit') limit?: number
  ) {
    return this.eventsService.getEventRecommendations(req.user.id, limit || 5);
  }

  @Post(':id/check-out')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async checkOutAttendee(
    @Param('id') eventId: string,
    @Body() body: { attendeeId: string },
    @Request() req: any
  ) {
    return this.eventsService.checkOutAttendee(eventId, body.attendeeId, req.user.id);
  }

  @Get(':id/attendance-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async getAttendanceReport(
    @Param('id') eventId: string,
    @Request() req: any
  ) {
    return this.eventsService.getAttendanceReport(eventId, req.user.id);
  }

  @Get(':id/food-drinks-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async getFoodAndDrinksReport(
    @Param('id') eventId: string,
    @Request() req: any
  ) {
    return this.eventsService.getFoodAndDrinksReport(eventId, req.user.id);
  }

  @Post(':id/send-notifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async sendEventNotifications(
    @Param('id') eventId: string,
    @Body() body: { 
      message: string; 
      type: 'all' | 'approved' | 'pending' | 'waitlist';
      includeOrganizer?: boolean;
    },
    @Request() req: any
  ) {
    return this.eventsService.sendEventNotifications(eventId, body, req.user.id);
  }

  @Get(':id/export-attendees')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async exportAttendees(
    @Param('id') eventId: string,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Request() req: any
  ) {
    return this.eventsService.exportAttendees(eventId, format, req.user.id);
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async getEventDashboard(@Param('id') id: string, @Request() req: any) {
    const [event, attendees, foodReport] = await Promise.all([
      this.eventsService.findOne(id),
      this.eventsService.getEventAttendees(id, req.user.id),
      this.eventsService.getFoodAndDrinksReport(id, req.user.id)
    ]);

    if (event.organizerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new Error('Only event organizers can view event dashboard');
    }

    const statusCounts = attendees.reduce((acc, attendee) => {
      acc[attendee.status] = (acc[attendee.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const checkedInCount = attendees.filter(a => a.checkedIn).length;

    return {
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        type: event.type,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees
      },
      attendeeStats: {
        total: attendees.length,
        approved: statusCounts[AttendeeStatus.APPROVED] || 0,
        pending: statusCounts[AttendeeStatus.PENDING] || 0,
        declined: statusCounts[AttendeeStatus.DECLINED] || 0,
        waitlist: statusCounts[AttendeeStatus.WAITLIST] || 0,
        checkedIn: checkedInCount
      },
      foodAndDrinks: foodReport,
      recentRegistrations: attendees
        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
        .slice(0, 5)
    };
  }
} 