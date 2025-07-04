import { 
  Project, Event, Job, User, ProjectFeedback, UserRole, Activity, UserStats, EventStats, 
  UserActivity, ProfileCompletion, UserSettings, ProjectType, CreateEventData, EventRegistrationData, 
  EventAttendee, EventDashboard, FoodAndDrinksReport, AttendeeStatus, EventRegistration,
  JobFilters, JobAnalytics, JobApplication, JobBookmark, CreateJobData, CreateJobApplicationData, 
  UpdateApplicationStatusData, ApplicationStatus
} from '../types';
import { mockProjects, mockEvents, mockJobs, mockDashboardData } from '../data/mockData';

// Base URL for all API calls
const BASE_URL = 'http://localhost:3001';

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

    return await apiRequest<Job[]>(url, {
      method: 'GET',
      headers: createHeaders(),
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
  
  // Debug: Log request details
  const token = getAuthToken();
  console.log('Creating job with token:', token ? 'Present' : 'Missing');
  console.log('Job data being sent:', data);
  
  try {
    return await apiRequest<Job>('/jobs', {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Request details:', {
      endpoint: '/jobs',
      method: 'POST',
      hasToken: !!token,
      data: data
    });
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