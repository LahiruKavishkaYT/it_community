export type UserRole = 'STUDENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN';

export type ProjectType = 'STUDENT_PROJECT' | 'PRACTICE_PROJECT';

export type EventType = 'WORKSHOP' | 'NETWORKING' | 'HACKATHON' | 'SEMINAR';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export type AttendeeStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'WAITLIST';

// Enhanced Job Portal Types
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ExperienceLevel = 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'LEAD_LEVEL' | 'EXECUTIVE';

export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

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

export interface FoodAndDrinks {
  foodProvided: boolean;
  drinksProvided: boolean;
  foodDetails?: string;
  drinkDetails?: string;
  dietaryRestrictions?: string[];
  alcoholicBeverages?: boolean;
}

export interface RegistrationSettings {
  requireApproval?: boolean;
  registrationDeadline?: string;
  registrationInstructions?: string;
  requiredFields?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  date: string;
  location: string;
  type: EventType;
  status?: EventStatus;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
  
  // Enhanced food and drinks coordination
  foodProvided?: boolean;
  drinksProvided?: boolean;
  foodDetails?: string;
  drinkDetails?: string;
  dietaryRestrictions?: string[];
  alcoholicBeverages?: boolean;
  
  // Registration settings
  requireApproval?: boolean;
  registrationDeadline?: string;
  registrationInstructions?: string;
  requiredFields?: string[];
  
  // Additional event details
  tags?: string[];
  prerequisites?: string[];
  agenda?: string;
  speakers?: string[];
  eventFee?: number;
  eventUrl?: string;
  isVirtual?: boolean;
  virtualMeetingLink?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface EventAttendee {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  company?: string;
  status: AttendeeStatus;
  registeredAt: string;
  approvedAt?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  dietaryRestrictions?: string[];
  emergencyContact?: string;
  notes?: string;
}

export interface EventRegistration {
  eventId: string;
  event: Event;
  registrationStatus: AttendeeStatus;
  registeredAt: string;
  checkedIn: boolean;
}

export interface EventDashboard {
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    type: EventType;
    maxAttendees?: number;
    currentAttendees: number;
  };
  attendeeStats: {
    total: number;
    approved: number;
    pending: number;
    declined: number;
    waitlist: number;
    checkedIn: number;
  };
  foodAndDrinks: FoodAndDrinksReport;
  recentRegistrations: EventAttendee[];
}

export interface FoodAndDrinksReport {
  eventTitle: string;
  totalAttendees: number;
  foodProvided: boolean;
  drinksProvided: boolean;
  foodDetails?: string;
  drinkDetails?: string;
  alcoholicBeverages: boolean;
  dietaryRestrictions: Record<string, number>;
  attendeesWithRestrictions: Array<{
    dietaryRestrictions: string[];
    applicant: { name: string };
  }>;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  maxAttendees?: number;
  imageUrl?: string;
  
  // Food and drinks
  foodAndDrinks?: FoodAndDrinks;
  
  // Registration settings
  registrationSettings?: RegistrationSettings;
  
  // Additional details
  tags?: string[];
  prerequisites?: string[];
  agenda?: string;
  speakers?: string[];
  eventFee?: number;
  eventUrl?: string;
  isVirtual?: boolean;
  virtualMeetingLink?: string;
}

export interface EventRegistrationData {
  dietaryRestrictions?: string[];
  emergencyContact?: string;
  notes?: string;
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

// Enhanced Job Interface
export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  description: string;
  requirements: string[];
  location: string;
  type: JobType;
  status?: JobStatus;
  experienceLevel?: ExperienceLevel;
  
  // Salary and compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  equity?: boolean;
  benefits?: string[];
  
  // Work arrangements
  remote?: boolean;
  hybrid?: boolean;
  onSite?: boolean;
  
  // Skills and matching
  requiredSkills?: string[];
  preferredSkills?: string[];
  technologies?: string[];
  
  // Job details
  department?: string;
  reportingTo?: string;
  teamSize?: string;
  jobFunction?: string;
  
  // Application process
  applicationDeadline?: string;
  expectedStartDate?: string;
  interviewProcess?: string;
  
  // SEO and visibility
  tags?: string[];
  featured?: boolean;
  urgent?: boolean;
  
  // Analytics
  views?: number;
  impressions?: number;
  applicationsCount?: number;
  bookmarksCount?: number;
  
  // User-specific fields
  isBookmarked?: boolean;
  matchScore?: number;
  
  postedAt: string;
  updatedAt?: string;
  closedAt?: string;
  
  // Legacy field for backward compatibility
  salary?: string;
}

// Job Application Interface
export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: ApplicationStatus;
  
  // Application content
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
  availability?: string;
  relocatable?: boolean;
  
  // Process tracking
  appliedAt: string;
  reviewedAt?: string;
  shortlistedAt?: string;
  interviewedAt?: string;
  offeredAt?: string;
  respondedAt?: string;
  
  // Feedback and notes
  recruiterNotes?: string;
  rejectionReason?: string;
  rating?: number;
  
  // Skills matching score
  skillsMatchScore?: number;
  
  // Relations
  job?: Job;
  applicant?: User;
}

// Job Bookmark Interface
export interface JobBookmark {
  id: string;
  jobId: string;
  userId: string;
  createdAt: string;
  job?: Job;
}

// Job Analytics Interface
export interface JobAnalytics {
  totalApplications: number;
  totalBookmarks: number;
  views: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  averageSkillsMatch: number;
  dailyApplications: Array<{
    appliedAt: string;
    _count: { id: number };
  }>;
  conversionRate: string;
}

// Job Filter Interface
export interface JobFilters {
  type?: JobType;
  remote?: boolean;
  experienceLevel?: ExperienceLevel;
  location?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  featured?: boolean;
  search?: string;
}

// Create Job Application DTO
export interface CreateJobData {
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: JobType;
  status?: JobStatus;
  experienceLevel?: ExperienceLevel;
  
  // Salary and compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  equity?: boolean;
  benefits?: string[];
  
  // Work arrangements
  remote?: boolean;
  hybrid?: boolean;
  onSite?: boolean;
  
  // Skills and matching
  requiredSkills?: string[];
  preferredSkills?: string[];
  technologies?: string[];
  
  // Job details
  department?: string;
  reportingTo?: string;
  teamSize?: string;
  jobFunction?: string;
  
  // Application process
  applicationDeadline?: string;
  expectedStartDate?: string;
  interviewProcess?: string;
  
  // SEO and visibility
  tags?: string[];
  featured?: boolean;
  urgent?: boolean;
  
  // Legacy field for backward compatibility
  salary?: string;
}

export interface CreateJobApplicationData {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
  availability?: string;
  relocatable?: boolean;
}

// Update Application Status DTO
export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
  recruiterNotes?: string;
  rejectionReason?: string;
  rating?: number;
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