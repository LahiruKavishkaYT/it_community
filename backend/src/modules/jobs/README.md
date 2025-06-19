# Jobs Module

This module manages job postings and applications within the ITCommunity platform.

## Features

- **Job Management**: Companies can create, read, update, and delete job postings
- **Job Applications**: Students and professionals can apply for jobs
- **Role-Based Access Control**: Different permissions for different user roles
- **Ownership Validation**: Only job creators can modify their postings

## API Endpoints

### Public Endpoints

- `GET /jobs` - Retrieve all job postings
- `GET /jobs/:id` - Retrieve a specific job posting by ID

### Protected Endpoints (Company Role Required)

- `POST /jobs` - Create a new job posting
- `PATCH /jobs/:id` - Update an existing job posting (ownership required)
- `DELETE /jobs/:id` - Delete a job posting (ownership required)

### Protected Endpoints (Student/Professional Role Required)

- `POST /jobs/:id/apply` - Apply for a specific job

## Data Models

### CreateJobDto

```typescript
{
  title: string;           // Required
  description: string;     // Required
  requirements: string[];  // Required array of job requirements
  location: string;        // Required
  type: JobType;          // FULL_TIME | PART_TIME | INTERNSHIP | CONTRACT
  salary?: string;        // Optional
  remote?: boolean;       // Optional, defaults to false
}
```

### JobApplication

The system maintains a many-to-many relationship between jobs and users through job applications, preventing duplicate applications and tracking application timestamps.

## Security

- JWT authentication required for all write operations
- Role-based access control restricts job management to companies
- Ownership validation ensures users can only modify their own content
- Duplicate application prevention 