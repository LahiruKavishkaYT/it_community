import { Users, FolderOpen, Calendar, Briefcase, TrendingUp, Shield, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
  loading?: boolean;
}

const MetricCard = ({ title, value, change, changeType, icon: Icon, subtitle, loading }: MetricCardProps) => {
  const getIconColor = (title: string) => {
    switch (title) {
      case "Total Users":
        return "text-blue-400";
      case "Active Projects":
        return "text-green-400";
      case "Upcoming Events":
        return "text-purple-400";
      case "Open Positions":
        return "text-yellow-400";
      case "Admin Users":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getCardGradient = (title: string) => {
    switch (title) {
      case "Total Users":
        return "bg-gradient-to-br from-gray-800 to-blue-900/20 border-blue-500/20 hover:border-blue-500/40";
      case "Active Projects":
        return "bg-gradient-to-br from-gray-800 to-green-900/20 border-green-500/20 hover:border-green-500/40";
      case "Upcoming Events":
        return "bg-gradient-to-br from-gray-800 to-purple-900/20 border-purple-500/20 hover:border-purple-500/40";
      case "Open Positions":
        return "bg-gradient-to-br from-gray-800 to-yellow-900/20 border-yellow-500/20 hover:border-yellow-500/40";
      case "Admin Users":
        return "bg-gradient-to-br from-gray-800 to-red-900/20 border-red-500/20 hover:border-red-500/40";
      default:
        return "bg-gray-800 border-gray-700 hover:border-gray-600";
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24 bg-gray-700" />
          <Skeleton className="h-5 w-5 bg-gray-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 bg-gray-700 mb-3" />
          <Skeleton className="h-3 w-full bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`${getCardGradient(title)} transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-black/20 cursor-pointer group`}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${value}${change ? `, ${change}` : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
          {title}
        </CardTitle>
        <div className="relative">
          <Icon className={`h-5 w-5 ${getIconColor(title)} transition-all duration-300 group-hover:scale-110`} />
          <div className={`absolute inset-0 ${getIconColor(title)} opacity-20 rounded-full blur-sm group-hover:blur-md transition-all duration-300`}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change && (
            <div className="flex items-center space-x-1">
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  changeType === "positive"
                    ? "text-green-300 bg-green-500/20 border border-green-500/30"
                    : changeType === "neutral"
                    ? "text-gray-300 bg-gray-500/20 border border-gray-500/30"
                    : "text-red-300 bg-red-500/20 border border-red-500/30"
                } transition-all duration-300 group-hover:scale-110`}
              >
                {change}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
};

export const MetricsCards = () => {
  const { hasPermission } = useAuth();

  const { 
    data: analytics, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['full-analytics'],
    queryFn: () => analyticsAPI.getFullAnalytics(),
    enabled: hasPermission('analytics.read'),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-red-900/20 border-red-500/20 col-span-full">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 mb-4">Failed to load analytics data</p>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatGrowthRate = (rate: string) => {
    const numericRate = parseFloat(rate.replace('%', ''));
    return {
      value: rate,
      type: numericRate > 0 ? 'positive' as const : numericRate < 0 ? 'negative' as const : 'neutral' as const
    };
  };

  const metrics = analytics ? [
    {
      title: "Total Users",
      value: analytics.users.total,
      change: analytics.users.growthRate,
      changeType: formatGrowthRate(analytics.users.growthRate).type,
      icon: Users,
      subtitle: `${analytics.users.byRole.STUDENT || 0} Students • ${analytics.users.byRole.PROFESSIONAL || 0} Professionals • ${analytics.users.byRole.COMPANY || 0} Companies`,
    },
    {
      title: "Active Projects",
      value: analytics.content.projects,
      change: "+8.7%", // This would come from analytics data
      changeType: "positive" as const,
      icon: FolderOpen,
      subtitle: "Student & Professional Projects",
    },
    {
      title: "Upcoming Events",
      value: analytics.content.events,
      change: "+15.2%", // This would come from analytics data
      changeType: "positive" as const,
      icon: Calendar,
      subtitle: "Workshops, Networking & Other Events",
    },
    {
      title: "Open Positions",
      value: analytics.content.jobs,
      change: "+22.1%", // This would come from analytics data
      changeType: "positive" as const,
      icon: Briefcase,
      subtitle: "Jobs & Internship Opportunities",
    },
    {
      title: "Admin Users",
      value: (analytics.users.byRole.ADMIN || 0) + (analytics.users.byRole.MODERATOR || 0),
      change: "0%",
      changeType: "neutral" as const,
      icon: Shield,
      subtitle: `${analytics.users.byRole.ADMIN || 0} Admins • ${analytics.users.byRole.MODERATOR || 0} Moderators`,
    },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Platform Metrics</h2>
        <Button 
          onClick={() => refetch()} 
          variant="ghost" 
          size="sm"
          className="text-gray-400 hover:text-white"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Show loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <MetricCard
              key={index}
              title=""
              value=""
              changeType="neutral"
              icon={Users}
              subtitle=""
              loading={true}
            />
          ))
        ) : (
          metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              {...metric}
            />
          ))
        )}
      </div>
    </div>
  );
};
