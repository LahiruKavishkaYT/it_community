import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Star, 
  Calendar, 
  TrendingUp, 
  Award, 
  Users,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { getUserFeedback } from '../services/api';

interface FeedbackData {
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    createdAt: string;
    feedbackCount: number;
    averageRating: number;
    feedback: Array<{
      id: string;
      content: string;
      rating: number;
      authorId: string;
      authorName: string;
      authorRole: string;
      createdAt: string;
    }>;
  }>;
  statistics: {
    totalProjects: number;
    projectsWithFeedback: number;
    totalFeedback: number;
    overallAverageRating: number;
  };
}

const MyFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserFeedback();
      setFeedbackData(data);
    } catch (err) {
      setError('Failed to load feedback data. Please try again.');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PROFESSIONAL': return 'text-purple-400';
      case 'COMPANY': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PROFESSIONAL': return 'IT Professional';
      case 'COMPANY': return 'Company';
      default: return role;
    }
  };

  if (!user || user.role !== 'STUDENT') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">This page is only available for students.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchFeedbackData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Feedback</h1>
            <p className="text-gray-400">View feedback received on your projects from IT professionals and companies</p>
          </div>
          <div className="flex items-center space-x-2 text-blue-400">
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">Feedback Dashboard</span>
          </div>
        </div>

        {/* Statistics Cards */}
        {feedbackData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{feedbackData.statistics.totalProjects}</p>
                    <p className="text-gray-400 text-sm">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Eye className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{feedbackData.statistics.projectsWithFeedback}</p>
                    <p className="text-gray-400 text-sm">Projects with Feedback</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{feedbackData.statistics.totalFeedback}</p>
                    <p className="text-gray-400 text-sm">Total Feedback</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{feedbackData.statistics.overallAverageRating}</p>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects with Feedback */}
        {feedbackData && feedbackData.projects.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Projects with Feedback</h2>
            
            {feedbackData.projects.map((project) => (
              <Card key={project.id}>
                <div 
                  className="cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={() => toggleProject(project.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {expandedProjects.has(project.id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-yellow-400">{project.averageRating}</p>
                          <p className="text-xs text-gray-400">Avg Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-400">{project.feedbackCount}</p>
                          <p className="text-xs text-gray-400">Feedback</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </div>

                {expandedProjects.has(project.id) && (
                  <CardContent className="border-t border-gray-700">
                    <div className="pt-6 space-y-6">
                      {/* Project Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Feedback List */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-white">Feedback ({project.feedbackCount})</h4>
                        {project.feedback.map((feedback) => (
                          <div key={feedback.id} className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium text-white">{feedback.authorName}</span>
                                <span className={`text-xs px-2 py-1 rounded-full bg-gray-600/50 ${getRoleColor(feedback.authorRole)}`}>
                                  {getRoleBadge(feedback.authorRole)}
                                </span>
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{feedback.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Feedback Yet</h3>
              <p className="text-gray-400 mb-6">
                You haven't received any feedback on your projects yet. Keep creating amazing projects and 
                IT professionals and companies will start providing valuable feedback!
              </p>
              <Button onClick={() => window.location.href = '/projects'}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View My Projects
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyFeedbackPage; 