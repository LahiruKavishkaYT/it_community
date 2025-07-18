import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Lightbulb, 
  AlertTriangle, 
  Plus, 
  FileText,
  Tag
} from 'lucide-react';
import Button from './Button';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  careerPathId: string;
  careerPathTitle: string;
  onSubmit: (suggestion: SuggestionFormData) => Promise<void>;
}

interface SuggestionFormData {
  type: 'improvement' | 'content' | 'feature' | 'bug' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  attachments?: File[];
}

const SUGGESTION_TYPES = [
  {
    id: 'improvement' as const,
    label: 'Improvement',
    description: 'Suggest improvements to existing content',
    icon: Lightbulb,
    color: 'blue'
  },
  {
    id: 'content' as const,
    label: 'Content Addition',
    description: 'Request new learning materials or topics',
    icon: Plus,
    color: 'green'
  },
  {
    id: 'feature' as const,
    label: 'New Feature',
    description: 'Suggest new functionality or tools',
    icon: FileText,
    color: 'purple'
  },
  {
    id: 'bug' as const,
    label: 'Bug Report',
    description: 'Report issues or errors in the content',
    icon: AlertTriangle,
    color: 'red'
  },
  {
    id: 'other' as const,
    label: 'Other',
    description: 'General feedback or other suggestions',
    icon: Tag,
    color: 'gray'
  }
];

const PRIORITY_LEVELS = [
  { id: 'low' as const, label: 'Low', color: 'bg-gray-500/20 text-gray-400' },
  { id: 'medium' as const, label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'high' as const, label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'critical' as const, label: 'Critical', color: 'bg-red-500/20 text-red-400' }
];

const SuggestionModal: React.FC<SuggestionModalProps> = ({ 
  isOpen, 
  onClose, 
  careerPathId, // Used by parent for API calls
  careerPathTitle,
  onSubmit 
}) => {
  const [formData, setFormData] = useState<SuggestionFormData>({
    type: 'improvement',
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    attachments: []
  });
  
  // Void expression to suppress unused parameter warning
  void careerPathId;
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<SuggestionFormData>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<SuggestionFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.description.length < 20) {
      newErrors.description = 'Please provide more details (minimum 20 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        type: 'improvement',
        title: '',
        description: '',
        priority: 'medium',
        tags: [],
        attachments: []
      });
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const selectedType = SUGGESTION_TYPES.find(type => type.id === formData.type);
  const TypeIcon = selectedType?.icon || Lightbulb;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-${selectedType?.color}-600/20 rounded-lg flex items-center justify-center`}>
              <TypeIcon className={`w-6 h-6 text-${selectedType?.color}-400`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Submit Suggestion</h2>
              <p className="text-gray-400">Help improve the {careerPathTitle} roadmap</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Suggestion Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Suggestion Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUGGESTION_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      formData.type === type.id
                        ? `border-${type.color}-500/50 bg-${type.color}-500/10`
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 text-${type.color}-400`} />
                      <span className="font-medium text-white">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief, descriptive title for your suggestion"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Priority Level
            </label>
            <div className="flex gap-2">
              {PRIORITY_LEVELS.map((priority) => (
                <button
                  key={priority.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.id }))}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    formData.priority === priority.id
                      ? priority.color + ' border-current'
                      : 'text-gray-400 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about your suggestion. Include specific examples, use cases, or benefits."
              rows={6}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            <div className="flex justify-between text-sm">
              {errors.description ? (
                <p className="text-red-400">{errors.description}</p>
              ) : (
                <p className="text-gray-400">
                  {formData.description.length}/500 characters
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Tags (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add relevant tags"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionModal;
