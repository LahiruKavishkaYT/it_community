import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStats } from '../contexts/StatsContext';
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery';
import { getRecentActivities } from '../services/api';
import { Activity, UserStats } from '../types';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Briefcase,
  FolderOpen,
  Star,
  Activity as ActivityIcon,
  Award,
  Building2,
  GraduationCap,
  ArrowRight,
  Plus,
  Eye,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats: userStats, loading: isLoadingStats, projectCount, eventCount, jobCount } = useStats();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  if (!user) return null;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const recentActivities = await getRecentActivities(isMobile ? 3 : 5);
        setActivities(recentActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [isMobile]);

  // Function to refresh dashboard data (can be called when user performs actions)
  const refreshDashboard = async () => {
    try {
      const recentActivities = await getRecentActivities(isMobile ? 3 : 5);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user.name.split(' ')[0]}`;
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Create Project',
        description: 'Share your latest work',
        icon: Plus,
        color: 'bg-blue-600 hover:bg-blue-700',
        href: '/projects/new'
      },
      {
        title: 'Browse Jobs',
        description: 'Find opportunities',
        icon: Briefcase,
        color: 'bg-green-600 hover:bg-green-700',
        href: '/jobs'
      },
      {
        title: 'Join Events',
        description: 'Network and learn',
        icon: Calendar,
        color: 'bg-purple-600 hover:bg-purple-700',
        href: '/events'
      }
    ];

    if (user.role === 'COMPANY') {
      return [
        {
          title: 'Post Job',
          description: 'Find great talent',
          icon: Plus,
          color: 'bg-blue-600 hover:bg-blue-700',
          href: '/jobs/new'
        },
        {
          title: 'Host Event',
          description: 'Build community',
          icon: Calendar,
          color: 'bg-green-600 hover:bg-green-700',
          href: '/events/new'
        },
        {
          title: 'View Applications',
          description: 'Review candidates',
          icon: Eye,
          color: 'bg-purple-600 hover:bg-purple-700',
          href: '/job-applications'
        }
      ];
    }

    return baseActions;
  };

  const stats = [
    {
      label: 'Total Projects',
      value: isLoadingStats ? '-' : projectCount?.toString() || '0',
      icon: FolderOpen,
      color: 'text-blue-400',
      change: '+12%',
      changeType: 'increase' as const
    },
    {
      label: 'Active Events',
      value: isLoadingStats ? '-' : eventCount?.toString() || '0',
      icon: Calendar,
      color: 'text-green-400',
      change: '+8%',
      changeType: 'increase' as const
    },
    {
      label: 'Job Opportunities',
      value: isLoadingStats ? '-' : jobCount?.toString() || '0',
      icon: Briefcase,
      color: 'text-purple-400',
      change: '+15%',
      changeType: 'increase' as const
    },
         {
       label: user.role === 'STUDENT' ? 'Your Projects' : user.role === 'COMPANY' ? 'Posted Jobs' : 'Contributions',
       value: isLoadingStats ? '-' : (userStats?.projectsOrJobs?.toString() ?? '0'),
       icon: user.role === 'STUDENT' ? GraduationCap : user.role === 'COMPANY' ? Building2 : Users,
       color: 'text-orange-400',
       change: '+5%',
       changeType: 'increase' as const
     }
  ];

  const quickActions = getQuickActions();

  return (
    <div className="space-y-mobile min-h-screen-mobile">
      {/* Welcome Section */}
      <div className="card-mobile bg-gradient-to-r from-blue-600 to-purple-700 text-white border-0 animate-mobile-fade-in">
        <div className="flex-mobile-center items-start md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-mobile-2xl font-bold text-crisp mb-2">{getWelcomeMessage()}</h1>
            <p className="text-blue-100 text-mobile-sm leading-relaxed">
              {user.role === 'STUDENT' && 'Ready to build your tech career? Start by sharing your projects and connecting with the community.'}
              {user.role === 'PROFESSIONAL' && 'Share your expertise with the community and help the next generation of developers.'}
              {user.role === 'COMPANY' && 'Connect with top tech talent and build your team with skilled professionals.'}
            </p>
          </div>
          <div className="hidden md:block flex-shrink-0">
            {user.role === 'STUDENT' && <GraduationCap className="h-12 w-12 lg:h-16 lg:w-16 text-blue-200" />}
            {user.role === 'PROFESSIONAL' && <Users className="h-12 w-12 lg:h-16 lg:w-16 text-purple-200" />}
            {user.role === 'COMPANY' && <Building2 className="h-12 w-12 lg:h-16 lg:w-16 text-green-200" />}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-mobile animate-mobile-slide-up">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-mobile-compact hover:shadow-glow transition-all duration-300 touch-feedback-subtle">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-mobile-xs font-medium text-gray-400 line-clamp-1">{stat.label}</p>
                    {isLoadingStats ? (
                      <div className="h-6 md:h-8 w-12 md:w-16 bg-gray-600 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p className="text-mobile-lg md:text-mobile-xl font-bold text-white mt-1">{stat.value}</p>
                    )}
                    {!isLoadingStats && (
                      <div className={`flex items-center mt-1 text-mobile-xs ${
                        stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{stat.change}</span>
                      </div>
                    )}
                  </div>
                  <Icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color} flex-shrink-0`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-mobile">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-mobile">
          <Card className="card-mobile">
            <CardHeader className="flex-mobile-center gap-4 pb-4">
              <h2 className="text-mobile-lg font-semibold text-white">Quick Actions</h2>
              <Target className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => navigate(action.href)}
                      className={`${action.color} text-white p-4 md:p-6 rounded-xl transition-all duration-200 hover:scale-105 touch-feedback group`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Icon className="h-8 w-8 md:h-10 md:w-10 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-semibold text-mobile-sm">{action.title}</h3>
                          <p className="text-mobile-xs opacity-90 mt-1">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-mobile">
            <CardHeader className="flex-mobile-center gap-4 pb-4">
              <h2 className="text-mobile-lg font-semibold text-white">Recent Activity</h2>
              <ActivityIcon className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-3">
                  {Array.from({ length: isMobile ? 3 : 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30 animate-pulse">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-mobile-sm">No recent activity</p>
                  <p className="text-gray-500 text-mobile-xs mt-1">Start by creating a project or joining an event</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ActivityIcon className="h-4 w-4 text-white" />
                      </div>
                                             <div className="flex-1 min-w-0">
                         <p className="text-mobile-sm text-white line-clamp-1">{activity.action} {activity.itemTitle}</p>
                         <p className="text-mobile-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-mobile">
          {/* Performance Summary */}
          <Card className="card-mobile">
            <CardHeader className="flex-mobile-center gap-4 pb-4">
              <h3 className="text-mobile-lg font-semibold text-white">Your Impact</h3>
              <Award className="h-5 w-5 text-yellow-400" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-mobile-sm text-gray-300">Profile Views</span>
                  <span className="text-mobile-sm font-semibold text-white">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mobile-sm text-gray-300">Project Stars</span>
                  <span className="text-mobile-sm font-semibold text-white">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mobile-sm text-gray-300">Connections</span>
                  <span className="text-mobile-sm font-semibold text-white">156</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full btn-ghost-mobile text-center"
                >
                  View Full Profile
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Goals/Tips */}
          <Card className="card-mobile bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-yellow-400" />
                <h3 className="text-mobile-lg font-semibold text-white">Daily Goal</h3>
              </div>
              <p className="text-mobile-sm text-gray-300 mb-4">
                {user.role === 'STUDENT' && 'Complete one coding challenge today to improve your skills!'}
                {user.role === 'PROFESSIONAL' && 'Review and provide feedback on a student project today.'}
                {user.role === 'COMPANY' && 'Check out the latest talent pool and connect with potential hires.'}
              </p>
              <div className="bg-gray-700/50 rounded-full h-2 mb-3">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-2/3"></div>
              </div>
              <p className="text-mobile-xs text-gray-400">67% Complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;