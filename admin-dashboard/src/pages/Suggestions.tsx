import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Tag,
  AlertTriangle,
  FileText,
  Plus,
  MoreVertical,
  Eye,
  MessageCircle,
  ThumbsUp,
  ArrowUpDown,
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

// Card components for consistent styling
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-gray-900/50 rounded-xl border border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Button component for consistent styling
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Types for suggestions management
interface AdminSuggestion {
  id: string;
  type: 'improvement' | 'content' | 'feature' | 'bug' | 'other';
  title: string;
  description: string;
  careerPathId: string;
  careerPathTitle: string;
  author: string;
  authorId: string;
  authorRole: 'STUDENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  votes: number;
  status: 'pending' | 'under_review' | 'approved' | 'implemented' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  adminResponse?: string;
  adminNotes?: string;
  commentsCount: number;
  implementationDate?: string;
}

interface SuggestionStats {
  totalSuggestions: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
  implementedSuggestions: number;
  rejectedSuggestions: number;
  suggestionsByType: Record<string, number>;
  suggestionsByCareerPath: Record<string, number>;
  averageVotes: number;
  topTags: Array<{ tag: string; count: number }>;
}

const SuggestionsPage: React.FC = () => {
  // State management
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [stats, setStats] = useState<SuggestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCareerPath, setFilterCareerPath] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AdminSuggestion | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSuggestions([
        {
          id: '1',
          type: 'improvement',
          title: 'Add Modern React Features',
          description: 'Include more examples of React Hooks, Context API, and modern patterns in the frontend roadmap.',
          careerPathId: 'frontend',
          careerPathTitle: 'Frontend Development',
          author: 'Alex Chen',
          authorId: 'user-1',
          authorRole: 'PROFESSIONAL',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          votes: 23,
          status: 'pending',
          priority: 'medium',
          tags: ['react', 'hooks', 'modern'],
          commentsCount: 5
        },
        {
          id: '2',
          type: 'content',
          title: 'TypeScript Integration Guide',
          description: 'Create a comprehensive guide for integrating TypeScript into existing JavaScript projects.',
          careerPathId: 'frontend',
          careerPathTitle: 'Frontend Development',
          author: 'Sarah Johnson',
          authorId: 'user-2',
          authorRole: 'STUDENT',
          createdAt: '2024-01-14T15:45:00Z',
          updatedAt: '2024-01-14T15:45:00Z',
          votes: 18,
          status: 'approved',
          priority: 'high',
          tags: ['typescript', 'javascript', 'migration'],
          adminResponse: 'Great suggestion! We\'ll include this in the next roadmap update.',
          commentsCount: 3
        },
        {
          id: '3',
          type: 'feature',
          title: 'Interactive Code Challenges',
          description: 'Add hands-on coding challenges within each section of the roadmap for better learning.',
          careerPathId: 'backend',
          careerPathTitle: 'Backend Development',
          author: 'Mike Rodriguez',
          authorId: 'user-3',
          authorRole: 'COMPANY',
          createdAt: '2024-01-13T09:20:00Z',
          updatedAt: '2024-01-13T09:20:00Z',
          votes: 31,
          status: 'implemented',
          priority: 'high',
          tags: ['interactive', 'challenges', 'learning'],
          implementationDate: '2024-01-20T00:00:00Z',
          commentsCount: 8
        }
      ]);

      setStats({
        totalSuggestions: 3,
        pendingSuggestions: 1,
        approvedSuggestions: 1,
        implementedSuggestions: 1,
        rejectedSuggestions: 0,
        suggestionsByType: {
          improvement: 1,
          content: 1,
          feature: 1,
          bug: 0,
          other: 0
        },
        suggestionsByCareerPath: {
          frontend: 2,
          backend: 1,
          devops: 0
        },
        averageVotes: 24,
        topTags: [
          { tag: 'react', count: 2 },
          { tag: 'typescript', count: 1 },
          { tag: 'interactive', count: 1 }
        ]
      });

      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => {
      const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           suggestion.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || suggestion.status === filterStatus;
      const matchesType = filterType === 'all' || suggestion.type === filterType;
      const matchesCareerPath = filterCareerPath === 'all' || suggestion.careerPathId === filterCareerPath;
      
      return matchesSearch && matchesStatus && matchesType && matchesCareerPath;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most_voted':
          return b.votes - a.votes;
        case 'least_voted':
          return a.votes - b.votes;
        default:
          return 0;
      }
    });

  // Helper functions
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      under_review: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Eye },
      approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
      implemented: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      improvement: { color: 'bg-blue-500/20 text-blue-400', icon: TrendingUp },
      content: { color: 'bg-green-500/20 text-green-400', icon: FileText },
      feature: { color: 'bg-purple-500/20 text-purple-400', icon: Plus },
      bug: { color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
      other: { color: 'bg-gray-500/20 text-gray-400', icon: Tag }
    };
    return configs[type as keyof typeof configs] || configs.other;
  };

  const handleStatusUpdate = (suggestionId: string, newStatus: string) => {
    setSuggestions(prev => prev.map(suggestion => 
      suggestion.id === suggestionId 
        ? { ...suggestion, status: newStatus as any, updatedAt: new Date().toISOString() }
        : suggestion
    ));
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on suggestions:`, selectedSuggestions);
    setSelectedSuggestions([]);
  };

  const handleViewDetails = (suggestion: AdminSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Suggestions Management</h1>
          <p className="text-gray-400 mt-1">Manage community feedback and improvement suggestions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Suggestions</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalSuggestions}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pendingSuggestions}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Implemented</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{stats.implementedSuggestions}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Average Votes</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{stats.averageVotes}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[130px]"
              >
                <option value="all">All Types</option>
                <option value="improvement">Improvement</option>
                <option value="content">Content</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_voted">Most Voted</option>
                <option value="least_voted">Least Voted</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSuggestions.length > 0 && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-blue-400 font-medium">
                  {selectedSuggestions.length} suggestion{selectedSuggestions.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuggestions(filteredSuggestions.map(s => s.id));
                      } else {
                        setSelectedSuggestions([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Suggestion
                </th>
                <th className="hidden md:table-cell px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="hidden lg:table-cell px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Career Path
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Votes
                </th>
                <th className="hidden xl:table-cell px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSuggestions.map((suggestion) => {
                const statusConfig = getStatusConfig(suggestion.status);
                const typeConfig = getTypeConfig(suggestion.type);
                const StatusIcon = statusConfig.icon;
                const TypeIcon = typeConfig.icon;

                return (
                  <tr key={suggestion.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.includes(suggestion.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSuggestions(prev => [...prev, suggestion.id]);
                          } else {
                            setSelectedSuggestions(prev => prev.filter(id => id !== suggestion.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${typeConfig.color} flex-shrink-0`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white truncate">{suggestion.title}</h3>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-1 rounded text-xs ${typeConfig.color} capitalize`}>
                              {suggestion.type}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs border capitalize ${
                              suggestion.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              suggestion.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {suggestion.priority}
                            </span>
                            {/* Show author on mobile */}
                            <span className="md:hidden text-xs text-gray-500">
                              by {suggestion.author}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{suggestion.author}</p>
                          <p className="text-xs text-gray-400 capitalize">{suggestion.authorRole.toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4">
                      <span className="text-gray-300">{suggestion.careerPathTitle}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline capitalize">{suggestion.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{suggestion.votes}</span>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-4 lg:px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(suggestion)}
                          className="p-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No suggestions found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your filters to see more results'
                : 'No suggestions have been submitted yet'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeConfig(selectedSuggestion.type).color}`}>
                  {React.createElement(getTypeConfig(selectedSuggestion.type).icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Suggestion Details</h2>
                  <p className="text-gray-400 text-sm">ID: {selectedSuggestion.id}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Title and Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <h3 className="text-lg font-semibold text-white mb-4">{selectedSuggestion.title}</h3>
                
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <p className="text-gray-300 leading-relaxed bg-gray-800/50 rounded-lg p-4">
                  {selectedSuggestion.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Author</label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white">{selectedSuggestion.author}</span>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded capitalize">
                        {selectedSuggestion.authorRole.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Career Path</label>
                    <p className="text-white">{selectedSuggestion.careerPathTitle}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                    <span className={`inline-block px-2 py-1 rounded text-sm border capitalize ${
                      selectedSuggestion.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      selectedSuggestion.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      selectedSuggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {selectedSuggestion.priority}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Votes</label>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{selectedSuggestion.votes}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedSuggestion.tags && selectedSuggestion.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSuggestion.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={selectedSuggestion.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedSuggestion(prev => prev ? { ...prev, status: newStatus as any } : null);
                    handleStatusUpdate(selectedSuggestion.id, newStatus);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="implemented">Implemented</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Admin Response */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Admin Response</label>
                <textarea
                  value={selectedSuggestion.adminResponse || ''}
                  onChange={(e) => {
                    setSelectedSuggestion(prev => prev ? { ...prev, adminResponse: e.target.value } : null);
                  }}
                  placeholder="Add a response to this suggestion..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default SuggestionsPage;
