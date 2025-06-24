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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../generated/prisma';

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
  async registerForEvent(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.registerForEvent(id, req.user.id);
  }

  @Get(':id/attendees')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY, UserRole.ADMIN)
  async getEventAttendees(@Param('id') id: string, @Request() req: any) {
    // Only allow organizers to see attendee list (unless admin)
    const event = await this.eventsService.findOne(id);
    if (event.organizerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      return { message: 'Only event organizers can view attendee lists' };
    }
    
    const attendeeIds = await this.eventsService.getEventAttendees(id);
    return { attendees: attendeeIds, count: attendeeIds.length };
  }

  @Get('user/registrations')
  @UseGuards(JwtAuthGuard)
  async getUserRegistrations(@Request() req: any) {
    const registrations = await this.eventsService.getUserRegistrations(req.user.id);
    return { registeredEvents: registrations };
  }

  @Get('stats/overview')
  async getEventStats() {
    return this.eventsService.getEventStats();
  }

  @Get('user/registered-events')
  @UseGuards(JwtAuthGuard)
  async getUserEventRegistrations(@Request() req: any) {
    const events = await this.eventsService.getUserEventRegistrations(req.user.id);
    return { events };
  }
} 