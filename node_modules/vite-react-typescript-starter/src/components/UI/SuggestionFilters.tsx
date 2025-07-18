import React from 'react';
import { 
  Filter, 
  Search, 
  Tag, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from './Card';
import Button from './Button';
import { SuggestionFilters as FilterType, SuggestionType, SuggestionStatus, SuggestionPriority } from '../../types';

interface SuggestionFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  className?: string;
}

const SUGGESTION_TYPES: { value: SuggestionType; label: string; icon: any; color: string }[] = [
  { value: 'improvement', label: 'Improvement', icon: TrendingUp, color: 'blue' },
  { value: 'content', label: 'Content', icon: AlertCircle, color: 'green' },
  { value: 'feature', label: 'Feature', icon: Tag, color: 'purple' },
  { value: 'bug', label: 'Bug Report', icon: AlertCircle, color: 'red' },
  { value: 'other', label: 'Other', icon: Tag, color: 'gray' }
];

const SUGGESTION_STATUSES: { value: SuggestionStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'under_review', label: 'Under Review', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'implemented', label: 'Implemented', color: 'emerald' },
  { value: 'rejected', label: 'Rejected', color: 'red' }
];

const SUGGESTION_PRIORITIES: { value: SuggestionPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_voted', label: 'Most Voted' },
  { value: 'least_voted', label: 'Least Voted' }
];

const SuggestionFilters: React.FC<SuggestionFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  className = '' 
}) => {
  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== 'newest' && value !== ''
  );

  return (
    <Card className={`bg-gray-900/60 border-gray-700 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-semibold text-white">Filters</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suggestions..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {SUGGESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {SUGGESTION_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => updateFilter('priority', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {SUGGESTION_PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              placeholder="Filter by tags (comma-separated)"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tagString = e.target.value;
                const tags = tagString ? tagString.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                updateFilter('tags', tags.length > 0 ? tags : undefined);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter tags separated by commas
            </p>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.type && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  Type: {SUGGESTION_TYPES.find(t => t.value === filters.type)?.label}
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  Status: {SUGGESTION_STATUSES.find(s => s.value === filters.status)?.label}
                </span>
              )}
              {filters.priority && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                  Priority: {SUGGESTION_PRIORITIES.find(p => p.value === filters.priority)?.label}
                </span>
              )}
              {filters.search && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.tags && filters.tags.length > 0 && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  Tags: {filters.tags.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionFilters;
