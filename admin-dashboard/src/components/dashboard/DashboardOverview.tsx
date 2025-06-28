import { MetricsCards } from "./overview/MetricsCards";
import { RecentActivity } from "./overview/RecentActivity";
import { QuickActions } from "./overview/QuickActions";
import { SystemHealth } from "./overview/SystemHealth";
import { UserGrowthChart } from "./overview/UserGrowthChart";
import { ContentAnalytics } from "./overview/ContentAnalytics";
import { ProjectApprovalPanel } from "./overview/ProjectApprovalPanel";

export const DashboardOverview = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 mt-1">Monitor your IT Community platform performance</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="animate-in slide-in-from-bottom duration-500 delay-100">
        <MetricsCards />
      </div>

      {/* Project Approval Panel */}
      <div className="animate-in slide-in-from-bottom duration-500 delay-150">
        <ProjectApprovalPanel />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500 delay-200">
        <div className="lg:col-span-2 space-y-6">
          <UserGrowthChart />
          <ContentAnalytics />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <SystemHealth />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="animate-in slide-in-from-bottom duration-500 delay-300">
        <RecentActivity />
      </div>
    </div>
  );
};
