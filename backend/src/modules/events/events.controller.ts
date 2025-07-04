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

  @Get(':id/food-drinks-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async getFoodAndDrinksReport(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.getFoodAndDrinksReport(id, req.user.id);
  }

  @Get('stats/overview')
  async getEventStats() {
    return this.eventsService.getEventStats();
  }

  @Post(':eventId/attendees/bulk-approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async bulkApproveAttendees(
    @Param('eventId') eventId: string,
    @Body() data: { attendeeIds: string[] },
    @Request() req: any
  ) {
    const results = await Promise.all(
      data.attendeeIds.map(attendeeId =>
        this.eventsService.manageAttendeeStatus(
          eventId,
          attendeeId,
          AttendeeStatus.APPROVED,
          req.user.id
        ).catch(error => ({ error: error.message, attendeeId }))
      )
    );

    const successful = results.filter(r => !('error' in r));
    const failed = results.filter(r => 'error' in r);

    return {
      message: `Bulk approval completed`,
      successful: successful.length,
      failed: failed.length,
      errors: failed
    };
  }

  @Get(':id/attendees/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async exportAttendeeList(@Param('id') id: string, @Request() req: any) {
    const attendees = await this.eventsService.getEventAttendees(id, req.user.id);
    
    const csvData = attendees.map(attendee => ({
      name: attendee.name,
      email: attendee.email,
      role: attendee.role,
      company: attendee.company || '',
      status: attendee.status,
      registeredAt: attendee.registeredAt,
      checkedIn: attendee.checkedIn ? 'Yes' : 'No',
      dietaryRestrictions: attendee.dietaryRestrictions?.join(', ') || '',
      emergencyContact: attendee.emergencyContact || ''
    }));

    return { 
      attendees: csvData,
      totalCount: csvData.length,
      exportedAt: new Date().toISOString()
    };
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