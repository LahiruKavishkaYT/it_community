# Users & Profiles Module

This module handles user profile management, allowing users to view and update their profiles, as well as browse other users' public profiles.

## Features

- Get authenticated user's profile
- Update authenticated user's profile
- View public user profiles by ID
- Password exclusion from all responses
- Input validation for profile updates

## API Endpoints

### Protected Endpoints (Require Authentication)

#### GET /profile/me
Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer passionate about web technologies",
    "skills": ["JavaScript", "React", "Node.js"],
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /profile/me
Update the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body (all fields optional):**
```json
{
  "name": "John Smith",
  "bio": "Updated bio text",
  "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
  "company": "New Company Inc",
  "location": "New York, NY",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "STUDENT",
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "Updated bio text",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "company": "New Company Inc",
    "location": "New York, NY",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

### Public Endpoints

#### GET /users/:id
Get any user's public profile by their ID.

**Parameters:**
- `id` (UUID): The user's unique identifier

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "PROFESSIONAL",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Senior software engineer with 5+ years experience",
    "skills": ["Python", "Django", "PostgreSQL"],
    "company": "Big Tech Corp",
    "location": "Seattle, WA",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID format
- `404 Not Found`: User not found

## Data Transfer Objects (DTOs)

### UpdateProfileDto

All fields are optional and validated:

```typescript
{
  name?: string;        // Min 2, Max 100 characters
  bio?: string;         // Max 500 characters
  skills?: string[];    // Array of strings
  company?: string;     // Max 100 characters
  location?: string;    // Max 100 characters
  avatar?: string;      // Valid URL format
}
```

## Validation Rules

- **name**: 2-100 characters
- **bio**: Maximum 500 characters
- **skills**: Array of strings
- **company**: Maximum 100 characters
- **location**: Maximum 100 characters
- **avatar**: Must be a valid URL

## Security Features

- **Password Exclusion**: All user objects returned exclude the password hash
- **JWT Authentication**: Profile modification requires valid JWT token
- **Input Validation**: All inputs are validated using class-validator
- **UUID Validation**: User ID parameters are validated as proper UUIDs

## Service Methods

The `UsersService` provides the following methods:

```typescript
// Find user by email (includes password - for auth only)
findByEmail(email: string): Promise<User | null>

// Find user by ID (excludes password)
findById(id: string): Promise<Omit<User, 'password'> | null>

// Alias for findById
findOne(id: string): Promise<Omit<User, 'password'> | null>

// Create new user
create(userData: CreateUserData): Promise<User>

// Update user profile (excludes password from response)
updateProfile(id: string, updateData: UpdateProfileDto): Promise<Omit<User, 'password'>>
```

## Usage Examples

### Frontend Integration

```javascript
// Get current user profile
const response = await fetch('/profile/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const { user } = await response.json();

// Update user profile
const updateResponse = await fetch('/profile/me', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Updated bio',
    skills: ['React', 'TypeScript', 'Node.js']
  })
});
const { user: updatedUser } = await updateResponse.json();

// Get another user's profile
const publicProfile = await fetch(`/users/${userId}`);
const { user: publicUser } = await publicProfile.json();
```

### Using in Other Controllers

```typescript
import { UsersService } from '../users/users.service';

@Controller('projects')
export class ProjectsController {
  constructor(private usersService: UsersService) {}
  
  @Get(':id')
  async getProject(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    const author = await this.usersService.findOne(project.authorId);
    
    return {
      project: {
        ...project,
        author
      }
    };
  }
}
``` 