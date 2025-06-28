import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Briefcase, 
  BarChart3, 
  PieChart, 
  Activity,
  RefreshCw,
  Download,
  Filter,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { analyticsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState("30d");
  const { hasPermission } = useAuth();

  const { 
    data: analytics, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['analytics', timeFilter],
    queryFn: () => analyticsAPI.getFullAnalytics(),
    enabled: hasPermission('analytics.read'),
    refetchInterval: 60000, // Refetch every minute
  });

  // Mock data for charts (in real app, this would come from API)
  const userGrowthData = [
    { month: 'Jan', users: 1200, active: 980 },
    { month: 'Feb', users: 1400, active: 1150 },
    { month: 'Mar', users: 1600, active: 1320 },
    { month: 'Apr', users: 1850, active: 1500 },
    { month: 'May', users: 2100, active: 1750 },
    { month: 'Jun', users: 2400, active: 2000 },
  ];

  const userTypeData = analytics ? [
    { name: 'Students', value: analytics.users.byRole.STUDENT || 0, color: COLORS[0] },
    { name: 'Professionals', value: analytics.users.byRole.PROFESSIONAL || 0, color: COLORS[1] },
    { name: 'Companies', value: analytics.users.byRole.COMPANY || 0, color: COLORS[2] },
    { name: 'Admins', value: analytics.users.byRole.ADMIN || 0, color: COLORS[3] },
  ] : [];

  const activityData = [
    { time: '00:00', users: 120 },
    { time: '04:00', users: 80 },
    { time: '08:00', users: 300 },
    { time: '12:00', users: 450 },
    { time: '16:00', users: 380 },
    { time: '20:00', users: 280 },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    description,
    loading = false 
  }: {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'stable';
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    loading?: boolean;
  }) => (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 bg-gray-700" />
              <Skeleton className="h-5 w-5 bg-gray-700" />
            </div>
            <Skeleton className="h-8 w-24 bg-gray-700" />
            <Skeleton className="h-3 w-full bg-gray-700" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
              <div className="flex items-center space-x-1">
                {getTrendIcon(trend)}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-400' : 
                  trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {change}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
          <Card className="bg-red-900/20 border-red-500/20">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Analytics</h3>
                <p className="text-red-400 mb-4">Unable to fetch analytics data at this time.</p>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
            <p className="text-gray-400 mt-1">Comprehensive platform insights and metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={analytics?.users.total || 0}
            change={analytics?.users.growthRate || "+0%"}
            trend="up"
            icon={Users}
            description="Total registered users across all roles"
            loading={isLoading}
          />
          <MetricCard
            title="Active Projects"
            value={analytics?.content.projects || 0}
            change="+8.2%"
            trend="up"
            icon={Briefcase}
            description="Currently active community projects"
            loading={isLoading}
          />
          <MetricCard
            title="Monthly Events"
            value={analytics?.content.events || 0}
            change="+12.5%"
            trend="up"
            icon={Calendar}
            description="Events hosted this month"
            loading={isLoading}
          />
          <MetricCard
            title="Job Openings"
            value={analytics?.content.jobs || 0}
            change="+5.1%"
            trend="up"
            icon={TrendingUp}
            description="Available job and internship positions"
            loading={isLoading}
          />
        </div>

        {/* Charts and Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">Users</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-gray-700">Content</TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-gray-700">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>User Growth Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-700" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="active" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>User Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-48 w-full bg-gray-700" />
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Skeleton className="h-3 w-3 bg-gray-700" />
                            <Skeleton className="h-3 w-20 bg-gray-700" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            dataKey="value"
                            data={userTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                          >
                            {userTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2">
                        {userTypeData.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-gray-300">{item.name}</span>
                            <span className="text-sm text-gray-400">({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                  <Badge className="bg-green-600 text-white ml-auto">
                    {analytics?.systemHealth.status || 'Healthy'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Database Performance</span>
                      <span className="text-green-400">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">API Response Time</span>
                      <span className="text-blue-400">120ms</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Server Uptime</span>
                      <span className="text-green-400">99.9%</span>
                    </div>
                    <Progress value={99.9} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daily Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">User Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">Average Session Duration</span>
                    <span className="text-white font-semibold">24m 35s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">Daily Active Users</span>
                    <span className="text-white font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">Monthly Active Users</span>
                    <span className="text-white font-semibold">3,856</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">User Retention Rate</span>
                    <span className="text-green-400 font-semibold">78.5%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Content analytics coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="text-center py-12 text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Engagement analytics coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
