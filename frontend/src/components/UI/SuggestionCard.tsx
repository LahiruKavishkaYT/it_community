import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Clock, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Tag,
  Star
} from 'lucide-react';
import { Card, CardContent } from './Card';
import StarRating from './StarRating';

interface SuggestionCardProps {
  suggestion: {
    id: string;
    type: 'improvement' | 'content' | 'feature' | 'bug' | 'other';
    title: string;
    description: string;
    author: string;
    authorAvatar?: string;
    createdAt: string;
    votes: number;
    hasUserVoted: boolean;
    userVoteType?: 'up' | 'down';
    // Enhanced rating system
    rating: {
      averageRating: number;
      totalRatings: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    userRating?: number;
    status: 'pending' | 'under_review' | 'approved' | 'implemented' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    adminResponse?: string;
    commentsCount: number;
  };
  onVote: (suggestionId: string, voteType: 'up' | 'down') => void;
  onComment: (suggestionId: string) => void;
  onRate?: (suggestionId: string) => void;
  showAdminActions?: boolean;
  onAdminAction?: (suggestionId: string, action: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  onVote, 
  onComment,
  onRate,
  showAdminActions = false,
  onAdminAction
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pending' };
      case 'under_review':
        return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Under Review' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Approved' };
      case 'implemented':
        return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Implemented' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Rejected' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Unknown' };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'improvement':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Improvement' };
      case 'content':
        return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Content' };
      case 'feature':
        return { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Feature' };
      case 'bug':
        return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Bug' };
      case 'other':
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Other' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Unknown' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return { color: 'text-gray-400', bg: 'bg-gray-500/20' };
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'high':
        return { color: 'text-orange-400', bg: 'bg-orange-500/20' };
      case 'critical':
        return { color: 'text-red-400', bg: 'bg-red-500/20' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20' };
    }
  };

  const statusConfig = getStatusConfig(suggestion.status);
  const typeConfig = getTypeConfig(suggestion.type);
  const priorityConfig = getPriorityConfig(suggestion.priority);
  const StatusIcon = statusConfig.icon;

  const truncatedDescription = suggestion.description.length > 200 
    ? suggestion.description.substring(0, 200) + '...'
    : suggestion.description;

  const handleVote = (voteType: 'up' | 'down') => {
    onVote(suggestion.id, voteType);
  };

  return (
    <Card className="bg-gray-900/60 border-gray-700 hover:border-gray-600 transition-colors">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{suggestion.author}</span>
                <span className={`px-2 py-1 rounded text-xs ${typeConfig.bg} ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${priorityConfig.bg} ${priorityConfig.color}`}>
                  {suggestion.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">
                  {new Date(suggestion.createdAt).toLocaleDateString()}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
          
          {showAdminActions && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showAdminMenu && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                  <button
                    onClick={() => onAdminAction?.(suggestion.id, 'approve')}
                    className="w-full px-3 py-2 text-left text-sm text-green-400 hover:bg-gray-700 first:rounded-t-lg"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onAdminAction?.(suggestion.id, 'reject')}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onAdminAction?.(suggestion.id, 'implement')}
                    className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-gray-700"
                  >
                    Mark Implemented
                  </button>
                  <button
                    onClick={() => onAdminAction?.(suggestion.id, 'respond')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 last:rounded-b-lg"
                  >
                    Add Response
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-3">{suggestion.title}</h3>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-300 leading-relaxed">
            {showFullDescription ? suggestion.description : truncatedDescription}
          </p>
          {suggestion.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Tags */}
        {suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestion.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Admin Response */}
        {suggestion.adminResponse && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-400">Admin Response</span>
            </div>
            <p className="text-sm text-gray-300">{suggestion.adminResponse}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Voting */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                  suggestion.hasUserVoted && suggestion.userVoteType === 'up'
                    ? 'bg-green-600/20 text-green-400'
                    : 'text-gray-400 hover:text-green-400 hover:bg-green-600/10'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{suggestion.votes}</span>
              </button>
              
              <button
                onClick={() => handleVote('down')}
                className={`p-1 rounded transition-colors ${
                  suggestion.hasUserVoted && suggestion.userVoteType === 'down'
                    ? 'text-red-400'
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Comments */}
            <button
              onClick={() => onComment(suggestion.id)}
              className="flex items-center gap-1 px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{suggestion.commentsCount}</span>
            </button>

            {/* Rating Display */}
            <div className="flex items-center gap-2">
              <StarRating
                rating={suggestion.rating.averageRating}
                totalRatings={suggestion.rating.totalRatings}
                size="sm"
                showCount
              />
            </div>
          </div>

          {/* Rate Button */}
          {onRate && (
            <button
              onClick={() => onRate(suggestion.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                suggestion.userRating
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-600/10 border border-gray-600'
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="text-sm">
                {suggestion.userRating ? `Rated ${suggestion.userRating}★` : 'Rate'}
              </span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionCard;
