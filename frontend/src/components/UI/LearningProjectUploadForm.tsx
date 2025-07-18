import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Upload,
  FileText,
  Globe,
  Github,
  Video,
  Link as LinkIcon,
  Tag,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  ArrowLeft,
  Plus,
  X,
  Clock,
  BookOpen,
  Users,
  GraduationCap,
  Code,
  Database,
  Layers,
  Settings,
  BarChart,
  Palette,
  Brain,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';
import { createLearningProject } from '../../services/api';

interface FormData {
  // Section 1: Project Details
  title: string;
  shortDescription: string;
  detailedDescription: string;
  learningObjectives: string[];
  projectType: string;
  customProjectType: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  estimatedTime: string;
  techStack: string[];
  
  // Section 2: Resources
  designFileUrl: string;
  starterRepoUrl: string;
  demoVideoUrl: string;
  liveDemoUrl: string;
  documentationUrl: string;
  
  // Section 3: Tags
  tags: string[];
  academicUseAllowed: boolean;
  
  // Section 4: License
  licenseAgreement: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const LearningProjectUploadForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    learningObjectives: [''],
    projectType: '',
    customProjectType: '',
    difficultyLevel: '',
    estimatedTime: '',
    techStack: [''],
    designFileUrl: '',
    starterRepoUrl: '',
    demoVideoUrl: '',
    liveDemoUrl: '',
    documentationUrl: '',
    tags: [''],
    academicUseAllowed: false,
    licenseAgreement: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  const projectTypes = [
    { value: 'Frontend', icon: <Code className="h-4 w-4" />, description: 'User interface and client-side development' },
    { value: 'Backend', icon: <Database className="h-4 w-4" />, description: 'Server-side logic and APIs' },
    { value: 'Full Stack', icon: <Layers className="h-4 w-4" />, description: 'End-to-end application development' },
    { value: 'DevOps', icon: <Settings className="h-4 w-4" />, description: 'Infrastructure and deployment' },
    { value: 'Data Science', icon: <BarChart className="h-4 w-4" />, description: 'Data analysis and machine learning' },
    { value: 'UI/UX Design', icon: <Palette className="h-4 w-4" />, description: 'User experience and interface design' },
    { value: 'AI/ML', icon: <Brain className="h-4 w-4" />, description: 'Artificial intelligence and machine learning' },
    { value: 'Cybersecurity', icon: <Shield className="h-4 w-4" />, description: 'Security and threat protection' },
    { value: 'Other', icon: <HelpCircle className="h-4 w-4" />, description: 'Specify custom project type' }
  ];

  const difficultyLevels = [
    { value: 'Beginner', description: 'New to programming, basic concepts', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    { value: 'Intermediate', description: '1-2 years experience, some frameworks', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    { value: 'Advanced', description: '3+ years experience, complex projects', color: 'text-red-400 border-red-500/30 bg-red-500/10' }
  ];

  // Validation functions
  const validateSection1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'Short description must be under 200 characters';
    }

    if (!formData.detailedDescription.trim()) {
      newErrors.detailedDescription = 'Detailed description is required';
    }

    if (formData.learningObjectives.filter(obj => obj.trim()).length === 0) {
      newErrors.learningObjectives = 'At least one learning objective is required';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }

    if (formData.projectType === 'Other' && !formData.customProjectType.trim()) {
      newErrors.customProjectType = 'Custom project type is required';
    }

    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = 'Difficulty level is required';
    }

