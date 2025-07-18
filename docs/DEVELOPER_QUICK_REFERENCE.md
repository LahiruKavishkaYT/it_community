# IT Community Platform - Developer Quick Reference

## 🚀 Quick Start Commands

### Setup & Installation
```bash
# Clone repository
git clone <repository-url>
cd it-community-platform

# Install all dependencies
npm run setup

# Setup database
cd backend
npx prisma generate
npx prisma db push
node scripts/seed-users.js
```

### Development Servers
```bash
# Backend (Terminal 1)
cd backend && npm run start:dev           # Port 3001

# Frontend (Terminal 2) 
cd frontend && npm run dev                # Port 5173

# Admin Dashboard (Terminal 3)
cd admin-dashboard && npm run dev         # Port 5174
```

## 🔐 Default Test Credentials

### Admin Access
- **Email**: `admin@itcommunity.com`
- **Password**: `admin123`

### Test Users (created by seed script)
- **Student**: `student@example.com` / `password123`
- **Professional**: `professional@example.com` / `password123`
- **Company**: `company@example.com` / `password123`

## 📱 Application URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Community Frontend** | http://localhost:5173 | Main user interface |
| **Admin Dashboard** | http://localhost:5174 | Administrative panel |
| **Backend API** | http://localhost:3001 | REST API endpoints |
| **API Documentation** | http://localhost:3001/api/docs | Swagger UI |
| **Database Studio** | `npx prisma studio` | Database management |

## 🏗️ Project Structure

```
it-community-platform/
├── backend/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication & OAuth
│   │   ├── users/              # User management
│   │   ├── modules/            # Feature modules
│   │   │   ├── projects/       # Project showcase
│   │   │   ├── events/         # Event management
│   │   │   ├── jobs/           # Job portal
│   │   │   └── activities/     # Activity tracking
│   │   ├── common/             # Shared utilities
│   │   └── prisma/             # Database schema
│   ├── prisma/                 # Database configuration
│   └── scripts/                # Utility scripts
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Route components
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   └── types/              # TypeScript types
├── admin-dashboard/            # React Admin Panel
│   └── src/                    # Admin-specific components
├── docs/                       # Project documentation
└── README.md                   # Project overview
```

## 🔌 API Endpoints

### Authentication
```
POST /auth/register             # User registration
POST /auth/login                # User login
GET  /auth/profile              # Current user
GET  /auth/google               # Google OAuth
GET  /auth/github               # GitHub OAuth
```

### Projects
```
GET    /projects                # List projects
POST   /projects                # Create project
GET    /projects/:id            # Get project
PATCH  /projects/:id            # Update project
POST   /projects/:id/feedback   # Add feedback
```

### Events
```
GET    /events                  # List events
POST   /events                  # Create event
POST   /events/:id/register     # Register for event
```

### Jobs
```
GET    /jobs                    # List jobs
POST   /jobs                    # Create job posting
POST   /jobs/:id/apply          # Apply for job
```

### Admin
```
GET    /admin/dashboard/overview # Dashboard data
GET    /admin/users             # User management
POST   /admin/projects/:id/approve # Approve project
```

## 🗄️ Database Quick Reference

### Key Models
```typescript
User {
  id, email, password, name, role
  googleId?, githubId?, provider?
  avatar?, bio?, skills[], company?, location?
}

Project {
  id, title, description, authorId
  technologies[], githubUrl?, liveUrl?
  status: DRAFT | PENDING_APPROVAL | PUBLISHED | REJECTED
}

Event {
  id, title, description, organizerId
  startDateTime, endDateTime?, locationType
  venue?, virtualEventLink?
}

Job {
  id, title, company, companyId
  description, requirements[], location
  type: FULL_TIME | PART_TIME | INTERNSHIP | CONTRACT
}
```

### User Roles
- **STUDENT**: Create projects, apply for jobs, attend events
- **PROFESSIONAL**: Create all content, organize events
- **COMPANY**: Post jobs, organize recruitment events
- **ADMIN**: Full platform management

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/it_community_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# URLs
FRONTEND_URL="http://localhost:5173"
ADMIN_DASHBOARD_URL="http://localhost:5174"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="IT Community Platform"
```

## 🛠️ Common Development Tasks

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open database studio
npx prisma studio
```

### Code Quality
```bash
# TypeScript compilation
npm run build

# Linting
npm run lint

# Tests
npm run test
npm run test:e2e
npm run test:cov
```

### OAuth Setup
```bash
# 1. Get OAuth credentials from providers
# 2. Add to backend .env file
# 3. Update OAuth app callback URLs:
#    Google: http://localhost:3001/auth/google/callback
#    GitHub: http://localhost:3001/auth/github/callback
# 4. Test OAuth flow in frontend
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### API Testing with curl
```bash
# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get projects (with auth)
curl -X GET http://localhost:3001/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check database exists
psql -U postgres -l
```

#### CORS Errors
- Verify FRONTEND_URL in backend .env
- Check VITE_API_URL in frontend .env
- Restart backend after env changes

#### OAuth Issues
- Verify OAuth credentials in .env
- Check callback URLs match provider settings
- Ensure HTTPS in production

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3001
netstat -tulpn | grep :3001

# Kill process using port
sudo kill -9 PID
```

## 📊 Monitoring & Debugging

### Logs
```bash
# Backend logs
cd backend && npm run start:dev

# Database logs
tail -f /var/log/postgresql/postgresql-*.log

# Application logs
# Check browser console for frontend errors
# Check terminal output for backend errors
```

### Performance
```bash
# Database query analysis
# Use Prisma Studio to inspect queries

# Frontend performance
# Use React DevTools Profiler
# Check Network tab in browser DevTools
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# Admin Dashboard
cd admin-dashboard && npm run build
```

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 Documentation Links

- 📖 [Complete Documentation](../PROJECT_DOCUMENTATION.md)
- 🔐 [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)
- 🏗️ [Backend Architecture](./BACKEND_ARCHITECTURE_DESIGN.md)
- 👥 [Admin Dashboard](./ADMIN_DASHBOARD_BACKEND_SUMMARY.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## 🆘 Getting Help

1. **Check documentation** in `/docs` folder
2. **Review API docs** at http://localhost:3001/api/docs
3. **Check GitHub issues** for known problems
4. **Review error logs** in terminal/browser console
5. **Test with Swagger UI** for API issues

---

*Happy coding! 🚀*
