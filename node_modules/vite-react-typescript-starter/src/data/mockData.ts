import { Project, Event, Job } from '../types';

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform with React & Node.js',
    description: 'A full-stack e-commerce application built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, payment integration with Stripe, and admin dashboard for inventory management.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe API', 'JWT'],
    githubUrl: 'https://github.com/example/ecommerce-platform',
    liveUrl: 'https://ecommerce-demo.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600',
    author: 'Sarah Chen',
    authorId: 'user1',
    projectType: 'STUDENT_PROJECT',
    createdAt: '2024-01-15T08:00:00Z',
    feedback: []
  },
  {
    id: '2',
    title: 'Task Management Dashboard',
    description: 'A collaborative task management application with real-time updates, team collaboration features, drag-and-drop functionality, and advanced filtering. Built with modern web technologies and best practices.',
    technologies: ['Vue.js', 'Firebase', 'Vuetify', 'Socket.io'],
    githubUrl: 'https://github.com/example/task-manager',
    liveUrl: 'https://taskflow-demo.netlify.app',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600',
    author: 'Alex Rodriguez',
    authorId: 'user2',
    projectType: 'PRACTICE_PROJECT',
    createdAt: '2024-01-20T10:30:00Z',
    feedback: []
  },
  {
    id: '3',
    title: 'AI-Powered Recipe Finder',
    description: 'Machine learning application that suggests recipes based on available ingredients. Uses computer vision to identify ingredients from photos and provides personalized recipe recommendations.',
    technologies: ['Python', 'TensorFlow', 'Flask', 'React', 'OpenCV'],
    githubUrl: 'https://github.com/example/recipe-ai',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600',
    author: 'Dr. Maria Santos',
    authorId: 'user3',
    projectType: 'PRACTICE_PROJECT',
    createdAt: '2024-01-25T14:15:00Z',
    feedback: []
  },
  {
    id: '4',
    title: 'Social Media Analytics Tool',
    description: 'Data visualization dashboard for social media analytics with real-time metrics, engagement tracking, and performance insights. Includes automated reporting and competitor analysis features.',
    technologies: ['React', 'D3.js', 'Node.js', 'PostgreSQL', 'Chart.js'],
    githubUrl: 'https://github.com/example/social-analytics',
    liveUrl: 'https://analytics-dashboard-demo.herokuapp.com',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
    author: 'James Wilson',
    authorId: 'user4',
    projectType: 'STUDENT_PROJECT',
    createdAt: '2024-02-01T09:45:00Z',
    feedback: []
  },
  {
    id: '5',
    title: 'Cryptocurrency Trading Bot',
    description: 'Automated trading bot with multiple strategies, risk management, and backtesting capabilities. Features real-time market data integration and comprehensive analytics dashboard.',
    technologies: ['Python', 'FastAPI', 'Redis', 'Docker', 'TradingView API'],
    githubUrl: 'https://github.com/example/crypto-bot',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600',
    author: 'Emma Thompson',
    authorId: 'user5',
    projectType: 'PRACTICE_PROJECT',
    createdAt: '2024-02-05T16:20:00Z',
    feedback: []
  },
  {
    id: '6',
    title: 'Weather Forecast Mobile App',
    description: 'Cross-platform mobile application providing detailed weather forecasts, severe weather alerts, and location-based recommendations. Features offline functionality and beautiful UI.',
    technologies: ['React Native', 'TypeScript', 'Weather API', 'AsyncStorage'],
    githubUrl: 'https://github.com/example/weather-app',
    imageUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=600',
    author: 'Michael Brown',
    authorId: 'user6',
    projectType: 'STUDENT_PROJECT',
    createdAt: '2024-02-10T11:00:00Z',
    feedback: []
  },
  {
    id: '7',
    title: 'Blockchain Voting System',
    description: 'Secure, transparent voting platform built on blockchain technology. Features voter authentication, ballot encryption, real-time results tracking, and immutable vote recording for maximum transparency and security.',
    technologies: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'MetaMask', 'IPFS'],
    githubUrl: 'https://github.com/example/blockchain-voting',
    liveUrl: 'https://secure-vote-demo.eth.link',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600',
    author: 'David Kim',
    authorId: 'user7',
    projectType: 'PRACTICE_PROJECT',
    createdAt: '2024-02-12T13:30:00Z',
    feedback: []
  },
  {
    id: '8',
    title: 'Smart Home IoT Dashboard',
    description: 'Comprehensive IoT dashboard for smart home automation with device control, energy monitoring, security alerts, and machine learning-based optimization. Supports multiple protocols and devices.',
    technologies: ['Next.js', 'TypeScript', 'Arduino', 'Raspberry Pi', 'MQTT', 'InfluxDB'],
    githubUrl: 'https://github.com/example/smart-home-iot',
    liveUrl: 'https://smarthome-control.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600',
    author: 'Lisa Zhang',
    authorId: 'user8',
    projectType: 'STUDENT_PROJECT',
    createdAt: '2024-02-14T15:45:00Z',
    feedback: []
  }
];

