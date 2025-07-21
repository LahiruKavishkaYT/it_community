import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ProjectStatusCardProps {
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  details?: React.ReactNode;
  className?: string;
}

export const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({
  title,
  status,
  description,
  details,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          {details && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          )}
        </div>
        {description && (
          <p className="text-gray-300 text-sm mt-2">{description}</p>
        )}
      </CardHeader>
      
      {details && isExpanded && (
        <CardContent className="border-t border-gray-700/50 pt-4">
          {details}
        </CardContent>
      )}
    </Card>
  );
}; 