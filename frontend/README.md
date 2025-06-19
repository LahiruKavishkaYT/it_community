# IT Community Backend

A NestJS backend API for the IT Community platform that connects students, professionals, and companies in the tech industry.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer

## Architecture

This is a modular monolith with a layered architecture:
- **Controller Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic
- **Data Layer**: Prisma Client for database operations

## Features

- **Role-Based Access Control (RBAC)**: Support for `student`, `professional`, `company`, and `admin` roles
- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Clean and intuitive API endpoints
- **Data Validation**: Comprehensive input validation and sanitization
- **Relationship Management**: Complex many-to-many and one-to-many relationships

## Database Schema

The database includes the following entities:

### Core Models
- **User**: Platform users with role-based permissions
- **Project**: Student/professional project showcases
- **ProjectFeedback**: Reviews and ratings for projects
- **Event**: Community events (workshops, networking, hackathons, seminars)
- **Job**: Job postings from companies
- **CareerPath**: Guided learning paths with roadmaps

### Relationships
- Users can create multiple projects
- Users can provide feedback on projects
- Users can organize and attend events
- Companies can post jobs and receive applications
- Career paths contain structured roadmap items

## Environment Setup

1. **PostgreSQL Database**: Ensure PostgreSQL is running on your system
2. **Environment Variables**: Configure the following in your `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/it_community_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd it-community-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Create the database
createdb it_community_db

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

4. **Start the development server**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Database Commands

```bash
# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio

# Seed database (when seed script is created)
npx prisma db seed
```

## API Documentation

Once the server is running, you can access:
- **API Base URL**: `http://localhost:3000`
- **Swagger Documentation** (when implemented): `http://localhost:3000/api/docs`

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication module
│   ├── users/        # User management
│   ├── projects/     # Project management
│   ├── events/       # Event management
│   ├── jobs/         # Job board
│   └── career-paths/ # Career guidance
├── common/           # Shared utilities
│   ├── guards/       # Auth guards
│   ├── decorators/   # Custom decorators
│   └── dto/          # Data transfer objects
├── prisma/           # Prisma service
└── config/           # Configuration files
```

## Development

### Code Style
- Follow NestJS conventions
- Use TypeScript strict mode
- Implement proper error handling
- Write comprehensive tests

### Git Workflow
1. Create feature branches from `main`
2. Make commits with descriptive messages
3. Submit pull requests for review
4. Ensure all tests pass before merging

## Production Deployment

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure production database

2. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Build and Start**
   ```bash
   npm run build
   npm run start:prod
   ```

## Security Considerations

- JWT tokens expire after 7 days (configurable)
- Password hashing using bcrypt
- Input validation on all endpoints
- Role-based access control
- CORS configuration for production

## Support

For questions and support, please refer to the project documentation or create an issue in the repository.

## License

This project is licensed under the MIT License. 