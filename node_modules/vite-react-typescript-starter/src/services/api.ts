import { 
  Project, Event, Job, User, ProjectFeedback, UserRole, Activity, UserStats, EventStats, 
  UserActivity, ProfileCompletion, UserSettings, ProjectType, CreateEventData, EventRegistrationData, 
  EventAttendee, EventDashboard, FoodAndDrinksReport, AttendeeStatus, EventRegistration,
  JobFilters, JobAnalytics, JobApplication, JobBookmark, CreateJobData, CreateJobApplicationData, 
  UpdateApplicationStatusData, ApplicationStatus, Suggestion, CreateSuggestionData, SuggestionStatus, SuggestionStats, SuggestionComment
} from '../types';
import { mockProjects, mockEvents, mockJobs, mockDashboardData, mockFrontendLearningProjects, mockBackendLearningProjects, mockDevOpsLearningProjects } from '../data/mockData';

// Base URL for all API calls - configurable via environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Utility function to get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Utility function to check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Utility function to validate user role for job operations
const validateUserForJobOperations = (user: any): boolean => {
  if (!user) return false;
  return user.role === 'COMPANY' || user.role === 'PROFESSIONAL';
};

// Utility function to create headers with optional authentication
const createHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Authentication required but no token found');
    }
  }

  return headers;
};

// Generic error handling for API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use the text as error message
      errorMessage = errorText || errorMessage;
    }
    
    // Handle authentication errors
    if (response.status === 401) {
      // Clear invalid token only on 401 (unauthorized)
      localStorage.removeItem('token');
      errorMessage = 'Authentication required. Please log in again.';
      
      // Don't auto-redirect during debugging - let user handle it
      console.warn('401 Unauthorized - token cleared. Manual login required.');
    } else if (response.status === 403) {
      // Don't clear token on 403 (forbidden) - user is authenticated but lacks permissions
      errorMessage = 'You do not have permission to perform this action. Please check your account role.';
      
      // Log detailed error for debugging
      console.error('403 Forbidden error:', {
        message: errorMessage,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status
      });
    }
    
    throw new Error(errorMessage);
  }
  
  return await response.json();
};

// Generic fetch wrapper with error handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
      },
    });
    
    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
  };

