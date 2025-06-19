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
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';

const CareerPathPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const careerPaths = [
    {
      id: 'frontend',
      title: 'Frontend Developer',
      icon: Code,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30',
      description: 'Create beautiful, interactive user interfaces and web experiences',
      skills: ['HTML/CSS', 'JavaScript', 'React/Vue', 'TypeScript', 'Responsive Design'],
      roles: ['Junior Frontend Dev', 'Frontend Developer', 'Senior Frontend Dev', 'Frontend Architect'],
      averageSalary: '$75K - $150K',
      demandLevel: 'High'
    },
    {
      id: 'backend',
      title: 'Backend Developer',
      icon: Server,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
      description: 'Build robust server-side applications and APIs that power modern applications',
      skills: ['Node.js/Python', 'APIs/REST', 'Databases', 'Cloud Services', 'System Design'],
      roles: ['Junior Backend Dev', 'Backend Developer', 'Senior Backend Dev', 'Backend Architect'],
      averageSalary: '$80K - $160K',
      demandLevel: 'Very High'
    },
    {
      id: 'fullstack',
      title: 'Full Stack Developer',
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30',
      description: 'Master both frontend and backend development for end-to-end solutions',
      skills: ['Frontend Tech', 'Backend Tech', 'Database Design', 'DevOps Basics', 'System Architecture'],
      roles: ['Junior Full Stack', 'Full Stack Developer', 'Senior Full Stack', 'Tech Lead'],
      averageSalary: '$85K - $170K',
      demandLevel: 'Very High'
    },
    {
      id: 'mobile',
      title: 'Mobile Developer',
      icon: Smartphone,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-600/20',
      borderColor: 'border-indigo-500/30',
      description: 'Create mobile applications for iOS and Android platforms',
      skills: ['React Native/Flutter', 'iOS/Android', 'Mobile UI/UX', 'App Store Deploy', 'Mobile Testing'],
      roles: ['Junior Mobile Dev', 'Mobile Developer', 'Senior Mobile Dev', 'Mobile Architect'],
      averageSalary: '$78K - $155K',
      demandLevel: 'High'
    },
    {
      id: 'devops',
      title: 'DevOps Engineer',
      icon: Settings,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20',
      borderColor: 'border-orange-500/30',
      description: 'Bridge development and operations with automation and infrastructure',
      skills: ['Cloud Platforms', 'Docker/K8s', 'CI/CD', 'Infrastructure as Code', 'Monitoring'],
      roles: ['Junior DevOps', 'DevOps Engineer', 'Senior DevOps', 'Platform Engineer'],
      averageSalary: '$90K - $180K',
      demandLevel: 'Very High'
    },
    {
      id: 'security',
      title: 'Security Engineer',
      icon: Shield,
      color: 'text-red-400',
      bgColor: 'bg-red-600/20',
      borderColor: 'border-red-500/30',
      description: 'Protect systems and data from security threats and vulnerabilities',
      skills: ['Security Frameworks', 'Penetration Testing', 'Risk Assessment', 'Compliance', 'Incident Response'],
      roles: ['Security Analyst', 'Security Engineer', 'Senior Security', 'Security Architect'],
      averageSalary: '$95K - $190K',
      demandLevel: 'Very High'
    },
    {
      id: 'ai-ml',
      title: 'AI/ML Engineer',
      icon: Brain,
      color: 'text-pink-400',
      bgColor: 'bg-pink-600/20',
      borderColor: 'border-pink-500/30',
      description: 'Build intelligent systems using machine learning and artificial intelligence',
      skills: ['Python/R', 'ML Frameworks', 'Data Analysis', 'Neural Networks', 'MLOps'],
      roles: ['ML Engineer', 'Data Scientist', 'Senior ML Engineer', 'AI Research Scientist'],
      averageSalary: '$100K - $200K+',
      demandLevel: 'Extremely High'
    },
    {
      id: 'ux-ui',
      title: 'UX/UI Designer',
      icon: Palette,
      color: 'text-teal-400',
      bgColor: 'bg-teal-600/20',
      borderColor: 'border-teal-500/30',
      description: 'Design user-centered experiences and beautiful interfaces',
      skills: ['Design Tools', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      roles: ['Junior Designer', 'UX/UI Designer', 'Senior Designer', 'Design Lead'],
      averageSalary: '$70K - $140K',
      demandLevel: 'High'
    }
  ];

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
                              {step.skills.map((skill, skillIndex) => (
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerPaths.map((path) => {
            const Icon = path.icon;
            return (
              <Card 
                key={path.id} 
                hover 
                className="cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => setSelectedPath(path.id)}
              >
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CareerPathPage;