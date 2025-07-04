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
import { HoverEffect } from '../components/UI/HoverEffect';
import { GlowCard } from '../components/UI/SpotlightCard';
import { UserJourneyPricing } from '../components/UI/UserJourneyPricing';
import { Project, Event, Job } from '../types';
import { getHomepageData } from '../services/api';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchHomepageData = async () => {
      setIsLoading(true);
      try {
        const data = await getHomepageData();
        setProjects(data.projects);
        setEvents(data.events);
        setJobs(data.jobs);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageData();
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

  // Format projects for HoverEffect component
  const formatProjectsForHoverEffect = (projects: Project[]) => {
    return projects.slice(0, 6).map(project => ({
      title: project.title,
      description: `${project.description.substring(0, 120)}...`,
      link: `/projects/${project.id}`,
      imageUrl: project.imageUrl || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250',
      technologies: project.technologies
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
                  type: event.type.charAt(0).toUpperCase() + event.type.slice(1).toLowerCase(),
                          organizer: typeof event.organizer === 'string' ? event.organizer : (event.organizer as any)?.name || 'Unknown Organizer'
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
              Achieve Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                IT Goals
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              From learning your first programming language to landing your dream tech job. 
              We provide the roadmap, community, and opportunities to turn your IT aspirations into reality.
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

      {/* How We Help You Achieve Your IT Goals */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-green-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How We Help You Achieve Your IT Goals
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Four proven pathways to build skills, gain recognition, and land your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Build & Showcase */}
            <GlowCard 
              glowColor="blue" 
              customSize={true}
              className="h-full min-h-[400px] bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Build & Showcase
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Share your projects, get expert feedback from 2.5K+ professionals, and build a portfolio that stands out to employers
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center text-green-400 font-semibold">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Average 15% salary increase
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Learn & Network */}
            <GlowCard 
              glowColor="purple" 
              customSize={true}
              className="h-full min-h-[400px] bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Learn & Network
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Join workshops, hackathons, and networking events to master new skills and connect with industry leaders
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center text-green-400 font-semibold">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    3x faster skill acquisition
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Get Hired */}
            <GlowCard 
              glowColor="green" 
              customSize={true}
              className="h-full min-h-[400px] bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Get Hired
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Access exclusive opportunities from 500+ partner companies who actively recruit from our community
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center text-green-400 font-semibold">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    5x higher interview rate
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Plan Your Path */}
            <GlowCard 
              glowColor="orange" 
              customSize={true}
              className="h-full min-h-[400px] bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Plan Your Path
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Follow structured roadmaps from beginner to expert, with mentorship and milestone tracking
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center text-green-400 font-semibold">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Clear 6-month goals
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Journey Today
              </Button>
            </Link>
            <p className="text-gray-400 mt-4">
              Join 13,000+ professionals who are already achieving their IT goals
            </p>
          </div>
        </div>
      </section>

      {/* Goal Achievement Success Stories */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real Goals. Real Results.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how our community members turned their IT aspirations into career success stories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Marcus's Story */}
            <Card hover className="bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                    alt="Marcus Rodriguez"
                  />
                  <div>
                    <h4 className="text-white font-semibold">Marcus Rodriguez</h4>
                    <p className="text-gray-400 text-sm">Student → Software Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  "ITCommunity helped me go from zero programming knowledge to landing my first dev job at a startup in just 9 months!"
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-blue-400 text-sm font-medium">Goal: First Tech Job ✓</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sarah's Story */}
            <Card hover className="bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b9b5c0a3?w=150&h=150&fit=crop&crop=face" 
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                    alt="Sarah Chen"
                  />
                  <div>
                    <h4 className="text-white font-semibold">Sarah Chen</h4>
                    <p className="text-gray-400 text-sm">Junior → Senior Developer</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  "The mentorship and project feedback helped me level up my skills and get promoted to Senior Developer with a 40% raise!"
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-green-400 text-sm font-medium">Goal: Career Advancement ✓</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alex's Story */}
            <Card hover className="bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                    alt="Alex Thompson"
                  />
                  <div>
                    <h4 className="text-white font-semibold">Alex Thompson</h4>
                    <p className="text-gray-400 text-sm">Business → Tech Lead</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  "Transitioned from business to tech by following the roadmaps and networking at events. Now I'm leading a development team!"
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-purple-400 text-sm font-medium">Goal: Career Change ✓</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-6">Join 13,000+ members who are already achieving their IT goals</p>
            <Link to="/signup">
              <Button size="lg" className="px-8">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Success Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Showcase Your Skills, Accelerate Your Goals
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Build an impressive portfolio with real projects and get expert feedback that helps you land interviews. 
              Members with active portfolios see <span className="text-blue-400 font-semibold">65% more interview requests</span> and achieve their career goals faster.
            </p>
          </div>

            {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
              {Array.from({ length: 6 }).map((_, index) => (
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
                      ))}
                    </div>
          ) : (
            <HoverEffect 
              items={formatProjectsForHoverEffect(projects)} 
              className="mb-8"
            />
          )}

          <div className="text-center space-y-4">
            <Link to="/projects">
              <Button size="lg" variant="outline" className="px-8 mr-4">
                <Eye className="mr-2 h-5 w-5" />
                View All Projects
              </Button>
            </Link>
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
              Fast-Track Your Learning Goals
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join hands-on workshops designed to accelerate your IT journey and connect directly with hiring managers. 
              <span className="text-purple-400 font-semibold">80% of event attendees</span> achieve their learning goals and land new opportunities within 3 months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {formatEventsForDisplay(events).map((event, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">by {typeof event.organizer === 'string' ? event.organizer : (event.organizer as any)?.name || 'Unknown Organizer'}</p>
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
              Land Jobs Through Community Connections
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Access exclusive opportunities where your projects and community involvement give you an edge. 
              <span className="text-green-400 font-semibold">5x higher success rate</span> than traditional job boards.
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

      {/* Success Stories Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real Success Stories
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how ITCommunity members transformed their careers through projects, feedback, and community connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sarah's Story */}
            <Card hover className="bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612e04f?w=150&h=150&fit=crop&crop=face" 
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                    alt="Sarah Chen"
                  />
                  <div>
                    <h4 className="text-white font-semibold">Sarah Chen</h4>
                    <p className="text-gray-400 text-sm">Frontend Developer → Senior Role</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  "Shared my React e-commerce project, got amazing feedback from senior devs, and landed a senior role at TechFlow with 40% salary increase!"
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-blue-400 text-sm font-medium">$95K → $135K in 6 months</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* David's Story */}
            <Card hover className="bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                    alt="David Kim"
                  />
                  <div>
                    <h4 className="text-white font-semibold">David Kim</h4>
                    <p className="text-gray-400 text-sm">Student → DevOps Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  "Attended DevOps workshops, built my blockchain voting project, and got hired by CloudNative before graduation!"
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-green-400 text-sm font-medium">Student → $95K first job</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lisa's Story */}
            <Card hover className="bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" 
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                    alt="Lisa Zhang"
                  />
                  <div>
                    <h4 className="text-white font-semibold">Lisa Zhang</h4>
                    <p className="text-gray-400 text-sm">Career Changer → Full Stack</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  "Followed the Full Stack roadmap, showcased my IoT dashboard, and transitioned from marketing to tech successfully!"
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-purple-400 text-sm font-medium">Career change in 8 months</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">Join 13,000+ members who are already accelerating their tech careers</p>
            <Link to="/signup">
              <Button size="lg" className="px-8">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Success Story
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

      {/* User Journey Section - Enhanced with Interactive Features */}
      <UserJourneyPricing 
        plans={[
          {
            name: "For Students",
            subtitle: "Build your portfolio, get expert feedback, and land your dream tech job",
            features: [
              "Project Portfolio Showcase",
              "Expert Code Reviews & Feedback",
              "Career Guidance & Mentorship",
              "Internship Opportunities",
              "Peer Learning Community",
              "Resume & Interview Prep",
              "Skill Assessment Tools"
            ],
            description: "Perfect for students starting their tech journey",
            buttonText: "Get Started",
            href: "/signup?role=STUDENT",
            isPopular: true,
            icon: GraduationCap,
            iconColor: "text-blue-400",
            bgColor: "bg-blue-600/20",
            borderColor: "border-blue-500"
          },
          {
            name: "For IT Professionals",
            subtitle: "Share expertise, mentor rising talent, and advance your career",
            features: [
              "Advanced Skill Showcase",
              "Workshop Creation & Hosting",
              "Mentorship Opportunities",
              "Professional Job Applications",
              "Industry Networking Events",
              "Technical Leadership Roles",
              "Continuous Learning Paths"
            ],
            description: "Ideal for professionals advancing their careers",
            buttonText: "Get Started",
            href: "/signup?role=PROFESSIONAL",
            isPopular: false,
            icon: Users,
            iconColor: "text-purple-400",
            bgColor: "bg-purple-600/20",
            borderColor: "border-purple-500"
          },
          {
            name: "For Companies",
            subtitle: "Discover top talent, build your brand, and grow your tech team",
            features: [
              "Access to Vetted Talent Pool",
              "Company Event Hosting",
              "Brand Building & Visibility",
              "Recruitment Event Management",
              "Community Engagement Tools",
              "Talent Analytics & Insights",
              "Priority Candidate Matching"
            ],
            description: "Built for companies seeking top tech talent",
            buttonText: "Get Started",
            href: "/signup?role=COMPANY",
            isPopular: false,
            icon: Building2,
            iconColor: "text-green-400",
            bgColor: "bg-green-600/20",
            borderColor: "border-green-500"
          }
        ]}
      />

      {/* Final CTA - Achieve Your IT Goals */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Target className="h-16 w-16 text-blue-200 mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Achieve Your IT Goals?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Stop dreaming about your tech career and start achieving it. Join 13,000+ professionals who are 
              turning their IT aspirations into reality with structured pathways, expert guidance, and proven results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">15%</div>
              <div className="text-sm text-blue-100">Average salary increase</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">3-6</div>
              <div className="text-sm text-blue-100">Months to goal achievement</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">5x</div>
              <div className="text-sm text-blue-100">Higher interview success rate</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-4 text-lg font-semibold">
                <Target className="mr-2 h-5 w-5" />
                Start Achieving Your Goals
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-blue-200">
            ✨ Free forever • No credit card required • Your success story starts in 30 seconds
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;