// Project API functions
export const getProjects = async (): Promise<Project[]> => {
  try {
    return await apiRequest<Project[]>('/projects', {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, using mock data for projects');
    return mockProjects;
  }
};

export const getProjectsByType = async (type: ProjectType): Promise<Project[]> => {
  try {
    return await apiRequest<Project[]>(`/projects?type=${type}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, using mock data for projects by type');
    return mockProjects.filter(project => project.projectType === type);
  }
};

export const getProjectsForUserRole = async (): Promise<Project[]> => {
  return apiRequest<Project[]>('/projects/for-role', {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const getProjectsByCareerPath = async (careerPath: string): Promise<Project[]> => {
  try {
    // Map career path to relevant technologies for filtering
    const techMapping: Record<string, string[]> = {
      'frontend': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'TypeScript', 'Next.js', 'Tailwind'],
      'backend': ['Node.js', 'Python', 'Java', 'Express', 'Spring', 'Django', 'Flask', 'PHP', 'C#', 'Ruby'],
      'fullstack': ['React', 'Node.js', 'Next.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Express', 'Python'],
      'devops': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible'],
      'ai-engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'AI', 'Scikit-learn'],
      'data-scientist': ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Jupyter', 'Statistics', 'Data Analysis'],
      'android-developer': ['Kotlin', 'Java', 'Android', 'Android Studio', 'Material Design'],
      'ios-developer': ['Swift', 'iOS', 'Xcode', 'UIKit', 'SwiftUI'],
      'blockchain-developer': ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'Blockchain'],
      'cyber-security': ['Security', 'Penetration Testing', 'Cybersecurity', 'Vulnerability Assessment'],
      'ux-design': ['UI/UX', 'Figma', 'Adobe', 'Design', 'Prototyping', 'User Research'],
      'game-developer': ['Unity', 'Unreal', 'C#', 'C++', 'Game Development'],
      'qa-engineer': ['Testing', 'Selenium', 'Jest', 'Cypress', 'QA', 'Test Automation'],
      'software-architect': ['Architecture', 'System Design', 'Microservices', 'Scalability'],
      'technical-writer': ['Documentation', 'Technical Writing', 'API Documentation'],
      'mlops': ['MLOps', 'Machine Learning', 'Docker', 'Kubernetes', 'Model Deployment'],
      'engineering-manager': ['Leadership', 'Management', 'Team Lead', 'Project Management'],
      'product-manager': ['Product Management', 'Strategy', 'Analytics', 'Roadmap']
    };

    const relevantTechs = techMapping[careerPath] || [];
    
    // Fetch all projects first
    const allProjects = await apiRequest<Project[]>('/projects', {
      method: 'GET',
      headers: createHeaders(),
    });

    // Filter projects based on relevant technologies
    const filteredProjects = allProjects.filter(project => 
      project.technologies?.some(tech => 
        relevantTechs.some(relevantTech => 
          tech.toLowerCase().includes(relevantTech.toLowerCase()) ||
          relevantTech.toLowerCase().includes(tech.toLowerCase())
        )
      )
    );

    return filteredProjects;
  } catch (error) {
    console.warn('Backend not available, using empty array for career path projects');
    return [];
  }
};

export const getOrgLearningProjects = async (category?: string): Promise<Project[]> => {
  try {
    const endpoint = category ? `/projects/learning/org?category=${encodeURIComponent(category)}` : '/projects/learning/org';
    return await apiRequest<Project>(endpoint, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, using mock learning projects data');
    
    // Return mock learning projects based on category
    switch (category) {
      case 'frontend':
        return mockFrontendLearningProjects;
      case 'backend':
        return mockBackendLearningProjects;
      case 'devops':
        return mockDevOpsLearningProjects;
      default:
        // For other categories or no category, return a mix of learning projects
        return [
          ...mockFrontendLearningProjects.slice(0, 2),
          ...mockBackendLearningProjects.slice(0, 1),
          ...mockDevOpsLearningProjects.slice(0, 1),
        ];
    }
  }
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  try {
    return await apiRequest<Project>(`/projects/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    // If project not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const createProject = async (data: {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  architecture?: string;
  learningObjectives?: string[];
  keyFeatures?: string[];
}): Promise<Project> => {
  return apiRequest<Project>('/projects', {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(data),
  });
};

export const createLearningProject = async (data: {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  architecture?: string;
  learningObjectives?: string[];
  keyFeatures?: string[];
  projectCategory?: string;
  difficultyLevel?: string;
  estimatedTime?: string;
}): Promise<Project> => {
  return apiRequest<Project>('/projects', {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify({
      ...data,
      // Mark as learning project type
      isLearningProject: true
    }),
  });
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project | undefined> => {
  try {
    return await apiRequest<Project>(`/projects/${id}`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
  } catch (error) {
    // If project not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    await apiRequest<void>(`/projects/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return false;
    }
    throw error;
  }
};

// Project feedback functions
export const addProjectFeedback = async (projectId: string, data: {
  content: string;
  rating: number;
}): Promise<ProjectFeedback> => {
  return apiRequest<ProjectFeedback>(`/projects/${projectId}/feedback`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(data),
  });
};

export const getProjectFeedback = async (projectId: string): Promise<ProjectFeedback[]> => {
  return apiRequest<ProjectFeedback[]>(`/projects/${projectId}/feedback`, {
    method: 'GET',
    headers: createHeaders(),
  });
};

// New: Get user's received feedback (for students)
export const getUserFeedback = async (): Promise<{
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    createdAt: string;
    feedbackCount: number;
    averageRating: number;
    feedback: Array<{
      id: string;
      content: string;
      rating: number;
      authorId: string;
      authorName: string;
      authorRole: string;
      createdAt: string;
    }>;
  }>;
  statistics: {
    totalProjects: number;
    projectsWithFeedback: number;
    totalFeedback: number;
    overallAverageRating: number;
  };
}> => {
  return apiRequest(`/projects/my-feedback`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// Event API functions
export const getEvents = async (): Promise<Event[]> => {
  try {
    return await apiRequest<Event[]>('/events', {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, using mock data for events');
    return mockEvents;
  }
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  try {
    return await apiRequest<Event>(`/events/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    // If event not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
  return apiRequest<Event>('/events', {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(data),
  });
};

export const updateEvent = async (id: string, data: Partial<Event>): Promise<Event | undefined> => {
  try {
    return await apiRequest<Event>(`/events/${id}`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
  } catch (error) {
    // If event not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    await apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return false;
    }
    throw error;
  }
};

// Enhanced Job API functions
export const getJobs = async (filters?: JobFilters): Promise<Job[]> => {
  try {
    let url = '/jobs';
    const params = new URLSearchParams();

    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.remote !== undefined) params.append('remote', filters.remote.toString());
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      if (filters.location) params.append('location', filters.location);
      if (filters.skills && filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
      if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters.search) params.append('search', filters.search);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Include authentication if available to get application status
    const includeAuth = isAuthenticated();
    return await apiRequest<Job[]>(url, {
      method: 'GET',
      headers: createHeaders(includeAuth),
    });
  } catch (error) {
    console.warn('Backend not available, using mock data for jobs');
    return mockJobs;
  }
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  try {
    return await apiRequest<Job>(`/jobs/${id}`, {
      method: 'GET',
      headers: createHeaders(true),
    });
  } catch (error) {
    // If job not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const getRecommendedJobs = async (userId: string): Promise<Job[]> => {
  return apiRequest<Job[]>(`/jobs/recommended/${userId}`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const getJobAnalytics = async (jobId: string): Promise<JobAnalytics> => {
  return apiRequest<JobAnalytics>(`/jobs/${jobId}/analytics`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const createJob = async (data: CreateJobData): Promise<Job> => {
  if (!isAuthenticated()) {
    throw new Error('You must be logged in to create a job posting');
  }
  
  // Secure request handling without data exposure
  try {
    return await apiRequest<Job>('/jobs', {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating job:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const updateJob = async (id: string, data: Partial<Job>): Promise<Job | undefined> => {
  try {
    return await apiRequest<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
  } catch (error) {
    // If job not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const deleteJob = async (id: string): Promise<boolean> => {
  try {
    await apiRequest<void>(`/jobs/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return false;
    }
    throw error;
  }
};

// Resume Upload API function
export const uploadResume = async (file: File): Promise<{ message: string; resumeUrl: string; filename: string }> => {
  const formData = new FormData();
  formData.append('resume', file);

  const token = getAuthToken();
  
  const response = await fetch(`${BASE_URL}/jobs/upload-resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to upload resume');
  }

  return await response.json();
};

// Resume Download API function
export const downloadResume = (filename: string): string => {
  return `${BASE_URL}/jobs/download-resume/${filename}`;
};

// Authenticated Resume Download function
export const downloadResumeFile = async (filename: string, applicantName: string): Promise<void> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${BASE_URL}/jobs/download-resume/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to download resume');
    }

    // Get the file as a blob
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading resume:', error);
    throw error;
  }
};

// Job Application API functions
export const applyForJob = async (jobId: string, applicationData: CreateJobApplicationData): Promise<{ message: string; application: JobApplication }> => {
  return apiRequest<{ message: string; application: JobApplication }>(`/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(applicationData),
  });
};

export const updateApplicationStatus = async (
  applicationId: string,
  statusData: UpdateApplicationStatusData
): Promise<JobApplication> => {
  return apiRequest<JobApplication>(`/jobs/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: createHeaders(true),
    body: JSON.stringify(statusData),
  });
};

export const bulkUpdateApplications = async (
  jobId: string,
  applicationIds: string[],
  status: ApplicationStatus,
  notes?: string
): Promise<{ updated: number; errors: any[] }> => {
  return apiRequest<{ updated: number; errors: any[] }>(`/jobs/${jobId}/applications/bulk-update`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify({ applicationIds, status, notes }),
  });
};

export const getUserApplications = async (userId: string): Promise<JobApplication[]> => {
  return apiRequest<JobApplication[]>(`/jobs/user/${userId}/applications`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// Get single application details (including rejection reason)
export const getApplicationDetails = async (applicationId: string): Promise<JobApplication> => {
  return apiRequest<JobApplication>(`/jobs/applications/${applicationId}`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const getCompanyApplications = async (
  companyId: string,
  filters?: {
    jobId?: string;
    status?: ApplicationStatus;
    skillsMatch?: number;
  }
): Promise<JobApplication[]> => {
  let url = `/jobs/company/${companyId}/applications`;
  const params = new URLSearchParams();

  if (filters) {
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.status) params.append('status', filters.status);
    if (filters.skillsMatch) params.append('skillsMatch', filters.skillsMatch.toString());
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return apiRequest<JobApplication[]>(url, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// Job Bookmark API functions
export const bookmarkJob = async (jobId: string): Promise<{ message: string; bookmark: JobBookmark }> => {
  return apiRequest<{ message: string; bookmark: JobBookmark }>(`/jobs/${jobId}/bookmark`, {
    method: 'POST',
    headers: createHeaders(true),
  });
};

export const removeJobBookmark = async (jobId: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/jobs/${jobId}/bookmark`, {
    method: 'DELETE',
    headers: createHeaders(true),
  });
};

export const getUserBookmarks = async (userId: string): Promise<JobBookmark[]> => {
  return apiRequest<JobBookmark[]>(`/jobs/user/${userId}/bookmarks`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// User/Profile API functions
export const updateProfile = async (data: Partial<User>): Promise<{ user: User }> => {
  return apiRequest<{ user: User }>('/profile/me', {
    method: 'PATCH',
    headers: createHeaders(true),
    body: JSON.stringify(data),
  });
};

// Dashboard data functions
export const getDashboardData = async (): Promise<{
  projects: Project[];
  events: Event[];
  jobs: Job[];
}> => {
  try {
    return await apiRequest<{
      projects: Project[];
      events: Event[];
      jobs: Job[];
    }>('/dashboard', {
      method: 'GET',
      headers: createHeaders(true),
    });
  } catch (error) {
    console.warn('Backend not available, using mock dashboard data');
    return mockDashboardData;
  }
};

// Public homepage data (no authentication required)
export const getHomepageData = async (): Promise<{
  projects: Project[];
  events: Event[];
  jobs: Job[];
}> => {
  try {
    // Try to get public data from individual endpoints
    const [projects, events, jobs] = await Promise.all([
      getProjects(),
      getEvents(), 
      getJobs()
    ]);

    return {
      projects: projects.slice(0, 6), // Limit to 6 for homepage
      events: events.slice(0, 3),     // Limit to 3 for homepage  
      jobs: jobs.slice(0, 3)          // Limit to 3 for homepage
    };
  } catch (error) {
    console.warn('Backend not available, using mock homepage data');
    return {
      projects: mockDashboardData.projects,
      events: mockDashboardData.events,
      jobs: mockDashboardData.jobs
    };
  }
};

// Authentication API functions
export const login = async (email: string, password: string): Promise<{
  user: User;
  access_token: string;
}> => {
  return apiRequest<{
    user: User;
    access_token: string;
  }>('/auth/login', {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role?: UserRole
): Promise<{
  user: User;
  access_token: string;
}> => {
  return apiRequest<{
    user: User;
    access_token: string;
  }>('/auth/register', {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ email, password, name, role }),
  });
};

export const registerCompany = async (
  companyName: string,
  email: string,
  password: string
): Promise<{
  user: User;
  access_token: string;
}> => {
  return apiRequest<{
    user: User;
    access_token: string;
  }>('/auth/register/company', {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ companyName, email, password }),
  });
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  return apiRequest<{ user: User }>('/auth/profile', {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// Activities API functions
export const getRecentActivities = async (limit = 5): Promise<Activity[]> => {
  return apiRequest<Activity[]>(`/activities/recent?limit=${limit}`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// User Stats API functions
export const getUserStats = async (): Promise<UserStats> => {
  return apiRequest<UserStats>('/profile/stats', {
    method: 'GET',
    headers: createHeaders(true),
  });
};

// Event Stats API functions
export const getEventStats = async (): Promise<EventStats> => {
  try {
    return await apiRequest<EventStats>('/events/stats/overview', {
      method: 'GET',
      headers: createHeaders(false), // No auth required for public stats
    });
  } catch (error) {
    console.warn('Backend not available, returning mock event stats');
    return {
      eventsThisMonth: mockEvents.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }).length,
      totalAttendees: mockEvents.reduce((sum, e) => sum + e.currentAttendees, 0),
      uniqueOrganizers: new Set(mockEvents.map(e => e.organizerId)).size,
      averageRating: 4.2
    };
  }
};

export const getUserRegisteredEvents = async (): Promise<EventRegistration[]> => {
  const response = await apiRequest<{ events: EventRegistration[] }>('/events/user/registered-events', {
    method: 'GET',
    headers: createHeaders(true),
  });
  return response.events;
};

export const registerForEvent = async (
  eventId: string, 
  registrationData?: EventRegistrationData
): Promise<{ message: string; requiresApproval?: boolean }> => {
  return apiRequest<{ message: string; requiresApproval?: boolean }>(`/events/${eventId}/register`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(registrationData || {}),
  });
};

// Enhanced event management functions

export const getEventAttendees = async (eventId: string): Promise<EventAttendee[]> => {
  return apiRequest<EventAttendee[]>(`/events/${eventId}/attendees`, {
    method: 'GET',
    headers: createHeaders(),
  });
};

export const getEventAttendeesForOrganizer = async (eventId: string): Promise<{ attendees: EventAttendee[]; count: number }> => {
  return apiRequest<{ attendees: EventAttendee[]; count: number }>(`/events/${eventId}/attendees/manage`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const manageAttendeeStatus = async (
  eventId: string,
  attendeeId: string,
  status: AttendeeStatus
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/events/${eventId}/attendees/${attendeeId}/status`, {
    method: 'PUT',
    headers: createHeaders(true),
    body: JSON.stringify({ status }),
  });
};

export const checkInAttendee = async (
  eventId: string,
  attendeeId: string
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/events/${eventId}/attendees/${attendeeId}/checkin`, {
    method: 'POST',
    headers: createHeaders(true),
  });
};

export const getOrganizerEvents = async (): Promise<{ events: Event[] }> => {
  return apiRequest<{ events: Event[] }>('/events/user/organized', {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const getFoodAndDrinksReport = async (eventId: string): Promise<FoodAndDrinksReport> => {
  return apiRequest<FoodAndDrinksReport>(`/events/${eventId}/food-drinks-report`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const bulkApproveAttendees = async (
  eventId: string,
  attendeeIds: string[]
): Promise<{ message: string; successful: number; failed: number; errors: any[] }> => {
  return apiRequest<{ message: string; successful: number; failed: number; errors: any[] }>(
    `/events/${eventId}/attendees/bulk-approve`,
    {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ attendeeIds }),
    }
  );
};

export const exportAttendeeList = async (eventId: string): Promise<{
  attendees: any[];
  totalCount: number;
  exportedAt: string;
}> => {
  return apiRequest<{
    attendees: any[];
    totalCount: number;
    exportedAt: string;
  }>(`/events/${eventId}/attendees/export`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const getEventDashboard = async (eventId: string): Promise<EventDashboard> => {
  return apiRequest<EventDashboard>(`/events/${eventId}/dashboard`, {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const unregisterFromEvent = async (eventId: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/events/${eventId}/unregister`, {
    method: 'DELETE',
    headers: createHeaders(true),
  });
};

// Enhanced Profile API functions
export const getUserActivity = async (limit = 10): Promise<UserActivity[]> => {
  const response = await apiRequest<{ activities: UserActivity[] }>(`/profile/activity?limit=${limit}`, {
    method: 'GET',
    headers: createHeaders(true),
  });
  return response.activities;
};

export const getProfileCompletion = async (): Promise<ProfileCompletion> => {
  return apiRequest<ProfileCompletion>('/profile/completion', {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/profile/change-password', {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(passwordData),
  });
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/profile/settings', {
    method: 'PATCH',
    headers: createHeaders(true),
    body: JSON.stringify(settings),
  });
};

// Export utility functions for use in components
export { isAuthenticated, validateUserForJobOperations };

export const getNotifications = async (): Promise<any[]> => {
  return apiRequest<any[]>('/notifications', {
    method: 'GET',
    headers: createHeaders(true),
  });
};

export const markNotificationAsRead = async (id: string): Promise<any> => {
  return apiRequest<any>(`/notifications/${id}/read`, {
    method: 'PATCH',
    headers: createHeaders(true),
  });
};

// Suggestion API functions
export const getSuggestions = async (filters?: {
  careerPathId?: string;
  type?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}): Promise<{
  suggestions: Suggestion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/suggestions${queryString}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, using mock data for suggestions');
    // Return mock data when backend is unavailable
    return {
      suggestions: [
        {
          id: '1',
          type: 'improvement' as const,
          title: 'Add Modern React Features',
          description: 'Add more real-world project examples with modern frameworks like Next.js 14 and the latest React features.',
          careerPathId: filters?.careerPathId || 'frontend',
          careerPathTitle: 'Frontend Development',
          author: 'Alex Chen',
          authorId: 'user-1',
          authorRole: 'PROFESSIONAL' as const,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          votes: 23,
          hasUserVoted: false,
          rating: {
            averageRating: 4.2,
            totalRatings: 18,
            ratingDistribution: {
              1: 0,
              2: 1,
              3: 3,
              4: 6,
              5: 8
            }
          },
          status: 'approved' as const,
          priority: 'medium' as const,
          tags: ['react', 'nextjs', 'modern'],
          commentsCount: 5
        },
        {
          id: '2',
          type: 'content' as const,
          title: 'TypeScript Learning Path',
          description: 'Include TypeScript learning path and integration examples with existing JavaScript projects.',
          careerPathId: filters?.careerPathId || 'frontend',
          careerPathTitle: 'Frontend Development',
          author: 'Sarah Johnson',
          authorId: 'user-2',
          authorRole: 'STUDENT' as const,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          votes: 18,
          hasUserVoted: false,
          rating: {
            averageRating: 3.8,
            totalRatings: 12,
            ratingDistribution: {
              1: 0,
              2: 2,
              3: 2,
              4: 5,
              5: 3
            }
          },
          status: 'under_review' as const,
          priority: 'high' as const,
          tags: ['typescript', 'javascript', 'learning'],
          commentsCount: 3
        },
        {
          id: '3',
          type: 'feature' as const,
          title: 'Interactive Coding Challenges',
          description: 'Add interactive coding challenges within the roadmap for hands-on practice.',
          careerPathId: filters?.careerPathId || 'frontend',
          careerPathTitle: 'Frontend Development',
          author: 'Mike Rodriguez',
          authorId: 'user-3',
          authorRole: 'COMPANY' as const,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          votes: 31,
          hasUserVoted: true,
          userVoteType: 'up' as const,
          rating: {
            averageRating: 4.5,
            totalRatings: 24,
            ratingDistribution: {
              1: 0,
              2: 0,
              3: 2,
              4: 10,
              5: 12
            }
          },
          status: 'pending' as const,
          priority: 'low' as const,
          tags: ['interactive', 'challenges', 'practice'],
          commentsCount: 8
        }
      ],
      pagination: {
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
  }
};

export const createSuggestion = async (data: CreateSuggestionData): Promise<Suggestion> => {
  try {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('careerPathId', data.careerPathId);
    formData.append('careerPathTitle', data.careerPathTitle);
    formData.append('priority', data.priority);
    formData.append('tags', JSON.stringify(data.tags));
    
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append(`attachments`, file);
      });
    }

    return await apiRequest<Suggestion>('/suggestions', {
      method: 'POST',
      headers: createHeaders(true), // Include auth headers
      body: formData,
    });
  } catch (error) {
    console.warn('Backend not available, simulating suggestion creation');
    
    // Try to get current user info for mock response
    let authorName = 'Anonymous User';
    let authorId = 'anonymous';
    let authorRole: 'STUDENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN' = 'STUDENT';
    
    try {
      const currentUser = await getCurrentUser();
      if (currentUser.user) {
        authorName = currentUser.user.name;
        authorId = currentUser.user.id;
        authorRole = currentUser.user.role;
      }
    } catch {
      // If can't get current user, use defaults
      console.warn('Could not get current user for mock suggestion');
    }
    
    // Return mock created suggestion
    return {
      id: `suggestion-${Date.now()}`,
      type: data.type,
      title: data.title,
      description: data.description,
      careerPathId: data.careerPathId,
      careerPathTitle: data.careerPathTitle,
      author: authorName,
      authorId: authorId,
      authorRole: authorRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      hasUserVoted: false,
      rating: {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      },
      status: 'pending' as const,
      priority: data.priority,
      tags: data.tags,
      commentsCount: 0
    };
  }
};

export const voteSuggestion = async (suggestionId: string, voteType: 'up' | 'down'): Promise<{
  votes: number;
  userVoteType: 'up' | 'down' | null;
}> => {
  try {
    return await apiRequest(`/suggestions/${suggestionId}/vote`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ voteType }),
    });
  } catch (error) {
    console.warn('Backend not available, simulating vote');
    return {
      votes: Math.floor(Math.random() * 50) + 1,
      userVoteType: voteType
    };
  }
};

export const addSuggestionComment = async (suggestionId: string, content: string): Promise<SuggestionComment> => {
  try {
    return await apiRequest(`/suggestions/${suggestionId}/comments`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    console.warn('Backend not available, simulating comment creation');
    return {
      id: `comment-${Date.now()}`,
      suggestionId,
      content,
      author: 'Current User',
      authorId: 'current-user',
      authorRole: 'STUDENT' as const,
      createdAt: new Date().toISOString()
    };
  }
};

export const getSuggestionComments = async (suggestionId: string): Promise<SuggestionComment[]> => {
  try {
    return await apiRequest(`/suggestions/${suggestionId}/comments`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, returning empty comments');
    return [];
  }
};

export const getSuggestionStats = async (careerPathId?: string): Promise<SuggestionStats> => {
  try {
    const params = careerPathId ? `?careerPathId=${careerPathId}` : '';
    return await apiRequest(`/suggestions/stats${params}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    console.warn('Backend not available, returning mock stats');
    return {
      totalSuggestions: 3,
      pendingSuggestions: 1,
      approvedSuggestions: 1,
      implementedSuggestions: 0,
      rejectedSuggestions: 0,
      suggestionsByType: {
        improvement: 1,
        content: 1,
        feature: 1,
        bug: 0,
        other: 0
      },
      suggestionsByCareerPath: {
        frontend: 3,
        backend: 0,
        devops: 0
      },
      averageVotes: 24,
      topTags: [
        { tag: 'react', count: 2 },
        { tag: 'typescript', count: 1 },
        { tag: 'interactive', count: 1 }
      ]
    };
  }
};

// Admin suggestion functions
export const getAdminSuggestions = async (filters?: {
  status?: string;
  priority?: string;
  type?: string;
  careerPath?: string;
  sortBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  suggestions: Suggestion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/admin/suggestions${queryString}`, {
      method: 'GET',
      headers: createHeaders(true),
    });
  } catch (error) {
    console.warn('Backend not available, using mock admin suggestions');
    return getSuggestions(filters as any);
  }
};

export const updateSuggestionStatus = async (
  suggestionId: string, 
  status: SuggestionStatus,
  adminResponse?: string
): Promise<Suggestion> => {
  try {
    return await apiRequest(`/admin/suggestions/${suggestionId}/status`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify({ status, adminResponse }),
    });
  } catch (error) {
    console.warn('Backend not available, simulating status update');
    throw error;
  }
};

export const bulkUpdateSuggestions = async (
  suggestionIds: string[],
  action: 'approve' | 'reject' | 'implement',
  notes?: string
): Promise<{ updated: number }> => {
  try {
    return await apiRequest('/admin/suggestions/bulk', {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ suggestionIds, action, notes }),
    });
  } catch (error) {
    console.warn('Backend not available, simulating bulk update');
    return { updated: suggestionIds.length };
  }
};

// Rating and Feedback API functions
export const rateSuggestion = async (
  suggestionId: string, 
  rating: number, 
  feedback?: string,
  categories?: {
    relevance: number;
    clarity: number;
    impact: number;
    feasibility: number;
  }
): Promise<{
  averageRating: number;
  totalRatings: number;
  userRating: number;
}> => {
  try {
    return await apiRequest(`/suggestions/${suggestionId}/rate`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ rating, feedback, categories }),
    });
  } catch (error) {
    console.warn('Backend not available, simulating rating submission');
    // Return mock response
    return {
      averageRating: Math.random() * 2 + 3, // Random rating between 3-5
      totalRatings: Math.floor(Math.random() * 20) + 5,
      userRating: rating
    };
  }
};

export const submitSuggestionFeedback = async (
  suggestionId: string,
  overallRating: number,
  categoryRatings: {
    relevance: number;
    clarity: number;
    impact: number;
    feasibility: number;
  },
  writtenFeedback?: string
): Promise<{
  success: boolean;
  averageRating: number;
  totalRatings: number;
}> => {
  try {
    return await apiRequest(`/suggestions/${suggestionId}/feedback`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ 
        overallRating, 
        categoryRatings, 
        writtenFeedback 
      }),
    });
  } catch (error) {
    console.warn('Backend not available, simulating feedback submission');
    // Return mock response
    return {
      success: true,
      averageRating: Math.random() * 2 + 3, // Random rating between 3-5
      totalRatings: Math.floor(Math.random() * 20) + 5
    };
  }
};

export const getSuggestionRating = async (suggestionId: string): Promise<{
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
  userRating?: number;
}> => {
  try {
    return await apiRequest(`/suggestions/${suggestionId}/rating`, {
      method: 'GET',
      headers: createHeaders(true),
    });
  } catch (error) {
    console.warn('Backend not available, returning mock rating data');
    return {
      averageRating: Math.random() * 2 + 3,
      totalRatings: Math.floor(Math.random() * 20) + 5,
      ratingDistribution: {
        1: Math.floor(Math.random() * 3),
        2: Math.floor(Math.random() * 5),
        3: Math.floor(Math.random() * 8),
        4: Math.floor(Math.random() * 10) + 5,
        5: Math.floor(Math.random() * 15) + 8
      },
      userRating: undefined
    };
  }
};