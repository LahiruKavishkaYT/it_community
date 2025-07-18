import { Project, Event, Job } from '../types';

// Mock Learning Projects for Frontend Path
export const mockFrontendLearningProjects: Project[] = [
  {
    id: 'frontend-1',
    title: 'Responsive Portfolio Website',
    description: 'Build a modern, responsive portfolio website using HTML5, CSS3, and vanilla JavaScript. Learn semantic HTML structure, CSS Grid, Flexbox, responsive design principles, and basic DOM manipulation. Perfect for beginners to understand web fundamentals.',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    githubUrl: 'https://github.com/learn-frontend/portfolio-starter',
    liveUrl: 'https://frontend-portfolio-demo.netlify.app',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600',
    author: 'Frontend Mentor',
    authorId: 'mentor1',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'Static website using semantic HTML5 structure, CSS3 with mobile-first responsive design, and vanilla JavaScript for interactive elements like smooth scrolling and form validation.',
    learningObjectives: [
      'Master HTML5 semantic elements and accessibility',
      'Learn CSS Grid and Flexbox layout systems',
      'Implement responsive design with media queries',
      'Practice DOM manipulation with vanilla JavaScript',
      'Understand web performance optimization basics'
    ],
    keyFeatures: [
      'Mobile-first responsive design',
      'Smooth scrolling navigation',
      'Contact form with validation',
      'CSS animations and transitions',
      'Optimized images and performance'
    ],
    createdAt: '2024-01-10T08:00:00Z',
    feedback: [
      {
        id: 'fb1',
        authorId: 'student1',
        authorName: 'John Doe',
        content: 'Great starter project! Really helped me understand CSS Grid and Flexbox. The step-by-step guide is excellent.',
        rating: 5,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'fb2',
        authorId: 'student2',
        authorName: 'Jane Smith',
        content: 'Perfect for beginners. The responsive design challenges really pushed me to think about mobile users.',
        rating: 4,
        createdAt: '2024-01-18T14:20:00Z'
      }
    ]
  },
  {
    id: 'frontend-2',
    title: 'Interactive Todo App with React',
    description: 'Create a fully functional todo application using React hooks, local storage, and modern JavaScript. Learn component composition, state management, event handling, and data persistence. Includes filtering, editing, and drag-and-drop functionality.',
    technologies: ['React', 'JavaScript ES6+', 'CSS Modules', 'Local Storage', 'React Hooks'],
    githubUrl: 'https://github.com/learn-frontend/react-todo-advanced',
    liveUrl: 'https://react-todo-learning.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600',
    author: 'React Academy',
    authorId: 'mentor2',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'React single-page application using functional components and hooks. State management with useState and useEffect, data persistence with localStorage, and modular CSS for styling.',
    learningObjectives: [
      'Master React functional components and hooks',
      'Learn state management patterns in React',
      'Implement CRUD operations in frontend',
      'Practice event handling and form management',
      'Understand component lifecycle and side effects'
    ],
    keyFeatures: [
      'Add, edit, and delete todos',
      'Mark todos as complete/incomplete',
      'Filter todos by status',
      'Drag and drop reordering',
      'Data persistence with localStorage',
      'Responsive design for mobile and desktop'
    ],
    createdAt: '2024-01-12T10:00:00Z',
    feedback: [
      {
        id: 'fb3',
        authorId: 'student3',
        authorName: 'Mike Johnson',
        content: 'Excellent project for learning React hooks! The drag-and-drop feature was challenging but rewarding.',
        rating: 5,
        createdAt: '2024-01-20T09:15:00Z'
      }
    ]
  },
  {
    id: 'frontend-3',
    title: 'Weather Dashboard with API Integration',
    description: 'Build a comprehensive weather dashboard that fetches real-time data from weather APIs. Learn async JavaScript, API integration, error handling, and dynamic UI updates. Includes geolocation, search functionality, and weather visualizations.',
    technologies: ['JavaScript ES6+', 'Fetch API', 'CSS3', 'Chart.js', 'Weather API'],
    githubUrl: 'https://github.com/learn-frontend/weather-dashboard',
    liveUrl: 'https://weather-learn-app.github.io',
    imageUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=600',
    author: 'API Masters',
    authorId: 'mentor3',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'Vanilla JavaScript application with modular architecture. Uses Fetch API for weather data, Chart.js for data visualization, and CSS3 for responsive design and animations.',
    learningObjectives: [
      'Master asynchronous JavaScript and Promises',
      'Learn API integration and error handling',
      'Practice data visualization with Chart.js',
      'Implement geolocation and browser APIs',
      'Handle dynamic content updates and loading states'
    ],
    keyFeatures: [
      'Current weather and 5-day forecast',
      'City search with autocomplete',
      'Geolocation-based weather',
      'Weather charts and graphs',
      'Favorite locations management',
      'Dark/light theme toggle'
    ],
    createdAt: '2024-01-14T12:00:00Z',
    feedback: [
      {
        id: 'fb4',
        authorId: 'student4',
        authorName: 'Sarah Wilson',
        content: 'Great project for understanding API calls and async JavaScript. The error handling examples were very helpful.',
        rating: 4,
        createdAt: '2024-01-22T16:45:00Z'
      }
    ]
  },
  {
    id: 'frontend-4',
    title: 'E-commerce Product Catalog with TypeScript',
    description: 'Develop a modern e-commerce product catalog using TypeScript, React, and modern state management. Learn type safety, component architecture, state management with Context API, and advanced React patterns. Includes filtering, sorting, and shopping cart functionality.',
    technologies: ['TypeScript', 'React', 'Context API', 'CSS-in-JS', 'React Router'],
    githubUrl: 'https://github.com/learn-frontend/typescript-ecommerce',
    liveUrl: 'https://ts-ecommerce-demo.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600',
    author: 'TypeScript Pros',
    authorId: 'mentor4',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'TypeScript React application with strict type checking. Uses Context API for global state management, React Router for navigation, and styled-components for CSS-in-JS styling.',
    learningObjectives: [
      'Master TypeScript with React development',
      'Learn advanced React patterns and hooks',
      'Implement global state management with Context API',
      'Practice component composition and reusability',
      'Understand type-safe development workflows'
    ],
    keyFeatures: [
      'Product listing with pagination',
      'Advanced filtering and sorting',
      'Shopping cart functionality',
      'Product detail pages',
      'Search with real-time results',
      'Responsive design with CSS-in-JS'
    ],
    createdAt: '2024-01-16T14:30:00Z',
    feedback: [
      {
        id: 'fb5',
        authorId: 'student5',
        authorName: 'Alex Chen',
        content: 'Challenging but excellent for learning TypeScript with React. The type safety really helped catch bugs early.',
        rating: 5,
        createdAt: '2024-01-25T11:20:00Z'
      }
    ]
  }
];

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

