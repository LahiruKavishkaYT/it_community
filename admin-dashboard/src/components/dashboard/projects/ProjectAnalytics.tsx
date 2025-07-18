import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Code2, 
  Users, 
  MessageSquare,
  Star,
  Flag,
  Eye,
  Calendar,
  Activity
} from "lucide-react";
import { Project } from "@/services/api";

interface ProjectAnalyticsProps {
  projects: Project[];
  isLoading?: boolean;
}

export const ProjectAnalytics = ({ projects, isLoading = false }: ProjectAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate analytics
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.status === 'published').length;
  const draftProjects = projects.filter(p => p.status === 'draft').length;
  const flaggedProjects = projects.filter(p => p.status === 'flagged').length;
  
  const totalFeedback = projects.reduce((sum, p) => sum + p.feedbackCount, 0);
  const avgFeedbackPerProject = totalProjects > 0 ? (totalFeedback / totalProjects).toFixed(1) : '0';
  
  const uniqueAuthors = new Set(projects.map(p => p.author?.id)).size;
  const uniqueTechnologies = new Set(projects.flatMap(p => p.technologies || [])).size;
  
  // Recent activity (projects created in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentProjects = projects.filter(p => new Date(p.createdAt) > thirtyDaysAgo).length;
  
  // Technology distribution
  const techDistribution = projects
    .flatMap(p => p.technologies || [])
    .reduce((acc, tech) => {
      acc[tech] = (acc[tech] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topTechnologies = Object.entries(techDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Status distribution percentages
  const statusDistribution = {
    published: totalProjects > 0 ? (publishedProjects / totalProjects) * 100 : 0,
    draft: totalProjects > 0 ? (draftProjects / totalProjects) * 100 : 0,
    flagged: totalProjects > 0 ? (flaggedProjects / totalProjects) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-800 to-blue-900/20 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Projects</p>
                <div className="text-2xl font-bold text-white">{totalProjects}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800 to-green-900/20 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Published</p>
                <div className="text-2xl font-bold text-white">{publishedProjects}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800 to-yellow-900/20 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Drafts</p>
                <div className="text-2xl font-bold text-white">{draftProjects}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800 to-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Flagged</p>
                <div className="text-2xl font-bold text-white">{flaggedProjects}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-750 rounded-lg">
                <div className="text-2xl font-bold text-white">{totalFeedback}</div>
                <div className="text-sm text-gray-400">Total Feedback</div>
              </div>
              <div className="text-center p-3 bg-gray-750 rounded-lg">
                <div className="text-2xl font-bold text-white">{avgFeedbackPerProject}</div>
                <div className="text-sm text-gray-400">Avg per Project</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Unique Authors</span>
                <Badge className="bg-blue-600 text-white">{uniqueAuthors}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Technologies Used</span>
                <Badge className="bg-purple-600 text-white">{uniqueTechnologies}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Recent (30 days)</span>
                <Badge className="bg-green-600 text-white">{recentProjects}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Published</span>
                  <span className="text-sm text-white">{statusDistribution.published.toFixed(1)}%</span>
                </div>
                <Progress value={statusDistribution.published} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Drafts</span>
                  <span className="text-sm text-white">{statusDistribution.draft.toFixed(1)}%</span>
                </div>
                <Progress value={statusDistribution.draft} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Flagged</span>
                  <span className="text-sm text-white">{statusDistribution.flagged.toFixed(1)}%</span>
                </div>
                <Progress value={statusDistribution.flagged} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Technologies */}
      {topTechnologies.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Top Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topTechnologies.map(([tech, count]) => (
                <div key={tech} className="text-center p-3 bg-gray-750 rounded-lg">
                  <div className="text-lg font-semibold text-white">{tech}</div>
                  <div className="text-sm text-gray-400">{count} projects</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">New Projects</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">{recentProjects}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">Total Feedback</div>
                  <div className="text-xs text-gray-400">Community engagement</div>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">{totalFeedback}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-white">Active Authors</div>
                  <div className="text-xs text-gray-400">Unique contributors</div>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white">{uniqueAuthors}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 