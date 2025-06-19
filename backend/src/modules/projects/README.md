# Projects Module

This module handles all project-related operations for the ITCommunity platform.

## Endpoints

### Public Endpoints (No Authentication Required)

- `GET /projects` - List all projects with author and feedback details
- `GET /projects/:id` - Get a specific project by ID

### Protected Endpoints (Requires JWT + Student/Professional Role)

- `POST /projects` - Create a new project
- `PATCH /projects/:id` - Update a project (ownership required)
- `DELETE /projects/:id` - Delete a project (ownership required)

## DTOs

### CreateProjectDto
- `title` (required): string
- `description` (required): string
- `technologies` (required): string[]
- `githubUrl` (optional): string (URL)
- `liveUrl` (optional): string (URL)
- `imageUrl` (optional): string (URL)

### UpdateProjectDto
All fields are optional but maintain the same validation rules as CreateProjectDto.

## Security

- JWT authentication is required for create, update, and delete operations
- Only users with 'STUDENT' or 'PROFESSIONAL' roles can perform these operations
- Ownership checks ensure users can only modify their own projects
- Public read access for listing and viewing projects

## Business Logic

- Projects are automatically associated with the authenticated user as the author
- Update and delete operations verify ownership before proceeding
- Projects include related author information and feedback
- Results are ordered by creation date (newest first) 