import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventStatus, AttendeeStatus } from '../../../generated/prisma';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService
  ) {}

  async findAll(): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
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
        attendees: {
          where: {
            status: {
              in: [AttendeeStatus.APPROVED, AttendeeStatus.PENDING]
            }
          },
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform the data to match frontend expectations
    return events.map(event => ({
      ...event,
      organizer: event.organizer.name,
      currentAttendees: event.attendees.filter(a => a.status === AttendeeStatus.APPROVED).length,
    }));
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
        attendees: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true
              }
            }
          }
        }
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    // Process the complex nested objects
    const eventData: any = {
      title: createEventDto.title,
      description: createEventDto.description,
      date: new Date(createEventDto.date),
      location: createEventDto.location,
      type: createEventDto.type,
      maxAttendees: createEventDto.maxAttendees,
      imageUrl: createEventDto.imageUrl,
      organizerId,
      
      // Handle food and drinks (use nested object if provided, fallback to legacy fields)
      foodProvided: createEventDto.foodAndDrinks?.foodProvided ?? createEventDto.foodProvided ?? false,
      drinksProvided: createEventDto.foodAndDrinks?.drinksProvided ?? createEventDto.drinksProvided ?? false,
      foodDetails: createEventDto.foodAndDrinks?.foodDetails,
      drinkDetails: createEventDto.foodAndDrinks?.drinkDetails,
      dietaryRestrictions: createEventDto.foodAndDrinks?.dietaryRestrictions ?? [],
      alcoholicBeverages: createEventDto.foodAndDrinks?.alcoholicBeverages ?? false,
      
      // Registration settings
      requireApproval: createEventDto.registrationSettings?.requireApproval ?? false,
      registrationDeadline: createEventDto.registrationSettings?.registrationDeadline 
        ? new Date(createEventDto.registrationSettings.registrationDeadline) 
        : null,
      registrationInstructions: createEventDto.registrationSettings?.registrationInstructions,
      requiredFields: createEventDto.registrationSettings?.requiredFields ?? [],
      
      // Additional details
      tags: createEventDto.tags ?? [],
      prerequisites: createEventDto.prerequisites ?? [],
      agenda: createEventDto.agenda,
      speakers: createEventDto.speakers ?? [],
      eventFee: createEventDto.eventFee ?? 0,
      eventUrl: createEventDto.eventUrl,
      isVirtual: createEventDto.isVirtual ?? false,
      virtualMeetingLink: createEventDto.virtualMeetingLink,
    };

    const createdEvent = await this.prisma.event.create({
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

    // Transform the data to match frontend expectations
    return {
      ...createdEvent,
      organizer: createdEvent.organizer.name,
    } as any;
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

    const updateData: any = {
      ...updateEventDto,
      ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
    };

    // Handle nested objects in updates
    if (updateEventDto.foodAndDrinks) {
      updateData.foodProvided = updateEventDto.foodAndDrinks.foodProvided;
      updateData.drinksProvided = updateEventDto.foodAndDrinks.drinksProvided;
      updateData.foodDetails = updateEventDto.foodAndDrinks.foodDetails;
      updateData.drinkDetails = updateEventDto.foodAndDrinks.drinkDetails;
      updateData.dietaryRestrictions = updateEventDto.foodAndDrinks.dietaryRestrictions;
      updateData.alcoholicBeverages = updateEventDto.foodAndDrinks.alcoholicBeverages;
      delete updateData.foodAndDrinks;
    }

    if (updateEventDto.registrationSettings) {
      updateData.requireApproval = updateEventDto.registrationSettings.requireApproval;
      updateData.registrationDeadline = updateEventDto.registrationSettings.registrationDeadline 
        ? new Date(updateEventDto.registrationSettings.registrationDeadline)
        : null;
      updateData.registrationInstructions = updateEventDto.registrationSettings.registrationInstructions;
      updateData.requiredFields = updateEventDto.registrationSettings.requiredFields;
      delete updateData.registrationSettings;
    }

    const updatedEvent = await this.prisma.event.update({
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

    // Transform the data to match frontend expectations
    return {
      ...updatedEvent,
      organizer: updatedEvent.organizer.name,
    } as any;
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

    // Delete all attendee registrations for this event first
    await this.prisma.eventAttendee.deleteMany({
      where: { eventId: id },
    });

    // Then delete the event
    await this.prisma.event.delete({
      where: { id },
    });
  }

  async registerForEvent(
    eventId: string, 
    userId: string, 
    registrationData?: {
      dietaryRestrictions?: string[];
      emergencyContact?: string;
      notes?: string;
    }
  ): Promise<{ message: string; requiresApproval?: boolean }> {
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

    // Check registration deadline
    if (event.registrationDeadline && event.registrationDeadline < new Date()) {
      throw new BadRequestException('Registration deadline has passed');
    }

    // Check if event has reached maximum capacity (only for approved attendees)
    const approvedAttendeesCount = await this.prisma.eventAttendee.count({
      where: { 
        eventId,
        status: AttendeeStatus.APPROVED
      }
    });

    if (event.maxAttendees && approvedAttendeesCount >= event.maxAttendees) {
      // If requires approval, add to pending, otherwise reject
      if (!event.requireApproval) {
        throw new BadRequestException('Event has reached maximum capacity');
      }
    }

    // Prevent organizer from registering for their own event
    if (event.organizerId === userId) {
      throw new BadRequestException('Event organizers cannot register for their own events');
    }

    try {
      const attendeeStatus = event.requireApproval ? AttendeeStatus.PENDING : AttendeeStatus.APPROVED;

      // Create the event attendee record
      await this.prisma.eventAttendee.create({
        data: {
          eventId,
          applicantId: userId,
          status: attendeeStatus,
          approvedAt: attendeeStatus === AttendeeStatus.APPROVED ? new Date() : null,
          dietaryRestrictions: registrationData?.dietaryRestrictions ?? [],
          emergencyContact: registrationData?.emergencyContact,
          notes: registrationData?.notes,
        },
      });

      // Update current attendees count only if approved
      if (attendeeStatus === AttendeeStatus.APPROVED) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: {
            currentAttendees: {
              increment: 1,
            },
          },
        });
      }

      // Log the activity
      await this.activitiesService.logEventRegistration(
        userId,
        event.title,
        eventId
      );

      const message = event.requireApproval 
        ? 'Registration submitted for approval' 
        : 'Successfully registered for the event';

      return { 
        message, 
        requiresApproval: event.requireApproval 
      };
    } catch (error) {
      // Handle unique constraint violation (user already registered)
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You are already registered for this event');
      }
      throw error;
    }
  }

  async manageAttendeeStatus(
    eventId: string, 
    attendeeId: string, 
    status: AttendeeStatus, 
    organizerId: string
  ): Promise<{ message: string }> {
    // Verify organizer permissions
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can manage attendee status');
    }

    const attendee = await this.prisma.eventAttendee.findFirst({
      where: { 
        eventId, 
        applicantId: attendeeId 
      },
    });

    if (!attendee) {
      throw new NotFoundException('Attendee registration not found');
    }

    // Check capacity when approving
    if (status === AttendeeStatus.APPROVED && attendee.status !== AttendeeStatus.APPROVED) {
      const approvedCount = await this.prisma.eventAttendee.count({
        where: { 
          eventId,
          status: AttendeeStatus.APPROVED
        }
      });

      if (event.maxAttendees && approvedCount >= event.maxAttendees) {
        throw new BadRequestException('Event has reached maximum capacity');
      }
    }

    // Update attendee status
    await this.prisma.eventAttendee.update({
      where: { id: attendee.id },
      data: {
        status,
        approvedAt: status === AttendeeStatus.APPROVED ? new Date() : attendee.approvedAt,
      },
    });

    // Update event attendee count
    const newApprovedCount = await this.prisma.eventAttendee.count({
      where: { 
        eventId,
        status: AttendeeStatus.APPROVED
      }
    });

    await this.prisma.event.update({
      where: { id: eventId },
      data: { currentAttendees: newApprovedCount },
    });

    return { message: `Attendee status updated to ${status.toLowerCase()}` };
  }

  async checkInAttendee(eventId: string, attendeeId: string, organizerId: string): Promise<{ message: string }> {
    // Verify organizer permissions
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can check in attendees');
    }

    const attendee = await this.prisma.eventAttendee.findFirst({
      where: { 
        eventId, 
        applicantId: attendeeId,
        status: AttendeeStatus.APPROVED
      },
    });

    if (!attendee) {
      throw new NotFoundException('Approved attendee not found');
    }

    await this.prisma.eventAttendee.update({
      where: { id: attendee.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    return { message: 'Attendee checked in successfully' };
  }

  async getEventAttendees(eventId: string, organizerId?: string): Promise<any[]> {
    // Verify organizer permissions if organizerId provided
    if (organizerId) {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event || event.organizerId !== organizerId) {
        throw new ForbiddenException('Only event organizers can view detailed attendee information');
      }
    }

    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            company: true,
          }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });
    
    return attendees.map(attendee => ({
      id: attendee.applicant.id,
      name: attendee.applicant.name,
      email: organizerId ? attendee.applicant.email : undefined, // Only show email to organizers
      avatar: attendee.applicant.avatar,
      role: attendee.applicant.role,
      company: attendee.applicant.company,
      status: attendee.status,
      registeredAt: attendee.registeredAt,
      approvedAt: attendee.approvedAt,
      checkedIn: attendee.checkedIn,
      checkedInAt: attendee.checkedInAt,
      dietaryRestrictions: organizerId ? attendee.dietaryRestrictions : undefined,
      emergencyContact: organizerId ? attendee.emergencyContact : undefined,
      notes: organizerId ? attendee.notes : undefined,
    }));
  }

  async getUserRegistrations(userId: string): Promise<string[]> {
    const registrations = await this.prisma.eventAttendee.findMany({
      where: { applicantId: userId },
      select: { eventId: true },
    });
    
    return registrations.map(registration => registration.eventId);
  }

  async getEventStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEventsThisMonth,
      totalAttendees,
      uniqueOrganizers,
      averageRating
    ] = await Promise.all([
      // Events this month
      this.prisma.event.count({
        where: {
          date: {
            gte: startOfMonth
          }
        }
      }),
      
      // Total approved attendees across all events
      this.prisma.eventAttendee.count({
        where: {
          status: AttendeeStatus.APPROVED
        }
      }),
      
      // Unique organizers
      this.prisma.event.groupBy({
        by: ['organizerId'],
        _count: true
      }).then(groups => groups.length),
      
      // Mock average rating (since we don't have ratings in schema yet)
      Promise.resolve(4.8)
    ]);

    return {
      eventsThisMonth: totalEventsThisMonth,
      totalAttendees,
      uniqueOrganizers,
      averageRating
    };
  }

  async getUserEventRegistrations(userId: string) {
    const registrations = await this.prisma.eventAttendee.findMany({
      where: { applicantId: userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            type: true,
            organizer: {
              select: {
                name: true,
                company: true
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    return registrations.map(reg => ({
      ...reg.event,
      registrationStatus: reg.status,
      registeredAt: reg.registeredAt,
      checkedIn: reg.checkedIn,
      organizer: reg.event.organizer.company || reg.event.organizer.name
    }));
  }

  async getOrganizerEvents(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      include: {
        attendees: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async getFoodAndDrinksReport(eventId: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: {
            status: AttendeeStatus.APPROVED
          },
          select: {
            dietaryRestrictions: true,
            applicant: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can view food and drinks reports');
    }

    const dietaryRestrictions = event.attendees
      .flatMap(a => a.dietaryRestrictions)
      .reduce((acc, restriction) => {
        acc[restriction] = (acc[restriction] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      eventTitle: event.title,
      totalAttendees: event.attendees.length,
      foodProvided: event.foodProvided,
      drinksProvided: event.drinksProvided,
      foodDetails: event.foodDetails,
      drinkDetails: event.drinkDetails,
      alcoholicBeverages: event.alcoholicBeverages,
      dietaryRestrictions,
      attendeesWithRestrictions: event.attendees.filter(a => a.dietaryRestrictions.length > 0)
    };
  }
} 