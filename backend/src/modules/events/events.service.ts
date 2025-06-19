import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from '../../../generated/prisma';

// Temporary interface for event attendee tracking
// In a real scenario, this would be a proper Prisma model
interface EventAttendee {
  eventId: string;
  userId: string;
  registeredAt: Date;
}

@Injectable()
export class EventsService {
  // Temporary in-memory storage for attendees
  // In production, this should be a proper database table
  private eventAttendees: EventAttendee[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Event[]> {
    return this.prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            company: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            company: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const eventData = {
      ...createEventDto,
      date: new Date(createEventDto.date),
      organizerId,
    };

    return this.prisma.event.create({
      data: eventData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            company: true,
          },
        },
      },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Ownership check
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only update events that you organized');
    }

    const updateData = {
      ...updateEventDto,
      ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
    };

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            company: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Ownership check
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only delete events that you organized');
    }

    // Remove all attendee registrations for this event
    this.eventAttendees = this.eventAttendees.filter(
      attendee => attendee.eventId !== id
    );

    await this.prisma.event.delete({
      where: { id },
    });
  }

  async registerForEvent(eventId: string, userId: string): Promise<{ message: string }> {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Check if event is in the past
    if (event.date < new Date()) {
      throw new BadRequestException('Cannot register for past events');
    }

    // Check if user is already registered
    const existingRegistration = this.eventAttendees.find(
      attendee => attendee.eventId === eventId && attendee.userId === userId
    );

    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    // Check if event has reached maximum capacity
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    // Prevent organizer from registering for their own event
    if (event.organizerId === userId) {
      throw new BadRequestException('Event organizers cannot register for their own events');
    }

    // Add registration to temporary storage
    this.eventAttendees.push({
      eventId,
      userId,
      registeredAt: new Date(),
    });

    // Update current attendees count
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        currentAttendees: {
          increment: 1,
        },
      },
    });

    return { message: 'Successfully registered for the event' };
  }

  async getEventAttendees(eventId: string): Promise<string[]> {
    return this.eventAttendees
      .filter(attendee => attendee.eventId === eventId)
      .map(attendee => attendee.userId);
  }

  async getUserRegistrations(userId: string): Promise<string[]> {
    return this.eventAttendees
      .filter(attendee => attendee.userId === userId)
      .map(attendee => attendee.eventId);
  }
} 