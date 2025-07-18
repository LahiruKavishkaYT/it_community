import React, { useState, useEffect } from 'react';
import { 
  Map, 
  FolderOpen, 
  MessageSquarePlus,
  ExternalLink,
  Github,
  Loader2,
  AlertCircle,
  Filter,
  Plus
} from 'lucide-react';
import { Card, CardContent } from './Card';
import Button from './Button';
import SimpleSVGViewer from './SimpleSVGViewer';
import LearningProjectModal from './LearningProjectModal';
import SuggestionModal from './SuggestionModal';
import SuggestionCard from './SuggestionCard';
import SuggestionFilters from './SuggestionFilters';
import SuggestionFeedbackModal from './SuggestionFeedbackModal';
import { getOrgLearningProjects, getSuggestions, createSuggestion, voteSuggestion, submitSuggestionFeedback } from '../../services/api';
import { Project, Suggestion, SuggestionFilters as FilterType, CreateSuggestionData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface TabbedCareerViewProps {
  pathId: string;
  pathTitle: string;
}

const TabbedCareerView: React.FC<TabbedCareerViewProps> = ({ pathId, pathTitle }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'projects' | 'suggestions'>('roadmap');
  
  // Utility function to ensure suggestions have rating data
  const ensureSuggestionRating = (suggestion: any): Suggestion => {
    return {
      ...suggestion,
      rating: suggestion.rating || {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      userRating: suggestion.userRating || undefined
    };
  };
  
  // State for real projects from backend
  const [realProjects, setRealProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  
  // State for project modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for suggestions system
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestionFilters, setSuggestionFilters] = useState<FilterType>({
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  
  // State for feedback modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedSuggestionForRating, setSelectedSuggestionForRating] = useState<Suggestion | null>(null);

  // Fetch suggestions when suggestions tab is active
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (activeTab !== 'suggestions') return;
      
      setSuggestionsLoading(true);
      setSuggestionsError(null);
      
      try {
        const response = await getSuggestions({
          careerPathId: pathId,
          ...suggestionFilters,
          page: 1,
          limit: 20
        });
        setSuggestions(response.suggestions.map(ensureSuggestionRating));
      } catch (error) {
        setSuggestionsError('Failed to load suggestions');
        console.error('Error fetching suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [activeTab, pathId, suggestionFilters]);

  // Fetch projects from backend when component mounts or pathId changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (activeTab !== 'projects') return; // Only fetch when projects tab is active
      
      setProjectsLoading(true);
      setProjectsError(null);
      
      try {
        const projects = await getOrgLearningProjects(pathId);
        setRealProjects(projects);
      } catch (error) {
        setProjectsError(error instanceof Error ? error.message : 'Failed to load projects');
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [pathId, activeTab]);

  const tabs = [
    {
      id: 'roadmap' as const,
      label: 'Roadmap',
      icon: Map,
      description: 'Interactive learning path'
    },
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: FolderOpen,
      description: 'Hands-on learning projects'
    },
    {
      id: 'suggestions' as const,
      label: 'Suggest Changes',
      icon: MessageSquarePlus,
      description: 'Community feedback & improvements'
    }
  ];

  // Handle suggestion submission
  const handleSuggestionSubmit = async (formData: { 
    type: 'improvement' | 'content' | 'feature' | 'bug' | 'other';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    attachments?: File[];
  }) => {
    if (!user) {
      console.error('User must be authenticated to submit suggestions');
      return;
    }

    try {
      const suggestionData: CreateSuggestionData = {
        ...formData,
        careerPathId: pathId,
        careerPathTitle: pathTitle
      };
      
      const newSuggestion = await createSuggestion(suggestionData);
      
      // Add the new suggestion to the beginning of the list
      setSuggestions(prev => [newSuggestion, ...prev]);
      setIsSuggestionModalOpen(false);
    } catch (error) {
      console.error('Error creating suggestion:', error);
    }
  };

  // Handle suggestion voting
  const handleSuggestionVote = async (suggestionId: string, voteType: 'up' | 'down') => {
    try {
      const result = await voteSuggestion(suggestionId, voteType);
      
      // Update the suggestion in the list
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { 
              ...suggestion, 
              votes: result.votes, 
              hasUserVoted: result.userVoteType !== null,
              userVoteType: result.userVoteType || undefined
            }
          : suggestion
      ));
    } catch (error) {
      console.error('Error voting on suggestion:', error);
    }
  };

  // Handle suggestion comments
  const handleSuggestionComment = async (suggestionId: string) => {
    // For now, just log - could open a comment modal
    console.log('Opening comments for suggestion:', suggestionId);
  };

  // Handle suggestion rating
  const handleSuggestionRating = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      setSelectedSuggestionForRating(suggestion);
      setIsFeedbackModalOpen(true);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData: any) => {
    if (!selectedSuggestionForRating) return;

    try {
      // Call the API to submit the rating/feedback
      const result = await submitSuggestionFeedback(
        selectedSuggestionForRating.id,
        feedbackData.rating,
        feedbackData.categoryRatings,
        feedbackData.feedback
      );
      
      // Update the suggestion with new rating data from API response
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.id === selectedSuggestionForRating.id 
          ? {
              ...suggestion,
              rating: {
                ...suggestion.rating,
                averageRating: result.averageRating,
                totalRatings: result.totalRatings
              },
              userRating: feedbackData.rating
            }
          : suggestion
      ));

      setIsFeedbackModalOpen(false);
      setSelectedSuggestionForRating(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // For now, still update locally even if API fails
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.id === selectedSuggestionForRating.id 
          ? {
              ...suggestion,
              rating: {
                ...suggestion.rating,
                averageRating: feedbackData.rating,
                totalRatings: suggestion.rating.totalRatings + 1
              },
              userRating: feedbackData.rating
            }
          : suggestion
      ));

      setIsFeedbackModalOpen(false);
      setSelectedSuggestionForRating(null);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectDemo = (url: string) => {
    window.open(url, '_blank');
  };

  const handleProjectCode = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">{pathTitle} Developer</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Step by step guide to becoming a modern {pathTitle.toLowerCase()} developer in 2025
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <SimpleSVGViewer pathId={pathId} pathTitle={pathTitle} />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Learning Projects</h2>
              <div className="text-sm text-gray-400">
                {projectsLoading ? 'Loading...' : `${realProjects.length} projects available`}
              </div>
            </div>

            {/* Loading State */}
            {projectsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-400">Loading projects...</span>
              </div>
            )}

            {/* Error State */}
            {projectsError && (
              <Card className="bg-red-900/20 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Error loading projects: {projectsError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects Content */}
            {!projectsLoading && !projectsError && (
              <>
                {realProjects.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {realProjects.map((project: Project) => (
                      <div 
                        key={project.id} 
                        className="group cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                          {/* Header with title and type */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                                {project.title}
                              </h4>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                                  {project.projectType === 'STUDENT_PROJECT' ? 'Student Project' : 'Learning Project'}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  By {project.author}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>

                          {/* Technologies */}
                          <div className="mb-4">
                            <h5 className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Technologies</h5>
                            <div className="flex flex-wrap gap-2">
                              {project.technologies?.slice(0, 4).map((tech: string) => (
                                <span 
                                  key={tech} 
                                  className="px-2 py-1 bg-gray-700/60 text-gray-200 rounded-md text-xs font-medium border border-gray-600/50 hover:bg-gray-600/60 transition-colors"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies && project.technologies.length > 4 && (
                                <span className="px-2 py-1 bg-gray-700/60 text-gray-400 rounded-md text-xs font-medium border border-gray-600/50">
                                  +{project.technologies.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Key Features */}
                          {project.keyFeatures && project.keyFeatures.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Key Features</h5>
                              <ul className="text-gray-300 text-xs space-y-1">
                                {project.keyFeatures.slice(0, 3).map((feature: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <span className="line-clamp-1">{feature}</span>
                                  </li>
                                ))}
                                {project.keyFeatures.length > 3 && (
                                  <li className="text-gray-500 text-xs">
                                    +{project.keyFeatures.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Project Stats */}
                          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-700/30">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                Created {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                              {project.feedback && project.feedback.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  {project.feedback.length} feedback
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {project.liveUrl && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-200 transition-all"
                                  onClick={(e) => { e.stopPropagation(); handleProjectDemo(project.liveUrl!); }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Demo
                                </Button>
                              )}
                              {project.githubUrl && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="bg-gray-500/10 border-gray-500/30 text-gray-300 hover:bg-gray-500/20 hover:border-gray-400/50 hover:text-gray-200 transition-all"
                                  onClick={(e) => { e.stopPropagation(); handleProjectCode(project.githubUrl!); }}
                                >
                                  <Github className="w-4 h-4 mr-1" />
                                  Code
                                </Button>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-gray-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              View Details →
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {realProjects.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600/50">
                      <FolderOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Learning Projects Yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                      Learning projects for this career path will appear here as they become available. 
                      Check back soon or explore other career paths!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20">
                        Explore Other Paths
                      </Button>
                      <Button variant="ghost" className="text-gray-400 hover:text-white">
                        Submit Project Suggestion
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Community Suggestions</h2>
                <p className="text-gray-400">Help improve the {pathTitle.toLowerCase()} roadmap</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <Button
                  onClick={() => setIsSuggestionModalOpen(true)}
                  className="flex items-center gap-2"
                  disabled={!user}
                  title={!user ? "Please log in to submit suggestions" : "Submit a suggestion"}
                >
                  <Plus className="w-4 h-4" />
                  {user ? "Add Suggestion" : "Login to Suggest"}
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <SuggestionFilters
                filters={suggestionFilters}
                onFiltersChange={setSuggestionFilters}
              />
            )}

            {/* Loading State */}
            {suggestionsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-400">Loading suggestions...</span>
              </div>
            )}

            {/* Error State */}
            {suggestionsError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Failed to load suggestions</h3>
                  <p className="text-gray-400">{suggestionsError}</p>
                </div>
              </div>
            )}

            {/* Suggestions List */}
            {!suggestionsLoading && !suggestionsError && (
              <>
                {suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onVote={handleSuggestionVote}
                        onComment={handleSuggestionComment}
                        onRate={handleSuggestionRating}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquarePlus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No suggestions yet</h3>
                    <p className="text-gray-400 mb-4">
                      Be the first to suggest improvements for the {pathTitle.toLowerCase()} roadmap!
                    </p>
                    <Button
                      onClick={() => setIsSuggestionModalOpen(true)}
                      className="flex items-center gap-2"
                      disabled={!user}
                      title={!user ? "Please log in to submit suggestions" : "Submit the first suggestion"}
                    >
                      <Plus className="w-4 h-4" />
                      {user ? "Add First Suggestion" : "Login to Suggest"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Learning Project Modal */}
      <LearningProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onBack={handleModalClose}
      />

      {/* Suggestion Modal */}
      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        careerPathId={pathId}
        careerPathTitle={pathTitle}
        onSubmit={handleSuggestionSubmit}
      />

      {/* Suggestion Feedback Modal */}
      <SuggestionFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedSuggestionForRating(null);
        }}
        suggestionId={selectedSuggestionForRating?.id || ''}
        suggestionTitle={selectedSuggestionForRating?.title || ''}
        currentRating={selectedSuggestionForRating?.userRating || 0}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default TabbedCareerView; 