    if (formData.techStack.filter(tech => tech.trim()).length === 0) {
      newErrors.techStack = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSection3 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (formData.tags.filter(tag => tag.trim()).length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.licenseAgreement) {
      newErrors.licenseAgreement = 'You must agree to the license terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Array field handlers
  const addArrayField = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayField = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field: keyof FormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  // Navigation handlers
  const nextSection = () => {
    if (currentSection === 1 && !validateSection1()) return;
    if (currentSection < 4) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1);
  };

  // Form submission
  const handleSubmit = async (isDraft = false) => {
    if (!isDraft) {
      if (!validateSection1() || !validateSection3()) {
        setCurrentSection(1);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        title: formData.title,
        description: formData.detailedDescription,
        technologies: formData.techStack.filter(tech => tech.trim()),
        githubUrl: formData.starterRepoUrl || undefined,
        liveUrl: formData.liveDemoUrl || undefined,
        imageUrl: formData.designFileUrl || undefined,
        architecture: formData.shortDescription,
        learningObjectives: formData.learningObjectives.filter(obj => obj.trim()),
        keyFeatures: formData.tags.filter(tag => tag.trim())
      };

      await createLearningProject({
        ...projectData,
        projectCategory: formData.projectType === 'Other' ? formData.customProjectType : formData.projectType,
        difficultyLevel: formData.difficultyLevel,
        estimatedTime: formData.estimatedTime
      });
      
      // Show success message and redirect
      navigate('/projects', { 
        state: { 
          message: isDraft ? 'Learning project saved as draft' : 'Learning project submitted successfully!' 
        }
      });
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrors({ submit: 'Failed to submit project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section progress indicator
  const SectionProgress = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${currentSection === section 
              ? 'bg-blue-600 text-white' 
              : currentSection > section 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-400'
            }
          `}>
            {currentSection > section ? <CheckCircle className="h-4 w-4" /> : section}
          </div>
          {section < 4 && (
            <div className={`
              w-12 h-0.5 transition-colors
              ${currentSection > section ? 'bg-green-600' : 'bg-gray-700'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Projects</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Learning Project Submission</h1>
              <p className="text-gray-400">Share a learning project for students</p>
            </div>
            
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionProgress />

        {/* Error Display */}
        {errors.submit && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{errors.submit}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 1: Project Details */}
        {currentSection === 1 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Project Details</span>
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Responsive Single Page Resume Website"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-xs ml-2">(max 200 characters)</span>
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="One-liner that summarizes the project"
                  maxLength={200}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.shortDescription ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.shortDescription && <p className="text-sm text-red-400">{errors.shortDescription}</p>}
                  <p className="text-xs text-gray-500 ml-auto">{formData.shortDescription.length}/200</p>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Description / Instructions <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, detailedDescription: e.target.value }))}
                  placeholder="Explain what the student has to build, what features it should include, and any specific design or logic expectations..."
                  rows={6}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.detailedDescription ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.detailedDescription && <p className="mt-1 text-sm text-red-400">{errors.detailedDescription}</p>}
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Learning Objectives / Skills Practiced <span className="text-red-400">*</span>
                </label>
                {formData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
                      placeholder="e.g., HTML/CSS Flexbox, React State Management"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.learningObjectives.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayField('learningObjectives', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayField('learningObjectives')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Learning Objective
                </Button>
                {errors.learningObjectives && <p className="mt-1 text-sm text-red-400">{errors.learningObjectives}</p>}
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {projectTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setFormData(prev => ({ ...prev, projectType: type.value }))}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.projectType === type.value
                          ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {type.icon}
                        <span className="font-medium">{type.value}</span>
                      </div>
                      <p className="text-xs text-gray-400">{type.description}</p>
                    </div>
                  ))}
                </div>
                
