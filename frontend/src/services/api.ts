import { Project, Event, Job, User, ProjectFeedback } from '../types';

// In-memory data storage
let projects: Project[] = [
  {
    id: '1',
    title: 'E-commerce React App',
    description: 'A full-stack e-commerce application built with React, Node.js, and PostgreSQL. Features include user authentication, shopping cart, payment integration, and admin dashboard.',
    author: 'Alex Chen',
    authorId: 'user1',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    githubUrl: 'https://github.com/alexchen/ecommerce-app',
    liveUrl: 'https://ecommerce-demo.netlify.app',
    imageUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    createdAt: '2024-03-10',
    feedback: []
  },
  {
    id: '2',
    title: 'Task Management Dashboard',
    description: 'A collaborative task management tool with real-time updates, drag-and-drop functionality, and team collaboration features.',
    author: 'Sarah Johnson',
    authorId: 'user2',
    technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
    githubUrl: 'https://github.com/sarahjohnson/task-manager',
    liveUrl: 'https://taskboard-demo.vercel.app',
    imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    createdAt: '2024-03-08',
    feedback: []
  },
  {
    id: '3',
    title: 'Weather App with Maps',
    description: 'Interactive weather application with location-based forecasts, interactive maps, and weather alerts.',
    author: 'Mike Rodriguez',
    authorId: 'user3',
    technologies: ['React', 'OpenWeather API', 'Mapbox', 'Chart.js'],
    githubUrl: 'https://github.com/mikerodriguez/weather-app',
    imageUrl: 'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    createdAt: '2024-03-05',
    feedback: []
  }
];

let events: Event[] = [
  {
    id: '1',
    title: 'React.js Advanced Workshop',
    description: 'Deep dive into advanced React patterns, performance optimization, and modern hooks. Perfect for developers looking to level up their React skills.',
    organizer: 'TechCorp Inc.',
    organizerId: 'company1',
    date: '2024-03-15T14:00:00Z',
    location: 'Online',
    type: 'workshop',
    maxAttendees: 50,
    currentAttendees: 45,
    imageUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
  },
  {
    id: '2',
    title: 'AI/ML Career Fair 2024',
    description: 'Connect with leading AI companies, attend tech talks, and explore career opportunities in machine learning and artificial intelligence.',
    organizer: 'DataScience Hub',
    organizerId: 'company2',
    date: '2024-03-22T10:00:00Z',
    location: 'San Francisco, CA',
    type: 'networking',
    maxAttendees: 200,
    currentAttendees: 128,
    imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
  },
  {
    id: '3',
    title: 'Full Stack Development Bootcamp',
    description: 'Intensive 3-day bootcamp covering frontend, backend, and deployment. Build a complete web application from scratch.',
    organizer: 'CodeAcademy Pro',
    organizerId: 'company3',
    date: '2024-03-28T09:00:00Z',
    location: 'New York, NY',
    type: 'hackathon',
    maxAttendees: 40,
    currentAttendees: 32,
    imageUrl: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
  },
  {
    id: '4',
    title: 'DevOps Best Practices Seminar',
    description: 'Learn industry best practices for CI/CD, containerization, and cloud deployment from experienced DevOps engineers.',
    organizer: 'Sarah Johnson',
    organizerId: 'professional1',
    date: '2024-04-05T16:00:00Z',
    location: 'Online',
    type: 'seminar',
    maxAttendees: 75,
    currentAttendees: 23,
    imageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
  },
  {
    id: '5',
    title: 'Student Project Showcase',
    description: 'Students present their capstone projects and receive feedback from industry professionals. Great networking opportunity!',
    organizer: 'University Tech Club',
    organizerId: 'student1',
    date: '2024-04-12T18:00:00Z',
    location: 'Austin, TX',
    type: 'networking',
    maxAttendees: 100,
    currentAttendees: 67,
    imageUrl: 'https://images.pexels.com/photos/1181678/pexels-photo-1181678.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
  },
  {
    id: '6',
    title: 'Cybersecurity Fundamentals Workshop',
    description: 'Introduction to cybersecurity concepts, threat analysis, and security best practices for web applications.',
    organizer: 'SecureTech Solutions',
    organizerId: 'company4',
    date: '2024-04-18T13:00:00Z',
    location: 'Online',
    type: 'workshop',
    maxAttendees: 60,
    currentAttendees: 41,
    imageUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
  }
];

let jobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechStart Inc.',
    companyId: 'company1',
    description: 'Join our dynamic frontend team to build modern web applications using React, TypeScript, and cutting-edge technologies.',
    requirements: ['React', 'TypeScript', 'HTML/CSS', 'Git'],
    location: 'San Francisco, CA',
    type: 'internship',
    salary: '$25-30/hr',
    remote: true,
    postedAt: '2024-03-12T10:00:00Z'
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'InnovateLab',
    companyId: 'company2',
    description: 'Build scalable web applications from frontend to backend. Work with modern technologies and contribute to innovative projects.',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'AWS', '3+ years experience'],
    location: 'New York, NY',
    type: 'full-time',
    salary: '$85K-120K',
    remote: false,
    postedAt: '2024-03-08T14:30:00Z'
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    companyId: 'company3',
    description: 'Manage cloud infrastructure, implement CI/CD pipelines, and ensure system reliability and scalability.',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
    location: 'Austin, TX',
    type: 'full-time',
    salary: '$95K-140K',
    remote: true,
    postedAt: '2024-03-11T09:15:00Z'
  },
  {
    id: '4',
    title: 'Backend Developer',
    company: 'DataFlow Inc.',
    companyId: 'company4',
    description: 'Design and implement robust backend systems, APIs, and database solutions for our data processing platform.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'Redis', 'API Design'],
    location: 'Seattle, WA',
    type: 'full-time',
    salary: '$90K-130K',
    remote: true,
    postedAt: '2024-03-09T16:20:00Z'
  },
  {
    id: '5',
    title: 'UI/UX Designer',
    company: 'DesignHub',
    companyId: 'company5',
    description: 'Create beautiful and intuitive user interfaces and experiences for web and mobile applications.',
    requirements: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    location: 'Los Angeles, CA',
    type: 'full-time',
    salary: '$75K-110K',
    remote: false,
    postedAt: '2024-03-10T11:45:00Z'
  }
];

// Utility function to simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Project API functions
export const getProjects = (): Promise<Project[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...projects]);
    }, 1000);
  });
};

export const getProjectById = (id: string): Promise<Project | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const project = projects.find(p => p.id === id);
      resolve(project);
    }, 1000);
  });
};

export const createProject = (data: Omit<Project, 'id' | 'createdAt' | 'feedback'>): Promise<Project> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newProject: Project = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        feedback: []
      };
      projects.unshift(newProject); // Add to beginning of array
      resolve(newProject);
    }, 1000);
  });
};

export const updateProject = (id: string, data: Partial<Project>): Promise<Project | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...data };
        resolve(projects[index]);
      } else {
        resolve(undefined);
      }
    }, 1000);
  });
};

export const deleteProject = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

// Event API functions
export const getEvents = (): Promise<Event[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...events]);
    }, 1000);
  });
};

export const getEventById = (id: string): Promise<Event | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const event = events.find(e => e.id === id);
      resolve(event);
    }, 1000);
  });
};

export const createEvent = (data: Omit<Event, 'id' | 'currentAttendees'>): Promise<Event> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newEvent: Event = {
        ...data,
        id: generateId(),
        currentAttendees: 0
      };
      events.unshift(newEvent);
      resolve(newEvent);
    }, 1000);
  });
};

export const updateEvent = (id: string, data: Partial<Event>): Promise<Event | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        events[index] = { ...events[index], ...data };
        resolve(events[index]);
      } else {
        resolve(undefined);
      }
    }, 1000);
  });
};

export const deleteEvent = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        events.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

// Job API functions
export const getJobs = (): Promise<Job[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...jobs]);
    }, 1000);
  });
};

export const getJobById = (id: string): Promise<Job | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const job = jobs.find(j => j.id === id);
      resolve(job);
    }, 1000);
  });
};

export const createJob = (data: Omit<Job, 'id' | 'postedAt'>): Promise<Job> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newJob: Job = {
        ...data,
        id: generateId(),
        postedAt: new Date().toISOString()
      };
      jobs.unshift(newJob);
      resolve(newJob);
    }, 1000);
  });
};

export const updateJob = (id: string, data: Partial<Job>): Promise<Job | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = jobs.findIndex(j => j.id === id);
      if (index !== -1) {
        jobs[index] = { ...jobs[index], ...data };
        resolve(jobs[index]);
      } else {
        resolve(undefined);
      }
    }, 1000);
  });
};

export const deleteJob = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = jobs.findIndex(j => j.id === id);
      if (index !== -1) {
        jobs.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

// User/Profile API functions
export const updateProfile = (data: Partial<User>): Promise<User> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // In a real app, this would update the user in your auth context
      // For now, we'll just return the updated data
      const updatedUser = { ...data } as User;
      resolve(updatedUser);
    }, 1000);
  });
};

// Dashboard data functions
export const getDashboardData = (): Promise<{
  projects: Project[];
  events: Event[];
  jobs: Job[];
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        projects: projects.slice(0, 3), // Latest 3 projects
        events: events.slice(0, 3),     // Latest 3 events
        jobs: jobs.slice(0, 3)          // Latest 3 jobs
      });
    }, 1000);
  });
}; 