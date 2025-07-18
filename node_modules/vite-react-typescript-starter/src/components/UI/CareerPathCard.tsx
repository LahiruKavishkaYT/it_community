import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Star, 
  TrendingUp, 
  Clock, 
  Users, 
  Briefcase, 
  BookOpen, 
  ArrowRight,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { Card, CardContent } from './Card';
import Button from './Button';

interface CareerPathCardProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  skills: string[];
  roles: string[];
  averageSalary: string;
  demandLevel: string;
  category: string;
  salaryMin: number;
  salaryMax: number;
  onExplore: (id: string) => void;
  isCompact?: boolean;
}

const CareerPathCard: React.FC<CareerPathCardProps> = ({
  id,
  title,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  description,
  skills,
  roles,
  averageSalary,
  demandLevel,
  category,
  salaryMin,
  salaryMax,
  onExplore,
  isCompact = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate demand level styling
  const getDemandStyling = (level: string) => {
    switch (level) {
      case 'Extremely High':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/20',
          icon: '🔥'
        };
      case 'Very High':
        return {
          bg: 'bg-orange-500/10',
          text: 'text-orange-400',
          border: 'border-orange-500/20',
          icon: '⚡'
        };
      case 'High':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          border: 'border-yellow-500/20',
          icon: '📈'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20',
          icon: '💼'
        };
    }
  };

  const demandStyling = getDemandStyling(demandLevel);



  // Essential data for career path cards (would come from backend in real app)
  const pathData = {
    globalJobCount: Math.floor(Math.random() * 2000) + 500,
    learningTimeMonths: id === 'ai-engineer' || id === 'data-scientist' ? '8-12' : '6-10',
    globalSalary: getGlobalAverageSalary(),
    successRate: Math.floor(Math.random() * 20) + 75, // 75-95% success rate
    rating: (4.2 + Math.random() * 0.7).toFixed(1), // 4.2-4.9 rating
    learningResources: Math.floor(Math.random() * 50) + 30 // 30-80 resources
  };

  // Get global average salary with proper formatting
  function getGlobalAverageSalary() {
    const avg = (salaryMin + salaryMax) / 2;
    if (avg >= 1000000) {
      return `$${(avg / 1000000).toFixed(1)}M`;
    } else if (avg >= 100000) {
      return `$${Math.round(avg / 1000)}K`;
    } else {
      return `$${Math.round(avg / 1000)}K`;
    }
  }

  const handleExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExplore(id);
  };



  const handleViewJobs = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to jobs page with career path filter
    navigate(`/jobs?category=${encodeURIComponent(category)}&skills=${encodeURIComponent(skills.join(','))}`);
  };

  if (isCompact) {
    return (
      <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${bgColor} border ${borderColor} group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm truncate">{title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                                 <span className={`text-xs px-2 py-0.5 rounded-full ${demandStyling.bg} ${demandStyling.text} border ${demandStyling.border}`}>
                   {demandStyling.icon} {demandLevel}
                 </span>
                 <span className="text-xs text-gray-400">{pathData.globalSalary}</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${bgColor} border ${borderColor} group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-sm text-gray-400 capitalize">{category}</p>
              </div>
            </div>
                         <div className="flex items-center space-x-1 text-sm">
               <Star className="h-4 w-4 text-yellow-400 fill-current" />
               <span className="text-gray-300">{pathData.rating}</span>
             </div>
          </div>

          {/* Demand Level Badge */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${demandStyling.bg} ${demandStyling.text} border ${demandStyling.border} mb-4`}>
            <span className="text-sm">{demandStyling.icon}</span>
            <span className="text-sm font-medium">{demandLevel} Demand</span>
            <TrendingUp className="h-3 w-3" />
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>

                     {/* Key Metrics */}
           <div className="mb-4">
             <div className="text-center p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
               <div className="text-2xl font-bold text-white">{pathData.globalSalary}</div>
               <div className="text-sm text-gray-400">Global Average Salary</div>
             </div>
           </div>

                     {/* Skills Preview */}
           <div className="mb-4">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium text-gray-300">Top Skills</span>
               <BookOpen className="h-4 w-4 text-gray-400" />
             </div>
             <div className="flex flex-wrap gap-1">
               {skills.map((skill, index) => (
                 <span
                   key={index}
                   className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                 >
                   {skill}
                 </span>
               ))}
             </div>
           </div>

                     {/* Career Stats */}
           <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
             <div className="flex items-center space-x-1">
               <Briefcase className="h-3 w-3" />
               <span>{pathData.globalJobCount.toLocaleString()} jobs</span>
             </div>
             <div className="flex items-center space-x-1">
               <Target className="h-3 w-3" />
               <span>{pathData.successRate}% success</span>
             </div>
             <div className="flex items-center space-x-1">
               <BookOpen className="h-3 w-3" />
               <span>{pathData.learningResources} resources</span>
             </div>
           </div>
        </div>

                 {/* Action Buttons */}
         <div className="px-6 pb-6">
           <div className="flex space-x-2">
             <Button
               onClick={handleExplore}
               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
               size="sm"
             >
               <Target className="h-4 w-4 mr-2" />
               Interactive Roadmap
             </Button>
           </div>
          
          {/* Secondary Actions */}
          <div className="flex space-x-2 mt-2">
                         <Button
               onClick={handleViewJobs}
               variant="ghost"
               className="flex-1 text-gray-400 hover:text-blue-400 text-xs py-2 px-3 rounded-lg transition-colors"
               size="sm"
             >
               <Briefcase className="h-3 w-3 mr-1" />
               View Jobs ({pathData.globalJobCount})
             </Button>
            
          </div>
        </div>

        

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>
    </Card>
  );
};

export default CareerPathCard; 