                {formData.projectType === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.customProjectType}
                      onChange={(e) => setFormData(prev => ({ ...prev, customProjectType: e.target.value }))}
                      placeholder="Specify custom project type"
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customProjectType ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.customProjectType && <p className="mt-1 text-sm text-red-400">{errors.customProjectType}</p>}
                  </div>
                )}
                {errors.projectType && <p className="mt-1 text-sm text-red-400">{errors.projectType}</p>}
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {difficultyLevels.map((level) => (
                    <div
                      key={level.value}
                      onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: level.value as any }))}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.difficultyLevel === level.value
                          ? `border-current ${level.color}`
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <div className="font-medium mb-1">{level.value}</div>
                      <p className="text-xs text-gray-400">{level.description}</p>
                    </div>
                  ))}
                </div>
                {errors.difficultyLevel && <p className="mt-1 text-sm text-red-400">{errors.difficultyLevel}</p>}
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Completion Time <span className="text-gray-500">(optional)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="e.g., 2–3 days, 10–12 hours"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tech Stack / Tools Required <span className="text-red-400">*</span>
                </label>
                {formData.techStack.map((tech, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => updateArrayField('techStack', index, e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.techStack.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayField('techStack', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayField('techStack')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Technology
                </Button>
                {errors.techStack && <p className="mt-1 text-sm text-red-400">{errors.techStack}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 2: Resources */}
        {currentSection === 2 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <LinkIcon className="h-5 w-5" />
                <span>Resources (Optional)</span>
              </h2>
              <p className="text-gray-400">Provide additional resources to help students complete the project</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Design File Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Design File Link (Figma, XD, etc.)
                </label>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.designFileUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, designFileUrl: e.target.value }))}
                    placeholder="https://figma.com/design/..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Starter Repository */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Starter GitHub Repository
                </label>
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.starterRepoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, starterRepoUrl: e.target.value }))}
                    placeholder="https://github.com/username/starter-repo"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Demo Video */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Demo Video / Loom Link
                </label>
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.demoVideoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, demoVideoUrl: e.target.value }))}
                    placeholder="https://loom.com/share/..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live Demo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Live Demo URL
                </label>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.liveDemoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, liveDemoUrl: e.target.value }))}
                    placeholder="https://your-demo.vercel.app"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Documentation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Documentation / PDFs
                </label>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.documentationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                    placeholder="https://docs.google.com/document/..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Tags & Categorization */}
        {currentSection === 3 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Tags & Categorization</span>
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relevant Tags <span className="text-red-400">*</span>
                </label>
                <p className="text-sm text-gray-400 mb-3">
                  Add tags to help students discover your project
                </p>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateArrayField('tags', index, e.target.value)}
                      placeholder="e.g., React, Authentication, CI/CD"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.tags.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayField('tags', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayField('tags')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </Button>
                {errors.tags && <p className="mt-1 text-sm text-red-400">{errors.tags}</p>}
              </div>

              {/* Academic Use */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.academicUseAllowed}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicUseAllowed: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-gray-300">Academic Use Allowed</span>
                    <p className="text-sm text-gray-400">I allow this project to be used for educational/non-commercial use by students.</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 4: License & Terms */}
        {currentSection === 4 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>License & Terms</span>
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* License Agreement */}
              <div>
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium text-white mb-3">Submission License Agreement</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>By submitting this learning project, you agree that:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>This project can be reviewed, edited, and published by our platform for educational purposes</li>
                      <li>Students can access and complete this project as part of their learning journey</li>
                      <li>The project content is original or you have the right to share it</li>
                      <li>The project follows our community guidelines and best practices</li>
                      <li>You retain ownership of your intellectual property while granting us license to distribute</li>
                    </ul>
                  </div>
                </div>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.licenseAgreement}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseAgreement: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-gray-300">
                      I agree to the Submission License Agreement <span className="text-red-400">*</span>
                    </span>
                    <p className="text-sm text-gray-400">
                      Required to submit your learning project
                    </p>
                  </div>
                </label>
                {errors.licenseAgreement && <p className="mt-1 text-sm text-red-400">{errors.licenseAgreement}</p>}
              </div>

              {/* Final Review */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-300 mb-2">Ready to Submit?</h3>
                <p className="text-blue-200">
                  Your learning project will be reviewed by our team before being published. 
                  Students will be able to discover and complete your project once it's approved.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={prevSection}
            disabled={currentSection === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-3">
            {currentSection === 4 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </Button>
                
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Project</span>
                    </>
                  )}
                </Button>
              </>
            )}
            
            {currentSection < 4 && (
              <Button
                onClick={nextSection}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningProjectUploadForm; 