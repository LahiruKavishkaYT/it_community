import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/UI/AuthModal';
import { useAuthModal } from '../hooks/useAuthModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Github, 
  ExternalLink, 
  MessageCircle,
  Calendar,
  Loader2,
  BookOpen,
  Users,
  GraduationCap,
  Briefcase,
  Grid3X3,
  ArrowRight,
  Eye,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import ProjectDetailModal from '../components/UI/ProjectDetailModal';
import { Project, ProjectType } from '../types';
import { getProjectsByType, getProjects } from '../services/api';

type TabKey = 'priority' | 'secondary' | 'all';

interface TabConfig {
  key: TabKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
}

interface ProjectsState {
  priority: Project[];
  secondary: Project[];
  all: Project[];
}

interface LoadingState {
  priority: boolean;
  secondary: boolean;
  all: boolean;
}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isModalOpen, modalAction, modalFeature, requireAuth, closeModal, isAuthenticated } = useAuthModal();
  const [activeTab, setActiveTab] = useState<TabKey>('priority');
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<ProjectsState>({
    priority: [],
    secondary: [],
    all: []
  });
  const [loading, setLoading] = useState<LoadingState>({
    priority: false,
    secondary: false,
    all: false
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Memoized project type getters
  const projectTypes = useMemo(() => ({
    priority: user?.role === 'STUDENT' ? 'PRACTICE_PROJECT' as ProjectType : 'STUDENT_PROJECT' as ProjectType,
    secondary: user?.role === 'STUDENT' ? 'STUDENT_PROJECT' as ProjectType : 'PRACTICE_PROJECT' as ProjectType
  }), [user?.role]);

  // Memoized tab configuration
  const tabConfigs = useMemo((): TabConfig[] => {
    if (!user) {
      return [
        {
          key: 'all',
          label: 'All Projects',
          description: 'Browse all projects',
          icon: <Grid3X3 className="h-4 w-4" />,
          count: projects.all.length
        }
      ];
    }

    return [
      {
        key: 'priority',
        label: user.role === 'STUDENT' ? 'Learning Projects' : 'Student Projects',
        description: user.role === 'STUDENT' 
          ? 'Practice projects by IT professionals'
          : 'Student projects needing feedback',
        icon: user.role === 'STUDENT' ? <BookOpen className="h-4 w-4" /> : <Users className="h-4 w-4" />,
        count: projects.priority.length
      },
      {
        key: 'secondary',
        label: user.role === 'STUDENT' ? 'Student Projects' : 'Learning Projects',
        description: user.role === 'STUDENT'
          ? 'Portfolio projects by fellow students'
          : 'Practice projects by professionals',
        icon: user.role === 'STUDENT' ? <Users className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />,
        count: projects.secondary.length
      },
      {
        key: 'all',
        label: 'All Projects',
        description: 'Browse all projects',
        icon: <Grid3X3 className="h-4 w-4" />,
        count: projects.all.length
      }
    ];
  }, [user, projects]);

  // Optimized data fetching with caching
  const fetchProjectsForTab = useCallback(async (tab: TabKey) => {
    if (!user && tab !== 'all') return;
    
    setLoading(prev => ({ ...prev, [tab]: true }));
      setError(null);

      try {
      let projectsData: Project[];
      
      switch (tab) {
        case 'priority':
          projectsData = await getProjectsByType(projectTypes.priority);
          break;
        case 'secondary':
          projectsData = await getProjectsByType(projectTypes.secondary);
          break;
        case 'all':
        default:
          projectsData = await getProjects();
          break;
      }
      
      setProjects(prev => ({
        ...prev,
        [tab]: projectsData
      }));
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        console.error('Error fetching projects:', err);
      } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
      }
  }, [user, projectTypes]);

  // Load initial data and cache adjacent tabs
  useEffect(() => {
    if (!user) {
      fetchProjectsForTab('all');
      setActiveTab('all');
      return;
    }

    // Load priority tab first, then preload other tabs
    fetchProjectsForTab('priority').then(() => {
      // Preload secondary tab for better UX
      setTimeout(() => fetchProjectsForTab('secondary'), 500);
      // Preload all projects tab
      setTimeout(() => fetchProjectsForTab('all'), 1000);
    });
  }, [user, fetchProjectsForTab]);

  // Optimized search filtering
  const currentProjects = useMemo(() => {
    const projectList = projects[activeTab] || [];
    
    if (!searchTerm.trim()) return projectList;
    
    const searchLower = searchTerm.toLowerCase();
    return projectList.filter(project => 
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchLower))
    );
  }, [projects, activeTab, searchTerm]);

  // Tab switching with smooth transitions
  const handleTabChange = useCallback((tab: TabKey) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    // Fetch data if not already loaded
    if (projects[tab].length === 0 && !loading[tab]) {
      fetchProjectsForTab(tab);
    }
  }, [activeTab, projects, loading, fetchProjectsForTab]);

  // Project detail handlers
  const handleProjectClick = useCallback((project: Project, openInModal = false) => {
    if (openInModal) {
      setSelectedProjectId(project.id);
      setIsProjectModalOpen(true);
    } else {
      navigate(`/projects/${project.id}`);
    }
  }, [navigate]);

  const handleModalClose = useCallback(() => {
    setIsProjectModalOpen(false);
    setSelectedProjectId(null);
  }, []);

  // Project type badge component
  const ProjectTypeBadge = React.memo(({ projectType }: { projectType: ProjectType }) => {
    const isStudentProject = projectType === 'STUDENT_PROJECT';
    return (
      <span className={`
        inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border transition-colors
        ${isStudentProject 
          ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' 
          : 'bg-green-600/20 text-green-300 border-green-500/30'
        }
      `}>
        {isStudentProject ? <GraduationCap className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
        {isStudentProject ? 'Student Project' : 'Learning Project'}
      </span>
    );
  });

  // Project card component
  const ProjectCard = React.memo(({ project }: { project: Project }) => (
    <div 
      className="cursor-pointer"
      onClick={() => handleProjectClick(project, false)}
    >
      <Card hover className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden relative">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
                  />
                ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                    <span className="text-white text-2xl font-bold">
              {project.title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
        <div className="absolute top-3 right-3">
          <ProjectTypeBadge projectType={project.projectType} />
        </div>
        
        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProjectClick(project, true);
              }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
              title="Quick View"
            >
              <Eye className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProjectClick(project, false);
              }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
              title="Full Details"
            >
              <Maximize2 className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
              </div>
              
      <CardContent className="p-6 space-y-4">
                  <div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
                  </div>

        {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md border border-gray-600/50"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
              <span className="px-2 py-1 bg-gray-700/30 text-gray-400 text-xs rounded-md">
                +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400 pt-2 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                      <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{project.feedback?.length || 0}</span>
                      </div>
                    </div>
                    
          <div className="flex items-center space-x-1">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                onClick={e => e.stopPropagation()}
                        >
                <Github className="h-3 w-3" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                onClick={e => e.stopPropagation()}
                        >
                <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>by {typeof project.author === 'string' ? project.author : 'Unknown Author'}</span>
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
    </div>
  ));

  const isCurrentTabLoading = loading[activeTab];
  const hasNoProjects = currentProjects.length === 0 && !isCurrentTabLoading;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Projects</h1>
              <p className="text-gray-300 max-w-2xl">
                {user?.role === 'STUDENT' && 'Discover learning projects to enhance your skills and share your student projects'}
                {user?.role === 'PROFESSIONAL' && 'Share learning projects for students and provide feedback on their work'}
                {user?.role === 'COMPANY' && 'Discover talented developers through their project portfolios'}
                {!user && 'Explore amazing projects from our developer community'}
              </p>
            </div>
            
            {/* Create Project Button - Show for authenticated users or trigger modal for guests */}
            {!user ? (
              <Button 
                onClick={() => requireAuth('share your project', 'Projects')} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                <span>Share Your Project</span>
              </Button>
            ) : (user.role === 'STUDENT' || user.role === 'PROFESSIONAL') && (
              <Button 
                onClick={() => navigate('/projects/new')} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {user.role === 'STUDENT' ? 'Upload Student Project' : 'Upload Learning Project'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Segmented Control Navigation */}
        {user && (
          <div className="bg-gray-800/50 p-1 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex space-x-1">
              {tabConfigs.map((config) => (
                <button
                  key={config.key}
                  onClick={() => handleTabChange(config.key)}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${activeTab === config.key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  {config.icon}
                  <span>{config.label}</span>
                  {config.count !== undefined && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${activeTab === config.key 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-600 text-gray-300'
                      }
                    `}>
                      {config.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, technologies, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
                </div>
              </CardContent>
            </Card>

        {/* Content Section */}
        <div className="space-y-6">
          {/* Tab Description */}
          {user && (
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">
                {tabConfigs.find(t => t.key === activeTab)?.label}
              </h2>
              <p className="text-gray-400">
                {tabConfigs.find(t => t.key === activeTab)?.description}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isCurrentTabLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-gray-300">Loading projects...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isCurrentTabLoading && (
            <div className="flex items-center justify-center py-16">
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-red-400">{error}</p>
                  <Button onClick={() => fetchProjectsForTab(activeTab)}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {hasNoProjects && !error && (
            <div className="text-center py-16 space-y-4">
              <div className="text-gray-400 text-lg">No projects found</div>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? (
                  'Try adjusting your search terms or browse different categories'
                ) : (
                  `No ${tabConfigs.find(t => t.key === activeTab)?.label.toLowerCase()} available yet`
                )}
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {currentProjects.length > 0 && !isCurrentTabLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Project Detail Modal */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          isOpen={isProjectModalOpen}
          onClose={handleModalClose}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        action={modalAction}
        feature={modalFeature}
      />
    </div>
  );
};

export default ProjectsPage;