// Mock Events Data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'React Advanced Patterns Workshop',
    description: 'Deep dive into advanced React patterns including render props, higher-order components, custom hooks, and performance optimization techniques. Perfect for developers looking to master React.',
    date: '2024-03-15T14:00:00Z',
    location: 'Tech Hub Downtown, Conference Room A',
    type: 'WORKSHOP',
    maxAttendees: 50,
    currentAttendees: 32,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600',
    organizer: 'Tech Mentors Inc.',
    organizerId: 'org1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    foodProvided: true,
    drinksProvided: true
  },
  {
    id: '2',
    title: 'AI/ML Career Night - Networking Event',
    description: 'Connect with AI and Machine Learning professionals, learn about career opportunities, and discover the latest trends in artificial intelligence. Great for students and career changers.',
    date: '2024-03-20T18:30:00Z',
    location: 'Innovation Center, Main Hall',
    type: 'NETWORKING',
    maxAttendees: 100,
    currentAttendees: 67,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600',
    organizer: 'AI Professionals Network',
    organizerId: 'org2',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    foodProvided: true,
    drinksProvided: true
  },
  {
    id: '3',
    title: 'Cloud Architecture & DevOps Bootcamp',
    description: 'Intensive 2-day bootcamp covering cloud architecture principles, DevOps best practices, CI/CD pipelines, and container orchestration with hands-on labs and real-world projects.',
    date: '2024-03-25T09:00:00Z',
    location: 'Online (Zoom)',
    type: 'SEMINAR',
    maxAttendees: 200,
    currentAttendees: 156,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600',
    organizer: 'CloudTech Academy',
    organizerId: 'org3',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    foodProvided: false,
    drinksProvided: false
  },
  {
    id: '4',
    title: 'Spring Hackathon 2024: Build for Good',
    description: '48-hour hackathon focused on creating solutions for social impact. Teams will work on projects addressing environmental, educational, or healthcare challenges with mentorship from industry experts.',
    date: '2024-04-05T18:00:00Z',
    location: 'University Tech Campus, Building C',
    type: 'HACKATHON',
    maxAttendees: 150,
    currentAttendees: 89,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600',
    organizer: 'Student Developer Society',
    organizerId: 'org4',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    foodProvided: true,
    drinksProvided: true
  },
  {
    id: '5',
    title: 'Cybersecurity Fundamentals Workshop',
    description: 'Learn essential cybersecurity concepts, threat detection, and defense strategies. Includes hands-on exercises with penetration testing tools and security audit techniques.',
    date: '2024-04-12T13:00:00Z',
    location: 'Security Institute, Lab 1',
    type: 'WORKSHOP',
    maxAttendees: 30,
    currentAttendees: 24,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600',
    organizer: 'CyberSec Professionals',
    organizerId: 'org5',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    foodProvided: false,
    drinksProvided: true
  }
];

// Mock Jobs Data
export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    description: 'Join our innovative team to build next-generation web applications using React, TypeScript, and modern frontend technologies. You\'ll work on high-impact projects serving millions of users worldwide.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'GraphQL knowledge', 'Testing expertise', 'Agile methodology'],
    location: 'San Francisco, CA',
    type: 'FULL_TIME',
    salary: '$140,000 - $180,000',
    remote: true,
    company: 'TechFlow Inc.',
    companyId: 'comp1',
    postedAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Backend Engineer - Node.js',
    description: 'Build scalable microservices and APIs that power our global platform. Work with cutting-edge technologies including Node.js, Docker, Kubernetes, and cloud infrastructure.',
    requirements: ['3+ years Node.js', 'Database design', 'Microservices architecture', 'Docker/Kubernetes', 'AWS/GCP experience'],
    location: 'New York, NY',
    type: 'FULL_TIME',
    salary: '$120,000 - $160,000',
    remote: false,
    company: 'DataSystems Corp',
    companyId: 'comp2',
    postedAt: '2024-02-18T14:30:00Z',
    updatedAt: '2024-02-18T14:30:00Z'
  },
  {
    id: '3',
    title: 'DevOps Engineer Internship',
    description: 'Learn DevOps practices in a supportive environment. Work with CI/CD pipelines, cloud infrastructure, and automation tools while contributing to real projects.',
    requirements: ['Basic Linux knowledge', 'Git proficiency', 'Interest in cloud platforms', 'Scripting experience', 'Strong problem-solving'],
    location: 'Austin, TX',
    type: 'INTERNSHIP',
    salary: '$25 - $35/hour',
    remote: true,
    company: 'CloudNative Solutions',
    companyId: 'comp3',
    postedAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-02-20T09:15:00Z'
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    description: 'Work across the entire technology stack to deliver complete web solutions. Collaborate with designers, product managers, and other developers in an agile environment.',
    requirements: ['React/Vue.js expertise', 'Node.js/Python backend', 'Database experience', 'RESTful APIs', '2+ years experience'],
    location: 'Seattle, WA',
    type: 'FULL_TIME',
    salary: '$90,000 - $130,000',
    remote: true,
    company: 'StartupTech',
    companyId: 'comp4',
    postedAt: '2024-02-22T11:45:00Z',
    updatedAt: '2024-02-22T11:45:00Z'
  },
  {
    id: '5',
    title: 'AI/ML Engineer',
    description: 'Develop and deploy machine learning models to solve complex business problems. Work with large datasets, implement ML pipelines, and create intelligent systems.',
    requirements: ['Python/R proficiency', 'TensorFlow/PyTorch', 'MLOps experience', 'Statistics knowledge', 'PhD preferred'],
    location: 'Boston, MA',
    type: 'FULL_TIME',
    salary: '$150,000 - $200,000',
    remote: false,
    company: 'AI Innovations Lab',
    companyId: 'comp5',
    postedAt: '2024-02-25T16:20:00Z',
    updatedAt: '2024-02-25T16:20:00Z'
  },
  {
    id: '6',
    title: 'Mobile App Developer - React Native',
    description: 'Create cross-platform mobile applications using React Native. Work on consumer-facing apps with millions of downloads and focus on performance and user experience.',
    requirements: ['React Native expertise', 'iOS/Android development', 'App Store deployment', 'Performance optimization', 'UI/UX understanding'],
    location: 'Los Angeles, CA',
    type: 'CONTRACT',
    salary: '$80 - $120/hour',
    remote: true,
    company: 'Mobile First Agency',
    companyId: 'comp6',
    postedAt: '2024-02-28T12:10:00Z',
    updatedAt: '2024-02-28T12:10:00Z'
  }
];

// Mock Dashboard Data
export const mockDashboardData = {
  projects: mockProjects.slice(0, 4),
  events: mockEvents.slice(0, 3),
  jobs: mockJobs.slice(0, 3)
}; 