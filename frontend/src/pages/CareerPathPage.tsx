import React, { useState } from 'react';
import { 
  Map, 
  ArrowRight, 
  Code, 
  Server, 
  Database, 
  Smartphone,
  Shield, 
  Brain,
  Palette,
  Settings,
  Clock,
  Star,
  CheckCircle,
  Layers,
  BarChart,
  Gamepad2,
  PenTool,
  Users,
  Package,
  Apple,
  Link,
  FileText,
  Cog,
  Target,
  Filter,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';

const CareerPathPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<string>('all');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const careerPaths = [
    {
      id: 'frontend',
      title: 'Frontend',
      icon: Code,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30',
      description: 'Create beautiful, interactive user interfaces and web experiences',
      skills: ['HTML/CSS', 'JavaScript', 'React/Vue', 'TypeScript', 'Responsive Design'],
      roles: ['Junior Frontend Dev', 'Frontend Developer', 'Senior Frontend Dev', 'Frontend Architect'],
      averageSalary: '$75K - $150K',
      demandLevel: 'High',
      category: 'Development',
      salaryMin: 75000,
      salaryMax: 150000
    },
    {
      id: 'backend',
      title: 'Backend',
      icon: Server,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
      description: 'Build robust server-side applications and APIs that power modern applications',
      skills: ['Node.js/Python', 'APIs/REST', 'Databases', 'Cloud Services', 'System Design'],
      roles: ['Junior Backend Dev', 'Backend Developer', 'Senior Backend Dev', 'Backend Architect'],
      averageSalary: '$80K - $160K',
      demandLevel: 'Very High',
      category: 'Development',
      salaryMin: 80000,
      salaryMax: 160000
    },
    {
      id: 'devops',
      title: 'DevOps',
      icon: Settings,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20',
      borderColor: 'border-orange-500/30',
      description: 'Bridge development and operations with automation and infrastructure',
      skills: ['Cloud Platforms', 'Docker/K8s', 'CI/CD', 'Infrastructure as Code', 'Monitoring'],
      roles: ['Junior DevOps', 'DevOps Engineer', 'Senior DevOps', 'Platform Engineer'],
      averageSalary: '$90K - $180K',
      demandLevel: 'Very High',
      category: 'Operations',
      salaryMin: 90000,
      salaryMax: 180000
    },
    {
      id: 'fullstack',
      title: 'Full Stack',
      icon: Layers,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30',
      description: 'Master both frontend and backend development for end-to-end solutions',
      skills: ['Frontend Tech', 'Backend Tech', 'Database Design', 'DevOps Basics', 'System Architecture'],
      roles: ['Junior Full Stack', 'Full Stack Developer', 'Senior Full Stack', 'Tech Lead'],
      averageSalary: '$85K - $170K',
      demandLevel: 'Very High',
      category: 'Development',
      salaryMin: 85000,
      salaryMax: 170000
    },
    {
      id: 'ai-engineer',
      title: 'AI Engineer',
      icon: Brain,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-600/20',
      borderColor: 'border-cyan-500/30',
      description: 'Build intelligent systems using artificial intelligence and machine learning',
      skills: ['Python/R', 'ML Frameworks', 'Deep Learning', 'Neural Networks', 'AI Deployment'],
      roles: ['AI Engineer', 'Senior AI Engineer', 'AI Architect', 'AI Research Lead'],
      averageSalary: '$110K - $220K+',
      demandLevel: 'Extremely High',
      category: 'AI & Data',
      salaryMin: 110000,
      salaryMax: 220000
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      icon: BarChart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      description: 'Transform data into actionable insights for business decision making',
      skills: ['SQL', 'Excel/Sheets', 'Data Visualization', 'Statistics', 'Business Intelligence'],
      roles: ['Junior Data Analyst', 'Data Analyst', 'Senior Data Analyst', 'Analytics Manager'],
      averageSalary: '$65K - $120K',
      demandLevel: 'High',
      category: 'AI & Data',
      salaryMin: 65000,
      salaryMax: 120000
    },
    {
      id: 'data-scientist',
      title: 'AI and Data Scientist',
      icon: Brain,
      color: 'text-pink-400',
      bgColor: 'bg-pink-600/20',
      borderColor: 'border-pink-500/30',
      description: 'Apply AI and advanced analytics to solve complex business problems',
      skills: ['Python/R', 'Machine Learning', 'Statistics', 'Data Mining', 'AI Algorithms'],
      roles: ['Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist', 'Chief Data Officer'],
      averageSalary: '$100K - $200K+',
      demandLevel: 'Extremely High',
      category: 'AI & Data',
      salaryMin: 100000,
      salaryMax: 200000
    },
    {
      id: 'android-developer',
      title: 'Android Developer',
      icon: Smartphone,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
      description: 'Create native Android applications using Kotlin and modern Android SDK',
      skills: ['Kotlin/Java', 'Android SDK', 'Material Design', 'Android Architecture', 'Google Play'],
      roles: ['Junior Android Dev', 'Android Developer', 'Senior Android Dev', 'Android Architect'],
      averageSalary: '$75K - $150K',
      demandLevel: 'High',
      category: 'Mobile',
      salaryMin: 75000,
      salaryMax: 150000
    },
    {
      id: 'ios-developer',
      title: 'IOS Developer',
      icon: Apple,
      color: 'text-gray-400',
      bgColor: 'bg-gray-600/20',
      borderColor: 'border-gray-500/30',
      description: 'Build native iOS applications using Swift and iOS frameworks',
      skills: ['Swift/Objective-C', 'iOS SDK', 'UIKit/SwiftUI', 'iOS Architecture', 'App Store'],
      roles: ['Junior iOS Dev', 'iOS Developer', 'Senior iOS Dev', 'iOS Architect'],
      averageSalary: '$80K - $160K',
      demandLevel: 'High',
      category: 'Mobile',
      salaryMin: 80000,
      salaryMax: 160000
    },
    {
      id: 'blockchain-developer',
      title: 'Blockchain Developer',
      icon: Link,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      description: 'Develop decentralized applications and smart contracts on blockchain platforms',
      skills: ['Solidity', 'Web3.js', 'Smart Contracts', 'DeFi', 'Cryptocurrency'],
      roles: ['Blockchain Dev', 'Smart Contract Dev', 'Senior Blockchain Dev', 'Blockchain Architect'],
      averageSalary: '$90K - $180K',
      demandLevel: 'Very High',
      category: 'Development',
      salaryMin: 90000,
      salaryMax: 180000
    },
    {
      id: 'qa-engineer',
      title: 'QA Engineer',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30',
      description: 'Ensure software quality through testing, automation, and quality processes',
      skills: ['Test Automation', 'Manual Testing', 'Selenium', 'API Testing', 'Performance Testing'],
      roles: ['QA Tester', 'QA Engineer', 'Senior QA Engineer', 'QA Manager'],
      averageSalary: '$60K - $120K',
      demandLevel: 'High',
      category: 'Quality',
      salaryMin: 60000,
      salaryMax: 120000
    },
    {
      id: 'software-architect',
      title: 'Software Architect',
      icon: Package,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-600/20',
      borderColor: 'border-indigo-500/30',
      description: 'Design high-level software structure and make critical technical decisions',
      skills: ['System Design', 'Architecture Patterns', 'Scalability', 'Technology Strategy', 'Leadership'],
      roles: ['Senior Developer', 'Lead Developer', 'Software Architect', 'Principal Architect'],
      averageSalary: '$120K - $250K+',
      demandLevel: 'Very High',
      category: 'Architecture',
      salaryMin: 120000,
      salaryMax: 250000
    },
    {
      id: 'cyber-security',
      title: 'Cyber Security Engineer',
      icon: Shield,
      color: 'text-red-400',
      bgColor: 'bg-red-600/20',
      borderColor: 'border-red-500/30',
      description: 'Protect systems and data from cyber threats and security vulnerabilities',
      skills: ['Security Frameworks', 'Penetration Testing', 'Risk Assessment', 'Compliance', 'Incident Response'],
      roles: ['Security Analyst', 'Security Engineer', 'Senior Security Engineer', 'Security Architect'],
      averageSalary: '$95K - $190K',
      demandLevel: 'Very High',
      category: 'Security',
      salaryMin: 95000,
      salaryMax: 190000
    },
    {
      id: 'ux-design',
      title: 'UX Design',
      icon: Palette,
      color: 'text-teal-400',
      bgColor: 'bg-teal-600/20',
      borderColor: 'border-teal-500/30',
      description: 'Design user-centered experiences and beautiful interfaces',
      skills: ['Design Tools', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      roles: ['Junior UX Designer', 'UX Designer', 'Senior UX Designer', 'Design Lead'],
      averageSalary: '$70K - $140K',
      demandLevel: 'High',
      category: 'Design',
      salaryMin: 70000,
      salaryMax: 140000
    },
    {
      id: 'game-developer',
      title: 'Game Developer',
      icon: Gamepad2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30',
      description: 'Create engaging games for various platforms using game engines and frameworks',
      skills: ['Unity/Unreal', 'C#/C++', 'Game Physics', '3D Graphics', 'Game Design'],
      roles: ['Junior Game Dev', 'Game Developer', 'Senior Game Dev', 'Lead Game Developer'],
      averageSalary: '$70K - $140K',
      demandLevel: 'High',
      category: 'Gaming',
      salaryMin: 70000,
      salaryMax: 140000
    },
    {
      id: 'technical-writer',
      title: 'Technical Writer',
      icon: FileText,
      color: 'text-slate-400',
      bgColor: 'bg-slate-600/20',
      borderColor: 'border-slate-500/30',
      description: 'Create clear technical documentation, guides, and educational content',
      skills: ['Technical Writing', 'Documentation Tools', 'API Documentation', 'Content Strategy', 'Communication'],
      roles: ['Technical Writer', 'Senior Technical Writer', 'Documentation Lead', 'Content Manager'],
      averageSalary: '$60K - $110K',
      demandLevel: 'High',
      category: 'Content',
      salaryMin: 60000,
      salaryMax: 110000
    },
    {
      id: 'mlops',
      title: 'MLOps',
      icon: Cog,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20',
      borderColor: 'border-orange-500/30',
      description: 'Deploy and manage machine learning models in production environments',
      skills: ['ML Deployment', 'Docker/K8s', 'CI/CD for ML', 'Model Monitoring', 'Cloud Platforms'],
      roles: ['MLOps Engineer', 'Senior MLOps Engineer', 'ML Platform Engineer', 'ML Infrastructure Lead'],
      averageSalary: '$100K - $180K',
      demandLevel: 'Very High',
      category: 'Operations',
      salaryMin: 100000,
      salaryMax: 180000
    },
    {
      id: 'engineering-manager',
      title: 'Engineering Manager',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30',
      description: 'Lead engineering teams and drive technical strategy and execution',
      skills: ['Leadership', 'Team Management', 'Technical Strategy', 'Project Management', 'Communication'],
      roles: ['Team Lead', 'Engineering Manager', 'Senior Engineering Manager', 'VP of Engineering'],
      averageSalary: '$130K - $250K+',
      demandLevel: 'High',
      category: 'Management',
      salaryMin: 130000,
      salaryMax: 250000
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      icon: PenTool,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
      description: 'Drive product strategy, roadmap, and coordinate cross-functional teams',
      skills: ['Product Strategy', 'Market Research', 'Data Analysis', 'Stakeholder Management', 'Agile/Scrum'],
      roles: ['Associate PM', 'Product Manager', 'Senior Product Manager', 'VP of Product'],
      averageSalary: '$100K - $200K+',
      demandLevel: 'Very High',
      category: 'Management',
      salaryMin: 100000,
      salaryMax: 200000
    }
  ];

  // Filtering logic
  const getFilteredPaths = () => {
    return careerPaths.filter(path => {
      // Search query filter
      const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           path.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

      // Demand level filter
      const matchesDemand = selectedDemand === 'all' || path.demandLevel === selectedDemand;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || path.category === selectedCategory;

      // Salary range filter
      const matchesSalary = (() => {
        if (selectedSalaryRange === 'all') return true;
        const [min, max] = selectedSalaryRange.split('-').map(x => parseInt(x) * 1000);
        return path.salaryMin >= min && (max ? path.salaryMax <= max : true);
      })();

      return matchesSearch && matchesDemand && matchesCategory && matchesSalary;
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDemand('all');
    setSelectedSalaryRange('all');
    setSelectedCategory('all');
  };

  const getLearningPath = (pathId: string) => {
    const learningPaths: Record<string, any[]> = {
      frontend: [
        { 
          phase: 'Foundation', 
          duration: '2-3 months',
          skills: ['HTML5 & CSS3', 'JavaScript Fundamentals', 'Responsive Design', 'Git/GitHub'],
          completed: true 
        },
        { 
          phase: 'Framework Mastery', 
          duration: '3-4 months',
          skills: ['React/Vue.js', 'State Management', 'Component Architecture', 'TypeScript'],
          completed: false 
        },
        { 
          phase: 'Advanced Topics', 
          duration: '2-3 months',
          skills: ['Performance Optimization', 'Testing', 'Build Tools', 'Progressive Web Apps'],
          completed: false 
        },
        { 
          phase: 'Professional Skills', 
          duration: '2-3 months',
          skills: ['Code Reviews', 'Agile Development', 'Collaboration', 'Portfolio Building'],
          completed: false 
        }
      ],
      backend: [
        { 
          phase: 'Programming Foundation', 
          duration: '2-3 months',
          skills: ['Programming Language', 'Data Structures', 'Algorithms', 'Git/GitHub'],
          completed: true 
        },
        { 
          phase: 'Web Development', 
          duration: '3-4 months',
          skills: ['Web Frameworks', 'RESTful APIs', 'Database Fundamentals', 'Authentication'],
          completed: false 
        },
        { 
          phase: 'Advanced Backend', 
          duration: '3-4 months',
          skills: ['Microservices', 'Caching', 'Message Queues', 'Performance Tuning'],
          completed: false 
        },
        { 
          phase: 'Production Ready', 
          duration: '2-3 months',
          skills: ['Deployment', 'Monitoring', 'Security', 'Scalability'],
          completed: false 
        }
      ],
      'ai-engineer': [
        { 
          phase: 'AI Fundamentals', 
          duration: '3-4 months',
          skills: ['Python Programming', 'Mathematics & Statistics', 'Machine Learning Basics', 'Data Analysis'],
          completed: true 
        },
        { 
          phase: 'Deep Learning', 
          duration: '4-5 months',
          skills: ['Neural Networks', 'TensorFlow/PyTorch', 'Computer Vision', 'NLP'],
          completed: false 
        },
        { 
          phase: 'AI Engineering', 
          duration: '3-4 months',
          skills: ['Model Deployment', 'MLOps', 'AI Ethics', 'Production Systems'],
          completed: false 
        }
      ],
      'data-scientist': [
        { 
          phase: 'Data Foundation', 
          duration: '2-3 months',
          skills: ['Python/R', 'Statistics', 'SQL', 'Data Visualization'],
          completed: true 
        },
        { 
          phase: 'Machine Learning', 
          duration: '3-4 months',
          skills: ['ML Algorithms', 'Feature Engineering', 'Model Evaluation', 'Scikit-learn'],
          completed: false 
        },
        { 
          phase: 'Advanced Analytics', 
          duration: '3-4 months',
          skills: ['Deep Learning', 'Time Series', 'A/B Testing', 'Business Intelligence'],
          completed: false 
        }
      ],
      devops: [
        { 
          phase: 'Infrastructure Basics', 
          duration: '2-3 months',
          skills: ['Linux/Unix', 'Networking', 'Cloud Platforms', 'Git/GitHub'],
          completed: true 
        },
        { 
          phase: 'Automation & CI/CD', 
          duration: '3-4 months',
          skills: ['Docker', 'CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring'],
          completed: false 
        },
        { 
          phase: 'Advanced DevOps', 
          duration: '3-4 months',
          skills: ['Kubernetes', 'Security', 'Scalability', 'Performance Optimization'],
          completed: false 
        }
      ]
    };
    
    return learningPaths[pathId] || learningPaths.frontend;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Map className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Career Path Explorer</h1>
        </div>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Discover your perfect tech career path with interactive roadmaps, skill requirements, 
          and step-by-step learning guides tailored to industry demands.
        </p>
      </div>

      {/* Search and Filters */}
      {!selectedPath && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search career paths, skills, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {(selectedDemand !== 'all' || selectedSalaryRange !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Categories</option>
                  <option value="Development">Development</option>
                  <option value="AI & Data">AI & Data</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality">Quality</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Security">Security</option>
                  <option value="Design">Design</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Content">Content</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              {/* Demand Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Demand Level</label>
                <select
                  value={selectedDemand}
                  onChange={(e) => setSelectedDemand(e.target.value)}
                  className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Levels</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                  <option value="Extremely High">Extremely High</option>
                </select>
              </div>

              {/* Salary Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                <select
                  value={selectedSalaryRange}
                  onChange={(e) => setSelectedSalaryRange(e.target.value)}
                  className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Ranges</option>
                  <option value="60-80">$60K - $80K</option>
                  <option value="80-100">$80K - $100K</option>
                  <option value="100-150">$100K - $150K</option>
                  <option value="150-200">$150K - $200K</option>
                  <option value="200">$200K+</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {getFilteredPaths().length} of {careerPaths.length} career paths
          </div>
        </div>
      )}

      {selectedPath ? (
        /* Detailed Path View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPath(null)}
              className="flex items-center space-x-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Back to All Paths</span>
            </Button>
          </div>

          {(() => {
            const path = careerPaths.find(p => p.id === selectedPath);
            if (!path) return null;
            
            const Icon = path.icon;
            const learningSteps = getLearningPath(selectedPath);

            return (
              <div className="space-y-6">
                {/* Path Overview */}
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`p-4 rounded-lg ${path.bgColor} border ${path.borderColor}`}>
                        <Icon className={`h-8 w-8 ${path.color}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{path.title}</h2>
                        <p className="text-gray-300">{path.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-white">{path.averageSalary}</div>
                        <div className="text-sm text-gray-400">Average Salary</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-white">{path.demandLevel}</div>
                        <div className="text-sm text-gray-400">Market Demand</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-white">6-12 mo</div>
                        <div className="text-sm text-gray-400">Time to Job Ready</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Roadmap */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold text-white">Learning Roadmap</h3>
                    <p className="text-gray-300">Step-by-step guide to becoming a {path.title}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {learningSteps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.completed 
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-700 text-gray-400 border border-gray-600'
                            }`}>
                              {step.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{step.phase}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{step.duration}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {step.skills.map((skill: string, skillIndex: number) => (
                                <span
                                  key={skillIndex}
                                  className={`px-3 py-1 text-xs rounded-full ${
                                    step.completed
                                      ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                                      : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Career Progression */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold text-white">Career Progression</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                      {path.roles.map((role, index) => (
                        <React.Fragment key={index}>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-blue-400 font-bold">{index + 1}</span>
                            </div>
                            <div className="font-medium text-white">{role}</div>
                            <div className="text-sm text-gray-400">
                              {index === 0 && '0-2 years'}
                              {index === 1 && '2-5 years'}
                              {index === 2 && '5-8 years'}
                              {index === 3 && '8+ years'}
                            </div>
                          </div>
                          {index < path.roles.length - 1 && (
                            <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Career Paths Grid */
        <div className="space-y-6">
          {getFilteredPaths().length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredPaths().map((path) => {
            const Icon = path.icon;
            return (
              <div 
                key={path.id} 
                className="cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => setSelectedPath(path.id)}
              >
                <Card hover>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${path.bgColor} border ${path.borderColor}`}>
                        <Icon className={`h-6 w-6 ${path.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{path.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            path.demandLevel === 'Extremely High' ? 'bg-red-600/20 text-red-300 border border-red-500/30' :
                            path.demandLevel === 'Very High' ? 'bg-orange-600/20 text-orange-300 border border-orange-500/30' :
                            'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {path.demandLevel} Demand
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300">{path.description}</p>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-2">Key Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {path.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded border border-gray-600"
                            >
                              {skill}
                            </span>
                          ))}
                          {path.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded border border-gray-600">
                              +{path.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Avg. Salary:</span>
                        <span className="font-medium text-white">{path.averageSalary}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Star className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 2) + 4}.{Math.floor(Math.random() * 9)} rating</span>
                      </div>
                      <Button size="sm" className="flex items-center space-x-1">
                        <span>Explore Path</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </div>
            );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No career paths found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your search criteria or filters to find more results.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerPathPage;