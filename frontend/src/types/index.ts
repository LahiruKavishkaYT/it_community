export type UserRole = 'STUDENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN';

export type ProjectType = 'STUDENT_PROJECT' | 'PRACTICE_PROJECT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills?: string[];
  company?: string;
  location?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  projectType: ProjectType;
  author: string;
  authorId: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  architecture?: string;
  learningObjectives?: string[];
  keyFeatures?: string[];
  createdAt: string;
  feedback: ProjectFeedback[];
}

export interface ProjectFeedback {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  date: string;
  location: string;
  type: 'workshop' | 'networking' | 'hackathon' | 'seminar';
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  salary?: string;
  remote: boolean;
  postedAt: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  skills: string[];
  roles: string[];
  roadmap: RoadmapItem[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  resources: string[];
}

export type ActivityType = 'PROJECT_UPLOAD' | 'JOB_APPLICATION' | 'EVENT_REGISTRATION' | 'PROJECT_FEEDBACK';

export interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  itemTitle: string;
  itemId?: string;
  createdAt: string;
}

export interface UserStats {
  projectsOrJobs: number;
  applicationsOrReceived: number;
  eventsOrOrganized: number;
  feedbackOrTalent: number;
  additionalStat?: number;
}

export interface EventStats {
  eventsThisMonth: number;
  totalAttendees: number;
  uniqueOrganizers: number;
  averageRating: number;
}

export interface UserActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
}

export interface ProfileCompletion {
  completionPercentage: number;
  totalFields: number;
  completedFields: number;
  missingFields: string[];
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export interface Experience {
  title: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface Education {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  profileSearchable: boolean;
  isProfilePublic: boolean;
}