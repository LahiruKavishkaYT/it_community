import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  X, 
  CheckCircle2, 
  Circle, 
  Clock,
  BookOpen,
  ExternalLink,
  Users,
  Star,
  Play
} from 'lucide-react';
import { Card, CardContent } from './Card';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'not-started' | 'in-progress' | 'completed';
  resources: {
    courses: number;
    articles: number;
    projects: number;
  };
  estimatedTime: string;
  prerequisites?: string[];
}

interface InteractiveRoadmapProps {
  pathId: string;
  title: string;
  svgContent?: string;
  nodes?: RoadmapNode[];
}

const InteractiveRoadmap: React.FC<InteractiveRoadmapProps> = ({
  pathId,
  title,
  svgContent,
  nodes = []
}) => {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sample roadmap data for frontend (this would come from backend in real app)
  const frontendRoadmap: RoadmapNode[] = [
    {
      id: 'html-basics',
      title: 'HTML Fundamentals',
      description: 'Learn the building blocks of web development with semantic HTML5',
      category: 'beginner',
      status: user ? 'completed' : 'not-started',
      resources: { courses: 15, articles: 45, projects: 8 },
      estimatedTime: '2-3 weeks'
    },
    {
      id: 'css-fundamentals',
      title: 'CSS & Styling',
      description: 'Master CSS3, Flexbox, Grid, and responsive design principles',
      category: 'beginner',
      status: user ? 'in-progress' : 'not-started',
      resources: { courses: 20, articles: 60, projects: 12 },
      estimatedTime: '3-4 weeks',
      prerequisites: ['html-basics']
    },
    {
      id: 'javascript-core',
      title: 'JavaScript Fundamentals',
      description: 'Core JavaScript concepts, ES6+, DOM manipulation, and async programming',
      category: 'intermediate',
      status: 'not-started',
      resources: { courses: 25, articles: 80, projects: 15 },
      estimatedTime: '6-8 weeks',
      prerequisites: ['html-basics', 'css-fundamentals']
    },
    {
      id: 'react-framework',
      title: 'React Framework',
      description: 'Component-based development with React, hooks, and state management',
      category: 'intermediate',
      status: 'not-started',
      resources: { courses: 30, articles: 90, projects: 20 },
      estimatedTime: '8-10 weeks',
      prerequisites: ['javascript-core']
    },
    {
      id: 'advanced-react',
      title: 'Advanced React',
      description: 'Performance optimization, testing, and production best practices',
      category: 'advanced',
      status: 'not-started',
      resources: { courses: 15, articles: 40, projects: 10 },
      estimatedTime: '4-6 weeks',
      prerequisites: ['react-framework']
    }
  ];

  const roadmapData = nodes.length > 0 ? nodes : frontendRoadmap;

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node interaction
  const handleNodeClick = (nodeId: string) => {
    const node = roadmapData.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981'; // green
      case 'in-progress': return '#F59E0B'; // yellow
      default: return '#6B7280'; // gray
    }
  };

  const getNodeCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return '#3B82F6'; // blue
      case 'intermediate': return '#8B5CF6'; // purple
      case 'advanced': return '#EF4444'; // red
      case 'expert': return '#F97316'; // orange
      default: return '#6B7280'; // gray
    }
  };

  const calculateProgress = () => {
    const completed = roadmapData.filter(node => node.status === 'completed').length;
    const inProgress = roadmapData.filter(node => node.status === 'in-progress').length;
    return {
      completed: (completed / roadmapData.length) * 100,
      inProgress: ((completed + inProgress) / roadmapData.length) * 100
    };
  };

  const progress = calculateProgress();

  return (
    <>
      {/* Main Roadmap Container */}
      <Card className="relative overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                {title} Learning Roadmap
              </h3>
              {user && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${progress.completed}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-300">{Math.round(progress.completed)}% Complete</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {roadmapData.filter(n => n.status === 'completed').length} of {roadmapData.length} skills mastered
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-300 px-2 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetView}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Roadmap Viewer */}
        <div 
          ref={containerRef}
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ height: '600px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Enhanced Visual Roadmap */}
          <div 
            className="absolute inset-0 transition-transform duration-200"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Roadmap Path Background */}
            <svg 
              width="100%" 
              height="100%" 
              className="absolute inset-0"
              style={{ minWidth: '800px', minHeight: '600px' }}
            >
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Connection Lines */}
              <g className="opacity-60">
                <path d="M 150 100 Q 300 100 450 200" stroke="#3B82F6" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                <path d="M 450 250 Q 600 250 750 350" stroke="#8B5CF6" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
                <path d="M 750 400 Q 900 400 1050 500" stroke="#EF4444" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
              </g>
            </svg>

            {/* Interactive Nodes */}
            <div className="relative" style={{ minWidth: '1200px', minHeight: '600px' }}>
              {roadmapData.map((node, index) => {
                const x = 150 + (index * 200);
                const y = 100 + (index % 2) * 150;
                
                return (
                  <div
                    key={node.id}
                    className="absolute group cursor-pointer transform transition-all duration-200 hover:scale-110"
                    style={{ left: x, top: y }}
                    onClick={() => handleNodeClick(node.id)}
                  >
                    {/* Node Container */}
                    <div className={`
                      relative bg-gray-800 border-2 rounded-xl p-4 min-w-[180px] shadow-lg
                      transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/20
                      ${node.status === 'completed' ? 'border-green-500 bg-green-500/10' : ''}
                      ${node.status === 'in-progress' ? 'border-yellow-500 bg-yellow-500/10' : ''}
                      ${node.status === 'not-started' ? 'border-gray-600' : ''}
                    `}>
                      {/* Status Icon */}
                      <div className="absolute -top-2 -right-2">
                        {node.status === 'completed' && (
                          <CheckCircle2 className="h-6 w-6 text-green-500 bg-gray-800 rounded-full" />
                        )}
                        {node.status === 'in-progress' && (
                          <Clock className="h-6 w-6 text-yellow-500 bg-gray-800 rounded-full" />
                        )}
                        {node.status === 'not-started' && (
                          <Circle className="h-6 w-6 text-gray-500 bg-gray-800 rounded-full" />
                        )}
                      </div>

                      {/* Category Badge */}
                      <div 
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium mb-2"
                        style={{ 
                          backgroundColor: `${getNodeCategoryColor(node.category)}20`,
                          color: getNodeCategoryColor(node.category)
                        }}
                      >
                        {node.category}
                      </div>

                      <h4 className="font-bold text-white text-sm mb-1">{node.title}</h4>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{node.description}</p>
                      
                      {/* Resources */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{node.resources.courses} courses</span>
                        <span>•</span>
                        <span>{node.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap shadow-lg border border-gray-700">
                        Click to explore {node.title}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Hint */}
          {!user && (
            <div className="absolute bottom-4 left-4 bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 max-w-xs">
              <p className="text-blue-300 text-sm">
                💡 Sign up to track your progress and unlock personalized learning paths!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">{title} Learning Roadmap</h2>
            <Button
              variant="ghost"
              onClick={() => setIsFullscreen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Fullscreen Content */}
          <div className="flex-1 relative">
            {/* Same roadmap content but fullscreen */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
              {/* Your roadmap content here */}
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Fullscreen roadmap view - Enhanced version coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedNode.title}</h3>
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${getNodeCategoryColor(selectedNode.category)}20`,
                      color: getNodeCategoryColor(selectedNode.category)
                    }}
                  >
                    {selectedNode.category}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedNode(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-gray-300 mb-4">{selectedNode.description}</p>

              {/* Learning Resources */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{selectedNode.resources.courses}</div>
                  <div className="text-xs text-gray-400">Courses</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{selectedNode.resources.articles}</div>
                  <div className="text-xs text-gray-400">Articles</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Users className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{selectedNode.resources.projects}</div>
                  <div className="text-xs text-gray-400">Projects</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" variant="default">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default InteractiveRoadmap; 