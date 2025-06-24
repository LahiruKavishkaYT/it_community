import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStats } from '../contexts/StatsContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Github, 
  ExternalLink, 
  Plus,
  X,
  Loader2,
  GraduationCap,
  Briefcase,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { createProject } from '../services/api';

const CreateProjectPage: React.FC = () => {
  const { user } = useAuth();
  const { incrementProjectCount } = useStats();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
    architecture: '',
    learningObjectives: [] as string[],
    keyFeatures: [] as string[]
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newFeature, setNewFeature] = useState('');

  // Get project type info based on user role
  const getProjectTypeInfo = () => {
    if (user?.role === 'STUDENT') {
      return {
        type: 'Student Project',
        description: 'Share your project work to get professional feedback and showcase your skills',
        icon: <GraduationCap className="h-5 w-5 text-blue-400" />,
        bgColor: 'bg-blue-600/20',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-300'
      };
    } else {
      return {
        type: 'Learning Project',
        description: 'Create a practice project for students to learn and develop their technical skills',
        icon: <Briefcase className="h-5 w-5 text-green-400" />,
        bgColor: 'bg-green-600/20',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-300'
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const addObjective = () => {
    if (newObjective.trim() && !formData.learningObjectives.includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (objectiveToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter(obj => obj !== objectiveToRemove)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.keyFeatures.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        keyFeatures: [...prev.keyFeatures, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter(feat => feat !== featureToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    if (formData.technologies.length === 0) {
      setError('Please add at least one technology');
      return;
    }

    // Require GitHub URL for learning projects (by professionals)
    if (user.role === 'PROFESSIONAL' && !formData.githubUrl.trim()) {
      setError('GitHub repository URL is required for learning projects');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        technologies: formData.technologies,
        githubUrl: formData.githubUrl.trim() || undefined,
        liveUrl: formData.liveUrl.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        architecture: formData.architecture.trim() || undefined,
        learningObjectives: formData.learningObjectives.length > 0 ? formData.learningObjectives : undefined,
        keyFeatures: formData.keyFeatures.length > 0 ? formData.keyFeatures : undefined
      });

      // Update stats in real-time
      incrementProjectCount();

      // Navigate back to projects page on success
      navigate('/projects');
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechnologyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  const handleObjectiveKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addObjective();
    }
  };

  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const projectTypeInfo = getProjectTypeInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload New {projectTypeInfo.type}</h1>
          <p className="text-gray-300">{projectTypeInfo.description}</p>
        </div>
      </div>

      {/* Project Type Info */}
      <Card>
        <CardContent className="p-6">
          <div className={`${projectTypeInfo.bgColor} ${projectTypeInfo.borderColor} border rounded-lg p-4`}>
            <div className="flex items-center space-x-3">
              {projectTypeInfo.icon}
              <div>
                <h3 className={`font-semibold ${projectTypeInfo.textColor}`}>
                  Creating a {projectTypeInfo.type}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  {user?.role === 'STUDENT' 
                    ? 'This student project will be visible to IT professionals who can provide valuable feedback on your work.'
                    : 'This learning project will be visible to students looking to practice and enhance their coding skills.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Project Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={user?.role === 'STUDENT' 
                  ? "e.g., Personal Portfolio Website, E-commerce App" 
                  : "e.g., React Todo App Tutorial, JavaScript Fundamentals Project"
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={user?.role === 'STUDENT'
                  ? "Describe your project, the challenges you faced, technologies used, and what you learned..."
                  : "Describe the learning objectives, what students will build, required skills level, and step-by-step guidance you'll provide..."
                }
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {user?.role === 'PROFESSIONAL' && (
                <p className="text-sm text-gray-400 mt-2">
                  💡 Include: Skill level (Beginner/Intermediate/Advanced), estimated completion time, and key concepts students will learn
                </p>
              )}
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technologies Used *
              </label>
              {user?.role === 'PROFESSIONAL' && (
                <p className="text-sm text-gray-400 mb-3">
                  💡 List technologies students will learn and use in this project
                </p>
              )}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={handleTechnologyKeyPress}
                    placeholder={user?.role === 'STUDENT' 
                      ? "e.g., React, Node.js, PostgreSQL" 
                      : "e.g., HTML, CSS, JavaScript (for beginners)"
                    }
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={addTechnology}
                    disabled={!newTechnology.trim()}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
                
                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-2 text-blue-300 hover:text-blue-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* GitHub URL */}
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2">
                GitHub Repository URL {user?.role === 'PROFESSIONAL' ? '*' : ''}
              </label>
              {user?.role === 'PROFESSIONAL' && (
                <p className="text-sm text-gray-400 mb-2">
                  💡 Essential for learning projects - students need access to starter code and solutions
                </p>
              )}
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={user?.role === 'PROFESSIONAL'}
                />
              </div>
            </div>

            {/* Live URL */}
            <div>
              <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Live Demo URL
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  id="liveUrl"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-project-demo.com"
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Project Screenshot URL
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/project-screenshot.png"
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Architecture */}
            <div>
              <label htmlFor="architecture" className="block text-sm font-medium text-gray-300 mb-2">
                Architecture & Design Patterns
              </label>
              <textarea
                id="architecture"
                name="architecture"
                value={formData.architecture}
                onChange={handleInputChange}
                placeholder={
                  user?.role === 'STUDENT'
                    ? "Describe the architecture, design patterns, folder structure, and technical decisions you made..."
                    : "Describe the architecture students will implement, design patterns they'll learn, and coding standards to follow..."
                }
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-2">
                💡 Include: Architecture type (MVC, Component-based, etc.), design patterns, folder structure, coding standards
              </p>
            </div>

            {/* Learning Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Objectives
                {user?.role === 'PROFESSIONAL' && <span className="text-red-400"> *</span>}
              </label>
              {user?.role === 'PROFESSIONAL' && (
                <p className="text-sm text-gray-400 mb-3">
                  💡 What specific skills and concepts will students learn from this project?
                </p>
              )}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={handleObjectiveKeyPress}
                    placeholder={
                      user?.role === 'STUDENT'
                        ? "e.g., State management with Redux, API integration, Responsive design"
                        : "e.g., Understanding modern development workflows, Best practices implementation"
                    }
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={addObjective}
                    disabled={!newObjective.trim()}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
                
                {formData.learningObjectives.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.learningObjectives.map((objective, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-600/20 text-green-300 text-sm rounded-full border border-green-500/30"
                      >
                        {objective}
                        <button
                          type="button"
                          onClick={() => removeObjective(objective)}
                          className="ml-2 text-green-300 hover:text-green-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Features
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleFeatureKeyPress}
                    placeholder={
                      user?.role === 'STUDENT'
                        ? "e.g., User authentication, Real-time chat, Mobile-responsive design"
                        : "e.g., Interactive tutorials, Code examples, Progressive difficulty"
                    }
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    disabled={!newFeature.trim()}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
                
                {formData.keyFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keyFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-2 text-purple-300 hover:text-purple-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                💡 Highlight the main features and functionalities of your project
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Uploading...' : `Upload ${projectTypeInfo.type}`}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProjectPage; 