# Events Module

This module handles all event-related operations for the ITCommunity platform, including event management and user registration.

## Endpoints

### Public Endpoints (No Authentication Required)

- `GET /events` - List all events with organizer details (sorted by date)
- `GET /events/:id` - Get a specific event by ID

### Protected Endpoints (Requires JWT + Professional/Company Role)

- `POST /events` - Create a new event
- `PATCH /events/:id` - Update an event (ownership required)
- `DELETE /events/:id` - Delete an event (ownership required)

### User Registration Endpoints (Requires JWT only)

- `POST /events/:id/register` - Register for an event
- `GET /events/:id/attendees` - View event attendees (organizers only)
- `GET /events/user/registrations` - Get user's registered events

## DTOs

### CreateEventDto
- `title` (required): string
- `description` (required): string
- `date` (required): string (ISO date string)
- `location` (required): string
- `type` (required): EventType enum (WORKSHOP, NETWORKING, HACKATHON, SEMINAR)
- `maxAttendees` (optional): number (minimum 1)
- `imageUrl` (optional): string (URL)

### UpdateEventDto
All fields are optional but maintain the same validation rules as CreateEventDto.

## Event Types

- `WORKSHOP` - Technical workshops and training sessions
- `NETWORKING` - Professional networking events
- `HACKATHON` - Coding competitions and hackathons
- `SEMINAR` - Educational seminars and presentations

## Security

- JWT authentication is required for create, update, delete, and registration operations
- Only users with 'PROFESSIONAL' or 'COMPANY' roles can create/modify events
- Any authenticated user can register for events
- Ownership checks ensure users can only modify events they organized
- Public read access for listing and viewing events

## Registration Logic

- Users cannot register for past events
- Users cannot register twice for the same event
- Event organizers cannot register for their own events
- Registration is blocked when maximum capacity is reached
- Current attendee count is automatically updated

## Business Logic

- Events are automatically associated with the authenticated user as the organizer
- Update and delete operations verify ownership before proceeding
- Events include related organizer information
- Results are ordered by date (upcoming events first)
- Attendee tracking is currently handled in-memory (should be moved to database in production)

## Important Notes

⚠️ **Attendee Storage**: Currently using in-memory storage for event attendees. In production, this should be implemented as a proper database table with a many-to-many relationship between Users and Events.

## Future Enhancements

- Persistent attendee storage in database
- Email notifications for event registration
- Event capacity management
- Waiting list functionality
- Event categories and filtering 