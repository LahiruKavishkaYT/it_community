// API service for admin dashboard
import { toast } from "@/hooks/use-toast";

// Base URL - should be environment variable in production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Development mode - use mock data when backend is not available
// Set to false to use real backend data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN';
  avatar?: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'suspended' | 'deleted';
  projects: number;
  events: number;
  company?: string;
  location?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  createdAt: string;
  feedbackCount: number;
  status: 'published' | 'draft' | 'flagged';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  date: string;
  location: string;
  type: 'WORKSHOP' | 'NETWORKING' | 'HACKATHON' | 'SEMINAR';
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  maxAttendees?: number;
  currentAttendees: number;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    email: string;
  };
  description: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  location: string;
  postedAt: string;
  applicationsCount: number;
  status: 'PUBLISHED' | 'CLOSED' | 'DRAFT';
}

export interface Analytics {
  users: {
    total: number;
    byRole: Record<string, number>;
    growthRate: string;
    recentUsers: User[];
  };
  content: {
    projects: number;
    events: number;
    jobs: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    database: boolean;
    timestamp: string;
  };
}

// API Error Class
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Utility functions
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

const createHeaders = (includeAuth = true): HeadersInit => {
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

// Mock data for development (only used when explicitly enabled)
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@itcommunity.com',
    role: 'ADMIN',
    joinDate: '2024-01-01',
    lastActive: '2 minutes ago',
    status: 'active',
    projects: 15,
    events: 8,
    company: 'ITCommunity',
    location: 'Global'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'PROFESSIONAL',
    joinDate: '2024-01-15',
    lastActive: '2 hours ago',
    status: 'active',
    projects: 12,
    events: 5,
    company: 'Tech Corp',
    location: 'New York'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    role: 'STUDENT',
    joinDate: '2024-02-20',
    lastActive: '1 day ago',
    status: 'active',
    projects: 8,
    events: 12,
    location: 'California'
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'COMPANY',
    joinDate: '2024-01-10',
    lastActive: '5 minutes ago',
    status: 'active',
    projects: 0,
    events: 3,
    company: 'Startup Inc',
    location: 'Austin'
  }
];

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'React Advanced Workshop',
    description: 'Deep dive into React hooks, context, and performance optimization techniques for experienced developers.',
    organizer: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com'
    },
    date: '2024-02-15T14:00:00Z',
    location: 'Tech Hub Downtown, New York',
    type: 'WORKSHOP',
    status: 'PUBLISHED',
    maxAttendees: 50,
    currentAttendees: 35,
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Startup Networking Night',
    description: 'Connect with fellow entrepreneurs, investors, and tech professionals in a relaxed networking environment.',
    organizer: {
      id: '4',
      name: 'Emma Davis',
      email: 'emma.davis@company.com'
    },
    date: '2024-02-20T18:00:00Z',
    location: 'Innovation Center, Austin',
    type: 'NETWORKING',
    status: 'PUBLISHED',
    maxAttendees: 100,
    currentAttendees: 78,
    createdAt: '2024-01-25T14:30:00Z'
  }
];

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with React, Node.js, and PostgreSQL.',
    author: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'PROFESSIONAL'
    },
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    githubUrl: 'https://github.com/sarah/ecommerce-platform',
    liveUrl: 'https://ecommerce-demo.com',
    imageUrl: '/api/placeholder/400/300',
    createdAt: '2024-01-15T09:00:00Z',
    feedbackCount: 12,
    status: 'published'
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates.',
    author: {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      role: 'STUDENT'
    },
    technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
    githubUrl: 'https://github.com/mike/task-manager',
    liveUrl: 'https://task-manager-demo.com',
    imageUrl: '/api/placeholder/400/300',
    createdAt: '2024-02-01T11:30:00Z',
    feedbackCount: 8,
    status: 'published'
  }
];

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: {
      id: '4',
      name: 'Startup Inc',
      email: 'emma.davis@company.com'
    },
    description: 'We are looking for an experienced frontend developer to join our growing team.',
    type: 'FULL_TIME',
    location: 'Austin, TX',
    postedAt: '2024-01-20T10:00:00Z',
    applicationsCount: 15,
    status: 'PUBLISHED'
  },
  {
    id: '2',
    title: 'React Intern',
    company: {
      id: '4',
      name: 'Startup Inc',
      email: 'emma.davis@company.com'
    },
    description: 'Great opportunity for students to gain real-world React development experience.',
    type: 'INTERNSHIP',
    location: 'Remote',
    postedAt: '2024-01-25T14:30:00Z',
    applicationsCount: 8,
    status: 'PUBLISHED'
  }
];

