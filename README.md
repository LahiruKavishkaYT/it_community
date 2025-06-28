# 🚀 IT Community Platform

> **A comprehensive SaaS platform connecting students, professionals, and companies in the tech ecosystem**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 🌟 Platform Overview

IT Community Platform is a full-stack SaaS solution designed to bridge the gap between students, professionals, and companies in the technology sector. Our platform facilitates career growth, knowledge sharing, and meaningful connections within the IT community.

### 🎯 Core Features

- **🎓 Student Portfolio Showcase** - Students can display their projects and receive feedback
- **💼 Advanced Job Portal** - Companies post jobs, students/professionals apply with smart matching
- **📅 Event Management** - Organize workshops, hackathons, networking events, and seminars
- **🔄 Career Development** - Guided learning paths and skill roadmaps
- **🤝 Community Networking** - Connect like-minded professionals and students
- **📊 Analytics Dashboard** - Comprehensive insights for all user types

## 🏗️ Technical Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Architecture**: Modular monolith with RBAC
- **API**: RESTful endpoints with validation

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for modern UI
- **Routing**: React Router DOM
- **State**: Context API for state management

### Database Schema
```
Users (Students, Professionals, Companies, Admins)
├── Projects (Portfolio showcase)
├── Jobs (Job postings and applications)
├── Events (Community events)
├── Activities (User activity tracking)
└── Feedback (Project reviews and ratings)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL 13+
- Git

### 1. Clone & Setup
```bash
git clone <repository-url>
cd it-community-platform
npm run setup
```

### 2. Environment Configuration

Create `.env` files:

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/it_community_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME="IT Community Platform"
```

### 3. Database Setup
```bash
# Create database
createdb it_community_db

# Run migrations
npm run backend:db:migrate

# Generate Prisma client
npm run backend:db:generate
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run start:dev

# Or start individually
npm run backend:dev    # Backend on :3000
npm run frontend:dev   # Frontend on :5173
```

## 📁 Project Structure

```
it-community-platform/
├── backend/                 # NestJS backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── modules/        # Feature modules
│   │   │   ├── users/      # User management
│   │   │   ├── projects/   # Project showcase
│   │   │   ├── jobs/       # Job portal
│   │   │   ├── events/     # Event management
│   │   │   └── activities/ # Activity tracking
│   │   └── prisma/         # Database service
│   └── prisma/             # Database schema & migrations
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application pages
    │   ├── contexts/       # React contexts
    │   ├── services/       # API services
    │   └── types/          # TypeScript definitions
    └── public/             # Static assets
```

## 🔐 User Roles & Permissions

### Students 🎓
- Create and showcase projects
- Apply for jobs and internships
- Register for events and workshops
- Receive feedback on projects
- Follow career development paths

### Professionals 👨‍💼
- Share advanced projects and case studies
- Mentor students through feedback
- Network at professional events
- Access exclusive job opportunities

### Companies 🏢
- Post job openings and internships
- Access talent pool and applications
- Organize recruitment events
- Sponsor community events
- View analytics on job performance

### Administrators 🛠️
- Manage platform users and content
- Moderate events and job postings
- Access comprehensive analytics
- Manage system configurations

## 💰 Revenue Streams

1. **Job Posting Fees** - Companies pay to post job listings
2. **Premium Features** - Featured job posts, urgent hiring badges
3. **Event Sponsorships** - Companies sponsor community events
4. **Premium Memberships** - Enhanced features for power users
5. **Training Partnerships** - Revenue share with educational providers

## 🛠️ Development Commands

```bash
# Setup and Installation
npm run install:all         # Install all dependencies
npm run setup               # Complete project setup

# Development
npm run start:dev           # Start both services
npm run backend:dev         # Backend only
npm run frontend:dev        # Frontend only

# Database
npm run backend:db:migrate  # Run database migrations
npm run backend:db:generate # Generate Prisma client
npm run backend:db:studio   # Open Prisma Studio

# Building
npm run build:all           # Build both services
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test                # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Coverage report

# Frontend tests
cd frontend
npm run test               # Component tests
```

## 🚀 Deployment

### Production Environment Variables

**Backend**:
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
PORT=3000
```

**Frontend**:
```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME="IT Community Platform"
```

### Build Commands
```bash
npm run build:all          # Build both services
```

## 📊 Key Metrics & KPIs

- **User Growth**: Monthly active users by role
- **Job Portal**: Application-to-hire conversion rate
- **Events**: Attendance rates and satisfaction scores
- **Projects**: Engagement and feedback quality
- **Revenue**: MRR, LTV, and churn rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord server
- **Email**: support@itcommunity.com

---

**Built with ❤️ for the IT Community** 