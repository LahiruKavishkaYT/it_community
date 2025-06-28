import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStats } from '../contexts/StatsContext';
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
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats: userStats, loading: isLoadingStats, projectCount, eventCount, jobCount } = useStats();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  if (!user) return null;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const recentActivities = await getRecentActivities(5);
        setActivities(recentActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  // Function to refresh dashboard data (can be called when user performs actions)
  const refreshDashboard = async () => {
    try {
      const recentActivities = await getRecentActivities(5);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user.name}`;
  };

  const getStatsForRole = () => {
    if (isLoadingStats || !userStats) {
      // Return loading placeholder stats
      return [
        { label: '...', value: '...', icon: FolderOpen, color: 'text-blue-400' },
        { label: '...', value: '...', icon: Briefcase, color: 'text-green-400' },
        { label: '...', value: '...', icon: Calendar, color: 'text-purple-400' },
        { label: '...', value: '...', icon: Star, color: 'text-yellow-400' }
      ];
    }

    switch (user.role) {
      case 'STUDENT':
        return [
          { label: 'Projects Uploaded', value: projectCount.toString(), icon: FolderOpen, color: 'text-blue-400' },
          { label: 'Applications Sent', value: userStats.applicationsOrReceived.toString(), icon: Briefcase, color: 'text-green-400' },
          { label: 'Events Attended', value: eventCount.toString(), icon: Calendar, color: 'text-purple-400' },
          { label: 'Feedback Received', value: userStats.feedbackOrTalent.toString(), icon: Star, color: 'text-yellow-400' }
        ];
      case 'PROFESSIONAL':
        return [
          { label: 'Projects Shared', value: projectCount.toString(), icon: FolderOpen, color: 'text-blue-400' },
          { label: 'Workshops Created', value: eventCount.toString(), icon: Calendar, color: 'text-green-400' },
          { label: 'Students Helped', value: userStats.applicationsOrReceived.toString(), icon: Users, color: 'text-purple-400' },
          { label: 'Feedback Given', value: userStats.feedbackOrTalent.toString(), icon: Star, color: 'text-yellow-400' }
        ];
      case 'COMPANY':
        return [
          { label: 'Job Posts', value: jobCount.toString(), icon: Briefcase, color: 'text-blue-400' },
          { label: 'Applications', value: userStats.applicationsOrReceived.toString(), icon: Users, color: 'text-green-400' },
          { label: 'Events Hosted', value: eventCount.toString(), icon: Calendar, color: 'text-purple-400' },
          { label: 'Talent Connected', value: userStats.feedbackOrTalent.toString(), icon: Award, color: 'text-yellow-400' }
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    const actions = {
      STUDENT: [
        { label: 'Upload Project', href: '/projects/new', variant: 'primary' as const },
        { label: 'Browse Jobs', href: '/jobs', variant: 'outline' as const },
        { label: 'Join Event', href: '/events', variant: 'outline' as const }
      ],
      PROFESSIONAL: [
        { label: 'Share Project', href: '/projects/new', variant: 'primary' as const },
        { label: 'Create Workshop', href: '/events/new', variant: 'secondary' as const },
        { label: 'Browse Jobs', href: '/jobs', variant: 'outline' as const }
      ],
      COMPANY: [
        { label: 'Post Job', href: '/jobs/new', variant: 'primary' as const },
        { label: 'Host Event', href: '/events/new', variant: 'secondary' as const },
        { label: 'Find Talent', href: '/talent', variant: 'outline' as const }
      ],
      ADMIN: [
        { label: 'Admin Panel', href: '/admin', variant: 'primary' as const },
        { label: 'Manage Users', href: '/admin/users', variant: 'outline' as const },
        { label: 'System Stats', href: '/admin/stats', variant: 'outline' as const }
      ]
    };
    return actions[user.role] || [];
  };

  const formatActivityTime = (createdAt: string) => {
    const now = new Date();
    const activityTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'PROJECT_UPLOAD':
        return <FolderOpen className="h-3 w-3 text-blue-400" />;
      case 'JOB_APPLICATION':
        return <Briefcase className="h-3 w-3 text-green-400" />;
      case 'EVENT_REGISTRATION':
        return <Calendar className="h-3 w-3 text-purple-400" />;
      case 'PROJECT_FEEDBACK':
        return <Star className="h-3 w-3 text-yellow-400" />;
      default:
        return <ActivityIcon className="h-3 w-3 text-gray-400" />;
    }
  };

  const stats = getStatsForRole();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
            <p className="text-blue-100 mt-1">
              {user.role === 'STUDENT' && 'Ready to build your tech career?'}
              {user.role === 'PROFESSIONAL' && 'Share your expertise with the community'}
              {user.role === 'COMPANY' && 'Connect with top tech talent'}
            </p>
          </div>
          <div className="hidden md:block">
            {user.role === 'STUDENT' && <GraduationCap className="h-16 w-16 text-blue-200" />}
            {user.role === 'PROFESSIONAL' && <Users className="h-16 w-16 text-purple-200" />}
            {user.role === 'COMPANY' && <Building2 className="h-16 w-16 text-green-200" />}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    {isLoadingStats ? (
                      <div className="h-8 w-16 bg-gray-600 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    )}
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ActivityIcon className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingActivities ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-pulse">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-600 rounded mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-2">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        {activity.action} <span className="font-medium text-white">{activity.itemTitle}</span>
                      </p>
                      <p className="text-xs text-gray-500">{formatActivityTime(activity.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <ActivityIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No recent activity</p>
                  <p className="text-xs text-gray-500">Start uploading projects, applying to jobs, or joining events!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action: { label: string; href: string; variant: 'primary' | 'secondary' | 'outline' }, index: number) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className="w-full justify-start"
                  onClick={() => navigate(action.href)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <h3 className="text-sm font-medium text-blue-300 mb-2">
                {user.role === 'STUDENT' && 'Career Tip'}
                {user.role === 'PROFESSIONAL' && 'Community Tip'}
                {user.role === 'COMPANY' && 'Recruitment Tip'}
              </h3>
              <p className="text-sm text-blue-200">
                {user.role === 'STUDENT' && 'Upload diverse projects to showcase your range of skills to potential employers.'}
                {user.role === 'PROFESSIONAL' && 'Engage with student projects to build your mentoring reputation in the community.'}
                {user.role === 'COMPANY' && 'Host interactive events to build stronger connections with potential candidates.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">15</div>
                <div className="text-xs text-gray-400">MAR</div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">React.js Advanced Workshop</h3>
                <p className="text-sm text-gray-300">Learn advanced React patterns and optimization techniques</p>
                <p className="text-xs text-gray-500 mt-1">2:00 PM - 5:00 PM • Online</p>
              </div>
              <Button size="sm" onClick={() => navigate('/events')}>Join</Button>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">22</div>
                <div className="text-xs text-gray-400">MAR</div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Tech Career Fair 2024</h3>
                <p className="text-sm text-gray-300">Connect with top tech companies and explore opportunities</p>
                <p className="text-xs text-gray-500 mt-1">10:00 AM - 4:00 PM • San Francisco</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/events')}>Register</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;