// Mock delay for realistic loading states
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Main API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = createHeaders(options.method !== 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        toast({
          title: "Authentication Required",
          description: "Please log in again",
          variant: "destructive",
        });
        throw new APIError('Authentication required', 401, errorData);
      }

      if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission for this action",
          variant: "destructive",
        });
        throw new APIError('Access denied', 403, errorData);
      }

      throw new APIError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
    return await response.json();
    }

    return {} as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network error or other issues
    console.error('API request failed:', error);
    
    // If mock data is enabled, fallback to mock data
    if (USE_MOCK_DATA) {
      console.warn('API request failed, falling back to mock data:', error);
      return handleMockRequest<T>(endpoint, options);
    }

    toast({
      title: "Network Error",
      description: "Unable to connect to server. Please check your connection.",
      variant: "destructive",
    });
    
    throw new APIError(
      'Network error - please check your connection',
      0,
      error
    );
  }
};

// Mock request handler for development
const handleMockRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  await mockDelay();
  
  // Simulate authentication check
  if (endpoint.includes('/auth/me') && !isAuthenticated()) {
    throw new APIError('Unauthorized', 401);
  }

  // Mock responses based on endpoint
  if (endpoint.includes('/admin/users')) {
    const params = new URLSearchParams(endpoint.split('?')[1] || '');
    const search = params.get('search');
    const role = params.get('role');
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '10');

    let filteredUsers = [...MOCK_USERS];
      
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return {
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit)
    } as T;
  }

  if (endpoint.includes('/admin/analytics/users')) {
    const byRole = MOCK_USERS.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: MOCK_USERS.length,
      byRole,
      growthRate: '+12%',
      recentUsers: MOCK_USERS.slice(0, 5)
    } as T;
  }

  if (endpoint.includes('/admin/projects')) {
    return {
      projects: MOCK_PROJECTS,
      total: MOCK_PROJECTS.length,
      page: 1,
      limit: 10,
      totalPages: 1
    } as T;
  }

  if (endpoint.includes('/admin/events')) {
    return {
      events: MOCK_EVENTS,
      total: MOCK_EVENTS.length
    } as T;
  }

  if (endpoint.includes('/admin/jobs')) {
    return {
      jobs: MOCK_JOBS,
      total: MOCK_JOBS.length
    } as T;
  }

  if (endpoint.includes('/admin/dashboard/overview')) {
    return {
      metrics: {
        users: {
          total: MOCK_USERS.length,
          byRole: MOCK_USERS.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        content: {
          projects: MOCK_PROJECTS.length,
          events: MOCK_EVENTS.length,
          jobs: MOCK_JOBS.length
        }
      },
      recentActivity: MOCK_USERS.slice(0, 5).map(user => ({
        id: user.id,
        type: 'USER_REGISTRATION',
        action: `${user.name} joined the platform`,
        user: { id: user.id, name: user.name, role: user.role },
        timestamp: user.joinDate
      }))
    } as T;
  }

  // Default mock response
  return {} as T;
};

// Authentication API
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const mockUser = MOCK_USERS.find(u => u.role === 'ADMIN');
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('admin_token', mockToken);
      return { user: mockUser!, token: mockToken };
    }

    const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('admin_token', response.token);
    return response;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('admin_token');
    if (!USE_MOCK_DATA) {
      await apiRequest('/auth/logout', { method: 'POST' });
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/auth/profile');
  },
};

// User Management API
export const userAPI = {
  async getUsers(filters?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    if (USE_MOCK_DATA) {
      return handleMockRequest<{ users: User[]; total: number }>('/admin/users', {
        method: 'GET',
        body: JSON.stringify(filters)
      });
    }

    const params = new URLSearchParams();
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    return apiRequest<{ users: User[]; total: number }>(
      `/admin/users${queryString ? `?${queryString}` : ''}`
    );
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const user = MOCK_USERS.find(u => u.id === userId);
      if (user) {
        user.role = role as any;
        return user;
      }
      throw new Error('User not found');
    }

    const response = await apiRequest<User>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });

    toast({
      title: "User Updated",
      description: "User role has been updated successfully",
    });

    return response;
  },

  async deleteUser(userId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_USERS.findIndex(u => u.id === userId);
      if (index > -1) {
        MOCK_USERS.splice(index, 1);
      }
      return;
    }

    await apiRequest<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });

    toast({
      title: "User Deleted",
      description: "User has been deleted successfully",
    });
  },

  async suspendUser(userId: string): Promise<User> {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const user = MOCK_USERS.find(u => u.id === userId);
      if (user) {
        user.status = 'suspended';
        return user;
      }
      throw new Error('User not found');
    }

    const response = await apiRequest<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'suspended' }),
    });

    toast({
      title: "User Suspended",
      description: "User has been suspended successfully",
    });

    return response;
  },
};

