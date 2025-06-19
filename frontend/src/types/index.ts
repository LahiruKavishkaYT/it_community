export type UserRole = 'student' | 'professional' | 'company';

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
  author: string;
  authorId: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
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