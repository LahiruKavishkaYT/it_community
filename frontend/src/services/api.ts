import { Project, Event, Job, User, ProjectFeedback, UserRole, Activity, UserStats, EventStats, UserActivity, ProfileCompletion, UserSettings, ProjectType } from '../types';

// Base URL for all API calls
const BASE_URL = 'http://localhost:3001';

// Utility function to get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
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
  return apiRequest<Project[]>('/projects', {
    method: 'GET',
    headers: createHeaders(),
  });
};

export const getProjectsByType = async (type: ProjectType): Promise<Project[]> => {
  return apiRequest<Project[]>(`/projects?type=${type}`, {
    method: 'GET',
    headers: createHeaders(),
  });
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

// Event API functions
export const getEvents = async (): Promise<Event[]> => {
  return apiRequest<Event[]>('/events', {
    method: 'GET',
    headers: createHeaders(),
  });
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

export const createEvent = async (data: Omit<Event, 'id' | 'currentAttendees'>): Promise<Event> => {
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

// Job API functions
export const getJobs = async (): Promise<Job[]> => {
  return apiRequest<Job[]>('/jobs', {
    method: 'GET',
    headers: createHeaders(),
  });
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  try {
    return await apiRequest<Job>(`/jobs/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  } catch (error) {
    // If job not found, return undefined
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const createJob = async (data: Omit<Job, 'id' | 'postedAt'>): Promise<Job> => {
  return apiRequest<Job>('/jobs', {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(data),
  });
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
  return apiRequest<{
    projects: Project[];
    events: Event[];
    jobs: Job[];
  }>('/dashboard', {
    method: 'GET',
    headers: createHeaders(true),
  });
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
  return apiRequest<EventStats>('/events/stats/overview', {
    method: 'GET',
    headers: createHeaders(false), // No auth required for public stats
  });
};

export const getUserRegisteredEvents = async (): Promise<Event[]> => {
  const response = await apiRequest<{ events: Event[] }>('/events/user/registered-events', {
    method: 'GET',
    headers: createHeaders(true),
  });
  return response.events;
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