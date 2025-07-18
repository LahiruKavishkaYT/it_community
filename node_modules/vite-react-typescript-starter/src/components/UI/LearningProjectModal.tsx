import React from 'react';
import { 
  X, 
  Github, 
  Globe, 
  Clock, 
  User, 
  Star,
  Calendar,
  Code,
  Lightbulb,
  Target,
  Play,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';
import { Project } from '../../types';

interface LearningProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

const LearningProjectModal: React.FC<LearningProjectModalProps> = ({ 
  project, 
  isOpen, 
  onClose,
  onBack
}) => {
  if (!isOpen || !project) return null;

  const getDifficultyLevel = (technologies: string[]) => {
    const techCount = technologies.length;
    if (techCount <= 3) return { level: 'Beginner', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (techCount <= 6) return { level: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { level: 'Advanced', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const getEstimatedDuration = (technologies: string[]) => {
    const techCount = technologies.length;
    if (techCount <= 3) return '1-2 weeks';
    if (techCount <= 6) return '2-4 weeks';
    return '4-8 weeks';
  };

  const difficulty = getDifficultyLevel(project.technologies);
  const duration = getEstimatedDuration(project.technologies);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{project.title}</h2>
              <p className="text-gray-400">Learning Project Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Project Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Project Description
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{project.description}</p>
                </CardContent>
              </Card>

              {/* Learning Objectives */}
              {project.learningObjectives && project.learningObjectives.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Learning Objectives
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {project.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Key Features */}
              {project.keyFeatures && project.keyFeatures.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-400" />
                      Key Features
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {project.keyFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Architecture */}
              {project.architecture && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-400" />
                      Architecture & Technical Details
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{project.architecture}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              {/* Project Stats */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">Project Info</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Difficulty</span>
                    <span className={`px-2 py-1 rounded text-xs border ${difficulty.color}`}>
                      {difficulty.level}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Est. Duration</span>
                    <span className="text-white flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created by</span>
                    <span className="text-white flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {project.author}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Technologies */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">Technologies</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {project.liveUrl && (
                  <Button
                    className="w-full"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                )}

                {project.githubUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Source Code
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    // You can implement a "Start Project" feature here
                    console.log('Starting project:', project.id);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </div>
          </div>

          {/* Project Feedback Section */}
          {project.feedback && project.feedback.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Community Feedback ({project.feedback.length})
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.feedback.slice(0, 3).map((feedback) => (
                    <div key={feedback.id} className="border-l-2 border-blue-500/30 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{feedback.authorName}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < feedback.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{feedback.content}</p>
                    </div>
                  ))}
                  
                  {project.feedback.length > 3 && (
                    <div className="text-center">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View all {project.feedback.length} reviews
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningProjectModal;
