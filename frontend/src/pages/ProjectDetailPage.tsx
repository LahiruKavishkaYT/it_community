import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Calendar,
  User,
  MessageCircle,
  Star,
  Share2,
  BookmarkPlus,
  Flag,
  Loader2,
  Heart,
  Eye,
  Code2,
  Lightbulb,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import FeedbackForm from '../components/UI/FeedbackForm';
import { Project, ProjectFeedback } from '../types';
import { getProjectById, addProjectFeedback } from '../services/api';

interface ProjectDetailProps {
  projectId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const ProjectDetailPage: React.FC<ProjectDetailProps> = ({ 
  projectId: propProjectId,
  onClose,
  isModal = false 
}) => {
  const { id: urlProjectId } = useParams<{ id: string }>();
  const projectId = propProjectId || urlProjectId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'feedback' | 'technical'>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedTech, setExpandedTech] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Fetch project data
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const projectData = await getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
        setViewCount(Math.floor(Math.random() * 1000) + 100); // Simulate view count
      } else {
        setError('Project not found');
      }
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Handle navigation
  const handleBack = useCallback(() => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/projects');
    }
  }, [isModal, onClose, navigate]);

  // Share functionality
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/projects/${projectId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title,
          text: project?.description,
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
    setShowShareMenu(false);
  }, [project, projectId]);

  // Feedback handlers
  const handleAddFeedback = useCallback(async (feedbackData: { content: string; rating: number }) => {
    if (!projectId) return;
    
    setIsSubmittingFeedback(true);
    try {
      const newFeedback = await addProjectFeedback(projectId, feedbackData);
      
      // Update project with new feedback
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: [...(prev.feedback || []), newFeedback]
        };
      });
      
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error; // Let the form handle the error
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [projectId]);

  // Project type badge
  const ProjectTypeBadge = useMemo(() => {
    if (!project) return null;
    
    const isStudentProject = project.projectType === 'STUDENT_PROJECT';
    return (
      <div className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border
        ${isStudentProject 
          ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' 
          : 'bg-green-600/20 text-green-300 border-green-500/30'
        }
      `}>
        {isStudentProject ? <GraduationCap className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
        {isStudentProject ? 'Student Project' : 'Learning Project'}
      </div>
    );
  }, [project]);

  // Section navigation
  const sectionNavigation = [
    { key: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
    { key: 'technical', label: 'Technical Details', icon: <Code2 className="h-4 w-4" /> },
    { key: 'feedback', label: 'Feedback', icon: <MessageCircle className="h-4 w-4" /> }
  ] as const;

  // Loading state
  if (loading) {
    return (
      <div className={`${isModal ? 'p-8' : 'min-h-screen bg-gray-900 flex items-center justify-center'}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-300">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className={`${isModal ? 'p-8' : 'min-h-screen bg-gray-900 flex items-center justify-center'}`}>
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-red-400">{error || 'Project not found'}</p>
            <Button onClick={handleBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const containerClasses = isModal 
    ? 'max-h-[90vh] overflow-y-auto' 
    : 'min-h-screen bg-gray-900';

  return (
    <div className={containerClasses}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isModal ? 'Close' : 'Back to Projects'}</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-400' : ''}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? 'text-yellow-400' : ''}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 z-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="w-full justify-start"
                    >
                      {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-2">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Header */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {ProjectTypeBadge}
                  <span className="text-gray-400 text-sm flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{viewCount} views</span>
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>by {typeof project.author === 'string' ? project.author : 'Unknown Author'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {project.githubUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>View Code</span>
                  </Button>
                )}
                
                {project.liveUrl && (
                  <Button
                    onClick={() => window.open(project.liveUrl, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Live Demo</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Navigation */}
            <div className="bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
              <div className="flex space-x-1">
                {sectionNavigation.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                      ${activeSection === section.key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <Card>
              <CardContent className="p-6">
                {activeSection === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                      <p className="text-gray-300 leading-relaxed">{project.description}</p>
                    </div>

                    {project.imageUrl && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
                        <div className="rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-auto"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {project.keyFeatures && project.keyFeatures.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {project.keyFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-gray-300">
                              <Award className="h-4 w-4 text-green-400" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'technical' && (
                  <div className="space-y-6">
                    <div>
                      <button
                        onClick={() => setExpandedTech(!expandedTech)}
                        className="flex items-center space-x-2 text-lg font-semibold text-white mb-3 hover:text-blue-300 transition-colors"
                      >
                        {expandedTech ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <span>Technologies Used</span>
                      </button>
                      
                      <div className={`space-y-3 ${expandedTech ? 'block' : 'hidden'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {project.technologies.map((tech, index) => (
                            <div
                              key={index}
                              className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center"
                            >
                              <div className="text-gray-300 font-medium">{tech}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {project.architecture && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Architecture</h3>
                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <p className="text-gray-300 whitespace-pre-wrap">
                            {project.architecture}
                          </p>
                        </div>
                      </div>
                    )}

                    {project.learningObjectives && project.learningObjectives.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Learning Objectives</h3>
                        <div className="space-y-2">
                          {project.learningObjectives.map((objective, index) => (
                            <div key={index} className="flex items-center space-x-2 text-gray-300">
                              <Lightbulb className="h-4 w-4 text-yellow-400" />
                              <span>{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'feedback' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Feedback ({project.feedback?.length || 0})
                      </h3>
                      {user && !showFeedbackForm && (
                        <Button 
                          size="sm"
                          onClick={() => setShowFeedbackForm(true)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Add Feedback
                        </Button>
                      )}
                    </div>

                    {/* Feedback Form */}
                    {showFeedbackForm && (
                      <FeedbackForm
                        projectId={projectId!}
                        onSubmit={handleAddFeedback}
                        onCancel={() => setShowFeedbackForm(false)}
                        isSubmitting={isSubmittingFeedback}
                      />
                    )}

                    {project.feedback && project.feedback.length > 0 ? (
                      <div className="space-y-4">
                        {project.feedback.map((feedback, index) => (
                          <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">{feedback.authorName}</span>
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-gray-400 text-sm">
                                {new Date(feedback.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-300">{feedback.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No feedback yet. Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Project Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{viewCount}</div>
                    <div className="text-gray-400 text-sm">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{project.feedback?.length || 0}</div>
                    <div className="text-gray-400 text-sm">Feedback</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">About the Author</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {(() => {
                        const authorName = typeof project.author === 'string' ? project.author : 'Unknown';
                        return authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      })()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {typeof project.author === 'string' ? project.author : 'Unknown Author'}
                    </div>
                    <div className="text-gray-400 text-sm">Project Creator</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Related Projects */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Related Projects</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Similar React App', 'Another Cool Project', 'Awesome Portfolio'].map((title, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                      <div className="w-8 h-8 bg-gray-600 rounded"></div>
                      <div className="flex-1 text-sm text-gray-300">{title}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage; 