// Content Management API
export const contentAPI = {
  async getProjects(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number; totalPages: number }> {
    if (USE_MOCK_DATA) {
      return handleMockRequest<{ projects: Project[]; total: number; page: number; limit: number; totalPages: number }>('/admin/projects', {
        method: 'GET',
        body: JSON.stringify(filters)
      });
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);

    return apiRequest(`/admin/projects?${params.toString()}`);
  },

  async getProjectDetails(projectId: string): Promise<Project> {
    return apiRequest(`/admin/projects/${projectId}`);
  },

  async approveProject(projectId: string, notes?: string): Promise<Project> {
    return apiRequest(`/admin/projects/${projectId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async rejectProject(projectId: string, reason: string): Promise<Project> {
    return apiRequest(`/admin/projects/${projectId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async deleteProject(projectId: string): Promise<void> {
    return apiRequest(`/admin/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  async getEvents(filters?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total: number }> {
    if (USE_MOCK_DATA) {
      return handleMockRequest<{ events: Event[]; total: number }>('/admin/events', {
        method: 'GET',
        body: JSON.stringify(filters)
      });
    }

    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    return apiRequest<{ events: Event[]; total: number }>(
      `/admin/events${queryString ? `?${queryString}` : ''}`
    );
  },

  async deleteEvent(eventId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_EVENTS.findIndex(e => e.id === eventId);
      if (index > -1) {
        MOCK_EVENTS.splice(index, 1);
      }
      return;
    }

    await apiRequest<void>(`/admin/events/${eventId}`, {
      method: 'DELETE',
    });

    toast({
      title: "Event Deleted",
      description: "Event has been deleted successfully",
    });
  },

  async getJobs(filters?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; total: number }> {
    if (USE_MOCK_DATA) {
      return handleMockRequest<{ jobs: Job[]; total: number }>('/admin/jobs', {
        method: 'GET',
        body: JSON.stringify(filters)
      });
    }

    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    return apiRequest<{ jobs: Job[]; total: number }>(
      `/admin/jobs${queryString ? `?${queryString}` : ''}`
    );
  },

  async deleteJob(jobId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_JOBS.findIndex(j => j.id === jobId);
      if (index > -1) {
        MOCK_JOBS.splice(index, 1);
      }
      return;
    }

    await apiRequest<void>(`/admin/jobs/${jobId}`, {
      method: 'DELETE',
    });

    toast({
      title: "Job Deleted",
      description: "Job has been deleted successfully",
    });
  },
};

// Analytics API
export const analyticsAPI = {
  async getUserAnalytics(): Promise<Analytics['users']> {
    if (USE_MOCK_DATA) {
      return handleMockRequest<Analytics['users']>('/admin/analytics/users');
    }
    return apiRequest<Analytics['users']>('/admin/analytics/users');
  },

  async getContentAnalytics(): Promise<Analytics['content']> {
    if (USE_MOCK_DATA) {
      return {
        projects: MOCK_PROJECTS.length,
        events: MOCK_EVENTS.length,
        jobs: MOCK_JOBS.length
      };
    }
    return apiRequest<Analytics['content']>('/admin/analytics/content');
  },

  async getSystemHealth(): Promise<Analytics['systemHealth']> {
    if (USE_MOCK_DATA) {
      return {
        status: 'healthy',
        database: true,
        timestamp: new Date().toISOString()
      };
    }
    return apiRequest<Analytics['systemHealth']>('/admin/system/health');
  },

  async getFullAnalytics(): Promise<Analytics> {
    const [users, content, systemHealth] = await Promise.all([
      this.getUserAnalytics(),
      this.getContentAnalytics(),
      this.getSystemHealth(),
    ]);

    return {
      users,
      content,
      systemHealth,
    };
  },
};

// Project API (alias for content API project methods)
export const projectAPI = {
  getProjects: contentAPI.getProjects,
  getProjectDetails: contentAPI.getProjectDetails,
  approveProject: contentAPI.approveProject,
  rejectProject: contentAPI.rejectProject,
  deleteProject: contentAPI.deleteProject,
};

// Event API (alias for content API event methods)
export const eventAPI = {
  getEvents: contentAPI.getEvents,
  deleteEvent: contentAPI.deleteEvent,
};

// Job API (alias for content API job methods)
export const jobAPI = {
  getJobs: contentAPI.getJobs,
  deleteJob: contentAPI.deleteJob,
};

// Export all APIs
export const adminAPI = {
  auth: authAPI,
  users: userAPI,
  content: contentAPI,
  analytics: analyticsAPI,
  projects: projectAPI,
  events: eventAPI,
  jobs: jobAPI,
};

// Export utility functions
export { isAuthenticated, APIError }; 