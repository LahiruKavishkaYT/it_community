import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventStatus, AttendeeStatus } from '../../../generated/prisma';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationService } from '../notifications/notification.service';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationService: NotificationService
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
      type: createEventDto.type,
      maxAttendees: createEventDto.maxAttendees,
      imageUrl: createEventDto.imageUrl,
      organizerId,
      
      // Enhanced date/time fields
      startDateTime: new Date(createEventDto.startDateTime),
      endDateTime: createEventDto.endDateTime ? new Date(createEventDto.endDateTime) : null,
      date: createEventDto.date ? new Date(createEventDto.date) : new Date(createEventDto.startDateTime), // Legacy compatibility
      
      // Enhanced location fields
      locationType: createEventDto.locationType,
      venue: createEventDto.venue,
      virtualEventLink: createEventDto.virtualEventLink,
      location: createEventDto.location || (createEventDto.locationType === 'ONSITE' ? createEventDto.venue : createEventDto.virtualEventLink), // Legacy compatibility
      
      // Registration deadline
      registrationDeadline: new Date(createEventDto.registrationDeadline),
      
      // Food and drinks coordination
      foodAndDrinksProvided: createEventDto.foodAndDrinksProvided ?? false,
      
      // Handle food and drinks (use nested object if provided, fallback to legacy fields)
      foodProvided: createEventDto.foodAndDrinks?.foodProvided ?? createEventDto.foodProvided ?? false,
      drinksProvided: createEventDto.foodAndDrinks?.drinksProvided ?? createEventDto.drinksProvided ?? false,
      foodDetails: createEventDto.foodAndDrinks?.foodDetails,
      drinkDetails: createEventDto.foodAndDrinks?.drinkDetails,
      dietaryRestrictions: createEventDto.foodAndDrinks?.dietaryRestrictions ?? [],
      alcoholicBeverages: createEventDto.foodAndDrinks?.alcoholicBeverages ?? false,
      
      // Registration settings
      requireApproval: createEventDto.requireApproval ?? false,
      registrationInstructions: createEventDto.registrationInstructions,
      requiredFields: createEventDto.requiredFields ?? [],
      
      // Additional details
      tags: createEventDto.tags ?? [],
      prerequisites: createEventDto.prerequisites ?? [],
      agenda: createEventDto.agenda,
      speakers: createEventDto.speakers ?? [],
      eventFee: createEventDto.eventFee ?? 0,
      eventUrl: createEventDto.eventUrl,
      isVirtual: createEventDto.isVirtual ?? (createEventDto.locationType === 'VIRTUAL'),
      virtualMeetingLink: createEventDto.virtualMeetingLink || createEventDto.virtualEventLink,
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

    // Send informational notification to admins about new event
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {
      try {
        await this.notificationService.createNotification({
          userId: admin.id,
          type: $Enums.NotificationType.EVENT_NOTIFICATION,
          title: 'New Event Published',
          message: `${createdEvent.organizer.name} published "${createdEvent.title}" (${createdEvent.type.toLowerCase()})`,
          priority: $Enums.NotificationPriority.LOW,
          itemId: createdEvent.id,
          itemType: 'event',
          metadata: {
            eventTitle: createdEvent.title,
            eventType: createdEvent.type,
            organizerName: createdEvent.organizer.name,
            organizerRole: createdEvent.organizer.role,
            publishedAt: createdEvent.createdAt,
            maxAttendees: createdEvent.maxAttendees,
            isPublic: true // Events are published immediately
          }
        });
      } catch (error) {
        console.error(`Failed to notify admin ${admin.id}:`, error);
      }
    }

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

    // Handle enhanced date/time fields
    if (updateEventDto.startDateTime) {
      updateData.startDateTime = new Date(updateEventDto.startDateTime);
      updateData.date = new Date(updateEventDto.startDateTime); // Legacy compatibility
    }
    
    if (updateEventDto.endDateTime) {
      updateData.endDateTime = new Date(updateEventDto.endDateTime);
    }
    
    if (updateEventDto.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateEventDto.registrationDeadline);
    }

    // Handle enhanced location fields
    if (updateEventDto.locationType) {
      updateData.locationType = updateEventDto.locationType;
      updateData.isVirtual = updateEventDto.locationType === 'VIRTUAL';
    }
    
    if (updateEventDto.venue) {
      updateData.venue = updateEventDto.venue;
      if (updateEventDto.locationType === 'ONSITE') {
        updateData.location = updateEventDto.venue; // Legacy compatibility
      }
    }
    
    if (updateEventDto.virtualEventLink) {
      updateData.virtualEventLink = updateEventDto.virtualEventLink;
      updateData.virtualMeetingLink = updateEventDto.virtualEventLink;
      if (updateEventDto.locationType === 'VIRTUAL') {
        updateData.location = updateEventDto.virtualEventLink; // Legacy compatibility
      }
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
    if (event.date && event.date < new Date()) {
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

      // Get user info for notifications
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      // Send confirmation notification to user
      const eventDateString = event.date ? new Date(event.date).toLocaleDateString() : 'TBD';
      const confirmationMessage = event.requireApproval
        ? `Your registration for "${event.title}" has been submitted and is pending approval`
        : `You're successfully registered for "${event.title}" on ${eventDateString}`;

      await this.notificationService.createNotification({
        userId: userId,
        type: $Enums.NotificationType.EVENT_NOTIFICATION,
        title: event.requireApproval ? 'Registration Submitted' : 'Registration Confirmed! 🎉',
        message: confirmationMessage,
        priority: event.requireApproval ? $Enums.NotificationPriority.MEDIUM : $Enums.NotificationPriority.HIGH,
        itemId: eventId,
        itemType: 'event',
        metadata: {
          eventTitle: event.title,
          eventDate: event.date,
          registrationStatus: attendeeStatus,
          requiresApproval: event.requireApproval
        }
      });

      // Notify event organizer about new registration
      await this.notificationService.createNotification({
        userId: event.organizerId,
        type: $Enums.NotificationType.EVENT_NOTIFICATION,
        title: 'New Event Registration',
        message: `${user?.name || 'Someone'} registered for "${event.title}"${event.requireApproval ? ' (pending approval)' : ''}`,
        priority: $Enums.NotificationPriority.LOW,
        itemId: eventId,
        itemType: 'event',
        metadata: {
          eventTitle: event.title,
          attendeeName: user?.name,
          attendeeEmail: user?.email,
          registrationStatus: attendeeStatus,
          requiresApproval: event.requireApproval
        }
      });

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

    // Get attendee info for notification
    const attendeeUser = await this.prisma.user.findUnique({
      where: { id: attendeeId },
      select: { name: true }
    });

    // Send status update notification to attendee
    let notificationTitle = '';
    let notificationMessage = '';
    let priority: $Enums.NotificationPriority = $Enums.NotificationPriority.MEDIUM;

    switch (status) {
      case AttendeeStatus.APPROVED:
        notificationTitle = 'Event Registration Approved! 🎉';
        notificationMessage = `Your registration for "${event.title}" has been approved`;
        priority = $Enums.NotificationPriority.HIGH;
        break;
      case AttendeeStatus.DECLINED:
        notificationTitle = 'Event Registration Declined';
        notificationMessage = `Your registration for "${event.title}" has been declined`;
        priority = $Enums.NotificationPriority.MEDIUM;
        break;
      case AttendeeStatus.WAITLIST:
        notificationTitle = 'Moved to Event Waitlist';
        notificationMessage = `You've been moved to the waitlist for "${event.title}"`;
        priority = $Enums.NotificationPriority.MEDIUM;
        break;
    }

    await this.notificationService.createNotification({
      userId: attendeeId,
      type: $Enums.NotificationType.EVENT_NOTIFICATION,
      title: notificationTitle,
      message: notificationMessage,
      priority: priority,
      itemId: eventId,
      itemType: 'event',
      metadata: {
        eventTitle: event.title,
        eventDate: event.date,
        newStatus: status,
        organizerAction: true
      }
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
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can view food and drinks reports');
    }

    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        applicant: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const dietaryRestrictions = attendees
      .filter(a => a.dietaryRestrictions && a.dietaryRestrictions.length > 0)
      .map(a => ({
        name: a.applicant.name,
        restrictions: a.dietaryRestrictions
      }));

    const totalAttendees = attendees.length;
    const withDietaryRestrictions = dietaryRestrictions.length;

    return {
      event: {
        title: event.title,
        foodProvided: event.foodProvided,
        drinksProvided: event.drinksProvided,
        foodDetails: event.foodDetails,
        drinkDetails: event.drinkDetails,
        alcoholicBeverages: event.alcoholicBeverages
      },
      summary: {
        totalAttendees,
        withDietaryRestrictions,
        percentageWithRestrictions: totalAttendees > 0 ? Math.round((withDietaryRestrictions / totalAttendees) * 100) : 0
      },
      dietaryRestrictions,
      recommendations: {
        food: event.foodProvided ? this.generateFoodRecommendations(dietaryRestrictions) : null,
        drinks: event.drinksProvided ? this.generateDrinkRecommendations(dietaryRestrictions) : null
      }
    };
  }

  async getEventAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d', organizerId?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {
      createdAt: { gte: startDate }
    };

    if (organizerId) {
      whereClause.organizerId = organizerId;
    }

    const [events, totalAttendees, eventsByType, eventsByStatus] = await Promise.all([
      this.prisma.event.findMany({
        where: whereClause,
        include: {
          attendees: true,
          organizer: {
            select: {
              name: true
            }
          }
        }
      }),
      this.prisma.eventAttendee.count({
        where: {
          event: whereClause
        }
      }),
      this.prisma.event.groupBy({
        by: ['type'],
        where: whereClause,
        _count: {
          type: true
        }
      }),
      this.prisma.event.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true
        }
      })
    ]);

    const totalEvents = events.length;
    const averageAttendees = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;

    return {
      period,
      overview: {
        totalEvents,
        totalAttendees,
        averageAttendees,
        uniqueOrganizers: new Set(events.map(e => e.organizerId)).size
      },
      eventsByType: eventsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      eventsByStatus: eventsByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      recentEvents: events
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(event => ({
          id: event.id,
          title: event.title,
          type: event.type,
          status: event.status,
          organizer: event.organizer.name,
          attendeeCount: event.attendees.length,
          createdAt: event.createdAt
        }))
    };
  }

  async getEventTrends(period: '7d' | '30d' | '90d' | '1y' = '30d', groupBy: 'day' | 'week' | 'month' = 'day', organizerId?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {
      createdAt: { gte: startDate }
    };

    if (organizerId) {
      whereClause.organizerId = organizerId;
    }

    const events = await this.prisma.event.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        status: true,
        type: true,
        attendees: {
          select: {
            id: true
          }
        }
      }
    });

    // Group events by date
    const eventGroups = new Map<string, any[]>();
    const attendeeGroups = new Map<string, number>();

    events.forEach(event => {
      let dateKey: string;
      
      if (groupBy === 'day') {
        dateKey = event.createdAt.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(event.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else {
        dateKey = `${event.createdAt.getFullYear()}-${String(event.createdAt.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!eventGroups.has(dateKey)) {
        eventGroups.set(dateKey, []);
      }
      eventGroups.get(dateKey)!.push(event);

      // Count attendees
      const currentAttendees = attendeeGroups.get(dateKey) || 0;
      attendeeGroups.set(dateKey, currentAttendees + event.attendees.length);
    });

    // Convert to sorted array
    const trends = Array.from(eventGroups.keys())
      .sort()
      .map(dateKey => {
        const dayEvents = eventGroups.get(dateKey)!;
        const statusCounts = dayEvents.reduce((acc, event) => {
          acc[event.status] = (acc[event.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const typeCounts = dayEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          date: dateKey,
          totalEvents: dayEvents.length,
          attendees: attendeeGroups.get(dateKey) || 0,
          statusBreakdown: statusCounts,
          typeBreakdown: typeCounts
        };
      });

    return {
      period,
      groupBy,
      trends,
      summary: {
        totalEvents: events.length,
        totalAttendees: events.reduce((sum, event) => sum + event.attendees.length, 0),
        averageEventsPerPeriod: trends.length > 0 ? Math.round(events.length / trends.length) : 0
      }
    };
  }

  async bulkRegisterForEvents(eventIds: string[], userId: string, registrationData?: any) {
    const results = await Promise.all(
      eventIds.map(eventId =>
        this.registerForEvent(eventId, userId, registrationData)
          .then(result => ({ success: true, eventId, result }))
          .catch(error => ({ success: false, eventId, error: error.message }))
      )
    );

    const successful = results.filter(r => r.success) as Array<{ success: true; eventId: string; result: any }>;
    const failed = results.filter(r => !r.success) as Array<{ success: false; eventId: string; error: string }>;

    return {
      message: `Bulk registration completed`,
      successful: successful.length,
      failed: failed.length,
      results: {
        successful: successful.map(r => ({ eventId: r.eventId, result: r.result })),
        failed: failed.map(r => ({ eventId: r.eventId, error: r.error }))
      }
    };
  }

  async bulkUpdateEventStatus(eventIds: string[], status: string, userId: string) {
    const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const results = await Promise.all(
      eventIds.map(eventId =>
        this.update(eventId, { status: status as EventStatus }, userId)
          .then(result => ({ success: true, eventId, result }))
          .catch(error => ({ success: false, eventId, error: error.message }))
      )
    );

    const successful = results.filter(r => r.success) as Array<{ success: true; eventId: string; result: any }>;
    const failed = results.filter(r => !r.success) as Array<{ success: false; eventId: string; error: string }>;

    return {
      message: `Bulk status update completed`,
      successful: successful.length,
      failed: failed.length,
      results: {
        successful: successful.map(r => ({ eventId: r.eventId, result: r.result })),
        failed: failed.map(r => ({ eventId: r.eventId, error: r.error }))
      }
    };
  }

  async advancedSearch(filters: {
    query?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    organizer?: string;
    hasFood?: boolean;
    hasDrinks?: boolean;
    isVirtual?: boolean;
    maxFee?: number;
    page: number;
    limit: number;
  }) {
    const { page, limit, ...searchFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (searchFilters.query) {
      where.OR = [
        { title: { contains: searchFilters.query, mode: 'insensitive' } },
        { description: { contains: searchFilters.query, mode: 'insensitive' } }
      ];
    }

    if (searchFilters.type) {
      where.type = searchFilters.type;
    }

    if (searchFilters.status) {
      where.status = searchFilters.status;
    }

    if (searchFilters.dateFrom || searchFilters.dateTo) {
      where.date = {};
      if (searchFilters.dateFrom) {
        where.date.gte = new Date(searchFilters.dateFrom);
      }
      if (searchFilters.dateTo) {
        where.date.lte = new Date(searchFilters.dateTo);
      }
    }

    if (searchFilters.location) {
      where.location = { contains: searchFilters.location, mode: 'insensitive' };
    }

    if (searchFilters.organizer) {
      where.organizer = {
        name: { contains: searchFilters.organizer, mode: 'insensitive' }
      };
    }

    if (searchFilters.hasFood !== undefined) {
      where.foodProvided = searchFilters.hasFood;
    }

    if (searchFilters.hasDrinks !== undefined) {
      where.drinksProvided = searchFilters.hasDrinks;
    }

    if (searchFilters.isVirtual !== undefined) {
      where.isVirtual = searchFilters.isVirtual;
    }

    if (searchFilters.maxFee !== undefined) {
      where.eventFee = { lte: searchFilters.maxFee };
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
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
        orderBy: { date: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.event.count({ where })
    ]);

    return {
      events: events.map(event => ({
        ...event,
        organizer: event.organizer.name,
        currentAttendees: event.attendees.filter(a => a.status === AttendeeStatus.APPROVED).length,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getEventRecommendations(userId: string, limit: number = 5) {
    // Get user's past event registrations and preferences
    const userRegistrations = await this.prisma.eventAttendee.findMany({
      where: { applicantId: userId },
      include: {
        event: {
          select: {
            type: true,
            tags: true,
            location: true
          }
        }
      }
    });

    // Extract user preferences
    const preferredTypes = userRegistrations.map(r => r.event.type);
    const preferredTags = userRegistrations.flatMap(r => r.event.tags);
    const preferredLocations = userRegistrations.map(r => r.event.location);

    // Find upcoming events that match preferences
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        date: { gt: new Date() },
        status: 'PUBLISHED',
        id: { notIn: userRegistrations.map(r => r.eventId) }
      },
      include: {
        organizer: {
          select: {
            name: true,
            avatar: true
          }
        },
        attendees: {
          where: {
            status: AttendeeStatus.APPROVED
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Score events based on user preferences
    const scoredEvents = upcomingEvents.map(event => {
      let score = 0;
      
      // Type preference
      if (preferredTypes.includes(event.type)) {
        score += 3;
      }
      
      // Tag preference
      const matchingTags = event.tags.filter(tag => preferredTags.includes(tag));
      score += matchingTags.length;
      
      // Location preference
      if (preferredLocations.includes(event.location)) {
        score += 2;
      }
      
      // Recency bonus
      const daysUntilEvent = event.date ? Math.ceil((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
      if (daysUntilEvent <= 7) {
        score += 2;
      } else if (daysUntilEvent <= 30) {
        score += 1;
      }

      return { ...event, score };
    });

    // Return top scored events
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(event => ({
        ...event,
        organizer: event.organizer.name,
        currentAttendees: event.attendees.length,
        score: undefined // Remove score from response
      }));
  }

  async checkOutAttendee(eventId: string, attendeeId: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can check out attendees');
    }

    const attendee = await this.prisma.eventAttendee.findFirst({
      where: {
        eventId,
        applicantId: attendeeId,
        checkedIn: true
      }
    });

    if (!attendee) {
      throw new NotFoundException('Attendee not found or not checked in');
    }

    await this.prisma.eventAttendee.update({
      where: { id: attendee.id },
      data: {
        checkedIn: false,
        checkedInAt: null
      }
    });

    return { message: 'Attendee checked out successfully' };
  }

  async getAttendanceReport(eventId: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can view attendance reports');
    }

    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true
          }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });

    const statusCounts = attendees.reduce((acc, attendee) => {
      acc[attendee.status] = (acc[attendee.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const checkedInCount = attendees.filter(a => a.checkedIn).length;
    const attendanceRate = attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0;

    return {
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        maxAttendees: event.maxAttendees
      },
      summary: {
        totalRegistrations: attendees.length,
        approvedAttendees: statusCounts[AttendeeStatus.APPROVED] || 0,
        pendingAttendees: statusCounts[AttendeeStatus.PENDING] || 0,
        declinedAttendees: statusCounts[AttendeeStatus.DECLINED] || 0,
        waitlistAttendees: statusCounts[AttendeeStatus.WAITLIST] || 0,
        checkedInAttendees: checkedInCount,
        attendanceRate
      },
      attendees: attendees.map(attendee => ({
        id: attendee.applicant.id,
        name: attendee.applicant.name,
        email: attendee.applicant.email,
        role: attendee.applicant.role,
        company: attendee.applicant.company,
        status: attendee.status,
        registeredAt: attendee.registeredAt,
        approvedAt: attendee.approvedAt,
        checkedIn: attendee.checkedIn,
        checkedInAt: attendee.checkedInAt
      }))
    };
  }

  async sendEventNotifications(eventId: string, notificationData: {
    message: string;
    type: 'all' | 'approved' | 'pending' | 'waitlist';
    includeOrganizer?: boolean;
  }, organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can send notifications');
    }

    let attendeeIds: string[] = [];

    // Get attendees based on type
    switch (notificationData.type) {
      case 'all':
        const allAttendees = await this.prisma.eventAttendee.findMany({
          where: { eventId },
          select: { applicantId: true }
        });
        attendeeIds = allAttendees.map(a => a.applicantId);
        break;
      case 'approved':
        const approvedAttendees = await this.prisma.eventAttendee.findMany({
          where: { eventId, status: AttendeeStatus.APPROVED },
          select: { applicantId: true }
        });
        attendeeIds = approvedAttendees.map(a => a.applicantId);
        break;
      case 'pending':
        const pendingAttendees = await this.prisma.eventAttendee.findMany({
          where: { eventId, status: AttendeeStatus.PENDING },
          select: { applicantId: true }
        });
        attendeeIds = pendingAttendees.map(a => a.applicantId);
        break;
      case 'waitlist':
        const waitlistAttendees = await this.prisma.eventAttendee.findMany({
          where: { eventId, status: AttendeeStatus.WAITLIST },
          select: { applicantId: true }
        });
        attendeeIds = waitlistAttendees.map(a => a.applicantId);
        break;
    }

    // Add organizer if requested
    if (notificationData.includeOrganizer) {
      attendeeIds.push(event.organizer.id);
    }

    // Create notifications
    const notifications = attendeeIds.map(userId => ({
      type: 'EVENT_NOTIFICATION' as const,
      userId,
      title: `Event Update: ${event.title}`,
      message: notificationData.message,
      targetId: eventId,
      targetType: 'EVENT',
      priority: 'MEDIUM' as const
    }));

    await this.prisma.notification.createMany({
      data: notifications
    });

    return {
      message: `Notifications sent to ${notifications.length} recipients`,
      sentCount: notifications.length,
      eventTitle: event.title
    };
  }

  async exportAttendees(eventId: string, format: 'csv' | 'json', organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenException('Only event organizers can export attendee lists');
    }

    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true
          }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });

    const exportData = attendees.map(attendee => ({
      name: attendee.applicant.name,
      email: attendee.applicant.email,
      role: attendee.applicant.role,
      company: attendee.applicant.company || '',
      status: attendee.status,
      registeredAt: attendee.registeredAt,
      approvedAt: attendee.approvedAt,
      checkedIn: attendee.checkedIn ? 'Yes' : 'No',
      checkedInAt: attendee.checkedInAt,
      dietaryRestrictions: attendee.dietaryRestrictions?.join(', ') || '',
      emergencyContact: attendee.emergencyContact || '',
      notes: attendee.notes || ''
    }));

    if (format === 'json') {
      return {
        format: 'json',
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location
        },
        attendees: exportData,
        totalCount: exportData.length,
        exportedAt: new Date().toISOString()
      };
    } else {
      // CSV format
      const csvHeaders = [
        'Name',
        'Email',
        'Role',
        'Company',
        'Status',
        'Registered At',
        'Approved At',
        'Checked In',
        'Checked In At',
        'Dietary Restrictions',
        'Emergency Contact',
        'Notes'
      ];

      const csvRows = exportData.map(attendee => [
        attendee.name,
        attendee.email,
        attendee.role,
        attendee.company,
        attendee.status,
        attendee.registeredAt,
        attendee.approvedAt,
        attendee.checkedIn,
        attendee.checkedInAt,
        attendee.dietaryRestrictions,
        attendee.emergencyContact,
        attendee.notes
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return {
        format: 'csv',
        content: csvContent,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location
        },
        totalCount: exportData.length,
        exportedAt: new Date().toISOString()
      };
    }
  }

  private generateFoodRecommendations(dietaryRestrictions: any[]) {
    const restrictions = dietaryRestrictions.flatMap(r => r.restrictions);
    const uniqueRestrictions = [...new Set(restrictions)];

    const recommendations = {
      vegetarian: uniqueRestrictions.includes('vegetarian'),
      vegan: uniqueRestrictions.includes('vegan'),
      glutenFree: uniqueRestrictions.includes('gluten-free'),
      dairyFree: uniqueRestrictions.includes('dairy-free'),
      nutFree: uniqueRestrictions.includes('nut-free'),
      halal: uniqueRestrictions.includes('halal'),
      kosher: uniqueRestrictions.includes('kosher')
    };

    return {
      restrictions: uniqueRestrictions,
      recommendations,
      suggestedItems: this.getSuggestedFoodItems(recommendations)
    };
  }

  private generateDrinkRecommendations(dietaryRestrictions: any[]) {
    const restrictions = dietaryRestrictions.flatMap(r => r.restrictions);
    const uniqueRestrictions = [...new Set(restrictions)];

    const recommendations = {
      nonAlcoholic: true, // Always provide non-alcoholic options
      sugarFree: uniqueRestrictions.includes('diabetic'),
      caffeineFree: uniqueRestrictions.includes('caffeine-free')
    };

    return {
      restrictions: uniqueRestrictions,
      recommendations,
      suggestedItems: this.getSuggestedDrinkItems(recommendations)
    };
  }

  private getSuggestedFoodItems(recommendations: any) {
    const items = [];
    
    if (recommendations.vegetarian) {
      items.push('Vegetarian pasta', 'Grilled vegetables', 'Quinoa salad');
    }
    if (recommendations.vegan) {
      items.push('Vegan wraps', 'Fruit platter', 'Hummus and pita');
    }
    if (recommendations.glutenFree) {
      items.push('Gluten-free crackers', 'Rice dishes', 'Fresh fruit');
    }
    
    return items.length > 0 ? items : ['Mixed sandwiches', 'Fresh fruit', 'Assorted snacks'];
  }

  private getSuggestedDrinkItems(recommendations: any) {
    const items = ['Water', 'Sparkling water'];
    
    if (recommendations.nonAlcoholic) {
      items.push('Soft drinks', 'Juice', 'Coffee', 'Tea');
    }
    if (recommendations.sugarFree) {
      items.push('Diet sodas', 'Sugar-free juice');
    }
    if (recommendations.caffeineFree) {
      items.push('Herbal tea', 'Decaf coffee');
    }
    
    return items;
  }
} 