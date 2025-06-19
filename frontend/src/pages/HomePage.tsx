import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Users, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  Github,
  ExternalLink,
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  Award,
  Zap,
  Target,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Project, Event, Job } from '../types';
import { getDashboardData } from '../services/api';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const data = await getDashboardData();
        setProjects(data.projects);
        setEvents(data.events);
        setJobs(data.jobs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const features = [
    {
      icon: GraduationCap,
      title: 'For Students',
      description: 'Build your portfolio, get expert feedback, and land your dream tech job',
      items: ['Project Portfolio', 'Career Guidance', 'Internship Opportunities', 'Peer Feedback'],
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: Users,
      title: 'For IT Professionals',
      description: 'Share expertise, mentor rising talent, and advance your career',
      items: ['Skill Showcase', 'Workshop Creation', 'Job Applications', 'Professional Network'],
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30'
    },
    {
      icon: Building2,
      title: 'For Companies',
      description: 'Discover top talent, build your brand, and grow your tech team',
      items: ['Talent Acquisition', 'Event Hosting', 'Brand Building', 'Community Engagement'],
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Students', icon: GraduationCap },
    { number: '2.5K+', label: 'IT Professionals', icon: Users },
    { number: '500+', label: 'Partner Companies', icon: Building2 },
    { number: '15K+', label: 'Projects Shared', icon: Code }
  ];

  // Format helper functions for the display data
  const formatProjectsForDisplay = (projects: Project[]) => {
    return projects.map(project => ({
      title: project.title,
      author: project.author,
      technologies: project.technologies.slice(0, 3),
      image: project.imageUrl || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      views: Math.floor(Math.random() * 300) + 100,
      stars: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 5
    }));
  };

  const formatEventsForDisplay = (events: Event[]) => {
    return events.map(event => {
      const date = new Date(event.date);
      return {
        title: event.title,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        attendees: event.currentAttendees,
        maxAttendees: event.maxAttendees || 100,
        type: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        organizer: event.organizer
      };
    });
  };

  const formatJobsForDisplay = (jobs: Job[]) => {
    return jobs.map(job => {
      const postedDate = new Date(job.postedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - postedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let postedText = '';
      if (diffDays === 1) postedText = '1 day ago';
      else if (diffDays < 7) postedText = `${diffDays} days ago`;
      else if (diffDays < 30) postedText = `${Math.floor(diffDays / 7)} weeks ago`;
      else postedText = `${Math.floor(diffDays / 30)} months ago`;

      return {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type.charAt(0).toUpperCase() + job.type.slice(1),
        salary: job.salary || 'Competitive',
        remote: job.remote,
        posted: postedText
      };
    });
  };

  const careerPaths = [
    {
      title: 'Frontend Developer',
      icon: Code,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript'],
      salary: '$75K-150K',
      demand: 'High'
    },
    {
      title: 'Backend Developer',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      skills: ['Node.js', 'Python', 'Databases', 'APIs'],
      salary: '$80K-160K',
      demand: 'Very High'
    },
    {
      title: 'DevOps Engineer',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      salary: '$90K-180K',
      demand: 'Extremely High'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                <Code className="h-8 w-8 text-blue-200" />
              </div>
              <span className="text-3xl font-bold">ITCommunity</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Where Tech Careers
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                Take Flight
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Join 13,000+ students, professionals, and companies building the future of technology together. 
              Share projects, learn skills, find opportunities, and grow your career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Icon className="h-6 w-6 text-blue-200 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Discover Amazing Projects
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our community is building. Get inspired, provide feedback, and showcase your own work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-700"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded mb-3 w-1/2"></div>
                    <div className="flex gap-1 mb-4">
                      <div className="h-6 bg-gray-700 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              formatProjectsForDisplay(projects).map((project, index) => (
                <Card key={index} hover className="overflow-hidden">
                  <div className="aspect-video bg-gray-700 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">by {project.author}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{project.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{project.stars}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{project.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button size="lg" className="px-8">
                <Code className="mr-2 h-5 w-5" />
                Share Your Project
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Learn & Network at Events
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join workshops, bootcamps, and networking events to accelerate your career growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {formatEventsForDisplay(events).map((event, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">by {event.organizer}</p>
                    </div>
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                      {event.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{event.attendees}/{event.maxAttendees} attendees</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="px-8">
                <Calendar className="mr-2 h-5 w-5" />
                Browse All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Find Your Dream Job
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover opportunities from top tech companies and startups looking for talent like you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {formatJobsForDisplay(jobs).map((job, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                      <p className="text-blue-400 font-medium mb-2">{job.company}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      job.type === 'Internship' 
                        ? 'bg-green-600/20 text-green-300 border-green-500/30'
                        : 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {job.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{job.location}</span>
                      {job.remote && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded border border-purple-500/30">
                          Remote
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button size="lg" className="px-8">
                <Briefcase className="mr-2 h-5 w-5" />
                Explore All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Career Paths Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Chart Your Career Path
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Interactive roadmaps to guide your journey from beginner to expert in your chosen tech field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {careerPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <Card key={index} hover>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 rounded-lg ${path.bgColor} border border-gray-600`}>
                        <Icon className={`h-6 w-6 ${path.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                        <p className="text-sm text-gray-400">Demand: {path.demand}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-300 mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {path.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded border border-gray-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-300">Avg. Salary:</span>
                      <span className="font-semibold text-white">{path.salary}</span>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Target className="mr-2 h-4 w-4" />
                      View Roadmap
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="px-8">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore All Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Stage of Your Tech Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you're starting out, advancing your career, or building a team, 
              we have the tools and community to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover className="text-center">
                  <CardContent className="p-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-lg mb-6 border ${feature.borderColor}`}>
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 mb-6">{feature.description}</p>
                    <ul className="space-y-2 mb-8">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center justify-center text-gray-300">
                          <Star className={`h-4 w-4 ${feature.color} mr-2`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/signup?role=${feature.title.toLowerCase().includes('student') ? 'student' : feature.title.toLowerCase().includes('professional') ? 'professional' : 'company'}`}>
                      <Button className="w-full">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Award className="h-16 w-16 text-blue-200 mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Accelerate Your Tech Career?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of tech professionals who are already growing their careers with ITCommunity. 
              Start building, learning, and connecting today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-4 text-lg font-semibold">
                <Rocket className="mr-2 h-5 w-5" />
                Join Free Today
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-blue-200">
            ✨ Free forever • No credit card required • Join in 30 seconds
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;