// Mock Learning Projects for Backend Path
export const mockBackendLearningProjects: Project[] = [
  {
    id: 'backend-1',
    title: 'RESTful API with Node.js and Express',
    description: 'Build a complete RESTful API using Node.js, Express, and MongoDB. Learn server-side development, database integration, authentication with JWT, input validation, error handling, and API documentation with Swagger.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Swagger'],
    githubUrl: 'https://github.com/learn-backend/nodejs-api-starter',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600',
    author: 'Backend Academy',
    authorId: 'backend-mentor1',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'RESTful API architecture with Express.js middleware, MongoDB for data persistence, JWT for authentication, and comprehensive error handling and logging.',
    learningObjectives: [
      'Master Node.js and Express.js fundamentals',
      'Learn MongoDB integration and schema design',
      'Implement JWT authentication and authorization',
      'Practice RESTful API design principles',
      'Understand middleware and error handling patterns'
    ],
    keyFeatures: [
      'Complete CRUD operations',
      'User authentication and authorization',
      'Input validation and sanitization',
      'Error handling and logging',
      'API documentation with Swagger',
      'Database relationships and indexing'
    ],
    createdAt: '2024-01-11T08:00:00Z',
    feedback: []
  },
  {
    id: 'backend-2',
    title: 'GraphQL API with Apollo Server',
    description: 'Create a modern GraphQL API using Apollo Server, TypeScript, and PostgreSQL. Learn schema-first development, resolvers, data loaders, subscriptions, and performance optimization techniques.',
    technologies: ['GraphQL', 'Apollo Server', 'TypeScript', 'PostgreSQL', 'Prisma'],
    githubUrl: 'https://github.com/learn-backend/graphql-apollo-starter',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600',
    author: 'GraphQL Masters',
    authorId: 'backend-mentor2',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'GraphQL API with Apollo Server, TypeScript for type safety, PostgreSQL with Prisma ORM, data loaders for performance optimization, and subscription support for real-time features.',
    learningObjectives: [
      'Master GraphQL schema design and resolvers',
      'Learn Apollo Server and ecosystem tools',
      'Implement type-safe development with TypeScript',
      'Practice database design with PostgreSQL',
      'Understand performance optimization with data loaders'
    ],
    keyFeatures: [
      'Type-safe GraphQL schema',
      'Complex data relationships',
      'Real-time subscriptions',
      'Performance optimization',
      'Authentication and authorization',
      'Comprehensive testing suite'
    ],
    createdAt: '2024-01-13T10:00:00Z',
    feedback: []
  }
];

// Mock Learning Projects for DevOps Path
export const mockDevOpsLearningProjects: Project[] = [
  {
    id: 'devops-1',
    title: 'CI/CD Pipeline with Docker and GitHub Actions',
    description: 'Set up a complete CI/CD pipeline using Docker containers, GitHub Actions, and AWS deployment. Learn containerization, automated testing, deployment strategies, and infrastructure as code.',
    technologies: ['Docker', 'GitHub Actions', 'AWS', 'Terraform', 'Kubernetes'],
    githubUrl: 'https://github.com/learn-devops/cicd-pipeline-starter',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600',
    author: 'DevOps Experts',
    authorId: 'devops-mentor1',
    projectType: 'PRACTICE_PROJECT',
    architecture: 'Complete CI/CD pipeline with Docker containerization, GitHub Actions for automation, Terraform for infrastructure as code, and Kubernetes for orchestration.',
    learningObjectives: [
      'Master Docker containerization and best practices',
      'Learn CI/CD pipeline design and implementation',
      'Practice infrastructure as code with Terraform',
      'Understand Kubernetes orchestration',
      'Implement monitoring and logging solutions'
    ],
    keyFeatures: [
      'Automated build and test pipeline',
      'Docker containerization',
      'Infrastructure as code',
      'Kubernetes deployment',
      'Monitoring and alerting',
      'Security scanning and compliance'
    ],
    createdAt: '2024-01-15T12:00:00Z',
    feedback: []
  }
];

// Mock Dashboard Data
export const mockDashboardData = {
  projects: mockProjects.slice(0, 4),
  events: mockEvents.slice(0, 3),
  jobs: mockJobs.slice(0, 3)
};