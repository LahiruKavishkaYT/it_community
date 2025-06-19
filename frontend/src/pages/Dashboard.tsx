import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Briefcase,
  FolderOpen,
  Star,
  Activity,
  Award,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user.name}`;
  };

  const getStatsForRole = () => {
    switch (user.role) {
      case 'student':
        return [
          { label: 'Projects Uploaded', value: '12', icon: FolderOpen, color: 'text-blue-400' },
          { label: 'Applications Sent', value: '8', icon: Briefcase, color: 'text-green-400' },
          { label: 'Events Attended', value: '5', icon: Calendar, color: 'text-purple-400' },
          { label: 'Feedback Received', value: '24', icon: Star, color: 'text-yellow-400' }
        ];
      case 'professional':
        return [
          { label: 'Projects Shared', value: '18', icon: FolderOpen, color: 'text-blue-400' },
          { label: 'Workshops Created', value: '6', icon: Calendar, color: 'text-green-400' },
          { label: 'Mentees Helped', value: '15', icon: Users, color: 'text-purple-400' },
          { label: 'Skill Rating', value: '4.8', icon: Star, color: 'text-yellow-400' }
        ];
      case 'company':
        return [
          { label: 'Job Posts', value: '7', icon: Briefcase, color: 'text-blue-400' },
          { label: 'Applications', value: '142', icon: Users, color: 'text-green-400' },
          { label: 'Events Hosted', value: '3', icon: Calendar, color: 'text-purple-400' },
          { label: 'Talent Connected', value: '28', icon: Award, color: 'text-yellow-400' }
        ];
      default:
        return [];
    }
  };

  const getRecentActivity = () => {
    const activities = {
      student: [
        { action: 'Uploaded new project', item: 'E-commerce React App', time: '2 hours ago' },
        { action: 'Applied to internship at', item: 'TechCorp Inc.', time: '1 day ago' },
        { action: 'Registered for event', item: 'React.js Workshop', time: '2 days ago' },
        { action: 'Received feedback on', item: 'Portfolio Website', time: '3 days ago' }
      ],
      professional: [
        { action: 'Created workshop', item: 'Advanced JavaScript Patterns', time: '1 hour ago' },
        { action: 'Mentored student on', item: 'Full Stack Development', time: '3 hours ago' },
        { action: 'Shared project', item: 'Microservices Architecture Demo', time: '1 day ago' },
        { action: 'Joined discussion on', item: 'AI in Web Development', time: '2 days ago' }
      ],
      company: [
        { action: 'Posted new position', item: 'Senior Frontend Developer', time: '30 minutes ago' },
        { action: 'Reviewed applications for', item: 'Backend Internship', time: '2 hours ago' },
        { action: 'Hosted event', item: 'Tech Talk: Future of AI', time: '1 day ago' },
        { action: 'Connected with talent', item: '5 new developers', time: '2 days ago' }
      ]
    };
    return activities[user.role] || [];
  };

  const getQuickActions = () => {
    const actions = {
      student: [
        { label: 'Upload Project', href: '/projects/new', variant: 'primary' as const },
        { label: 'Browse Jobs', href: '/jobs', variant: 'outline' as const },
        { label: 'Join Event', href: '/events', variant: 'outline' as const }
      ],
      professional: [
        { label: 'Share Project', href: '/projects/new', variant: 'primary' as const },
        { label: 'Create Workshop', href: '/events/new', variant: 'secondary' as const },
        { label: 'Browse Jobs', href: '/jobs', variant: 'outline' as const }
      ],
      company: [
        { label: 'Post Job', href: '/jobs/new', variant: 'primary' as const },
        { label: 'Host Event', href: '/events/new', variant: 'secondary' as const },
        { label: 'Find Talent', href: '/talent', variant: 'outline' as const }
      ]
    };
    return actions[user.role] || [];
  };

  const stats = getStatsForRole();
  const recentActivity = getRecentActivity();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
            <p className="text-blue-100 mt-1">
              {user.role === 'student' && 'Ready to build your tech career?'}
              {user.role === 'professional' && 'Share your expertise with the community'}
              {user.role === 'company' && 'Connect with top tech talent'}
            </p>
          </div>
          <div className="hidden md:block">
            {user.role === 'student' && <GraduationCap className="h-16 w-16 text-blue-200" />}
            {user.role === 'professional' && <Users className="h-16 w-16 text-purple-200" />}
            {user.role === 'company' && <Building2 className="h-16 w-16 text-green-200" />}
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
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
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
              <Activity className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      {activity.action} <span className="font-medium text-white">{activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
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
              {quickActions.map((action, index) => (
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
                {user.role === 'student' && 'Career Tip'}
                {user.role === 'professional' && 'Community Tip'}
                {user.role === 'company' && 'Recruitment Tip'}
              </h3>
              <p className="text-sm text-blue-200">
                {user.role === 'student' && 'Upload diverse projects to showcase your range of skills to potential employers.'}
                {user.role === 'professional' && 'Engage with student projects to build your mentoring reputation in the community.'}
                {user.role === 'company' && 'Host interactive events to build stronger connections with potential candidates.'}
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
            <Button variant="ghost" size="sm">View All</Button>
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
              <Button size="sm">Join</Button>
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
              <Button size="sm" variant="outline">Register</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;