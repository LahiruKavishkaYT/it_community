import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Star,
  MessageSquare,
  CheckCircle,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import Button from './Button';
import StarRating from './StarRating';
import { Card, CardContent, CardHeader } from './Card';

interface SuggestionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestionId: string;
  suggestionTitle: string;
  currentRating?: number;
  onSubmit: (feedbackData: FeedbackSubmissionData) => Promise<void>;
}

interface FeedbackSubmissionData {
  rating: number;
  feedback: string;
  categories: {
    relevance: number;
    clarity: number;
    impact: number;
    feasibility: number;
  };
  isConstructive: boolean;
}

const FEEDBACK_CATEGORIES = [
  {
    key: 'relevance' as const,
    label: 'Relevance',
    description: 'How relevant is this suggestion to the career path?',
    icon: Target,
    color: 'text-blue-400'
  },
  {
    key: 'clarity' as const,
    label: 'Clarity',
    description: 'How clear and well-explained is the suggestion?',
    icon: MessageSquare,
    color: 'text-green-400'
  },
  {
    key: 'impact' as const,
    label: 'Impact',
    description: 'How much positive impact would this have?',
    icon: TrendingUp,
    color: 'text-purple-400'
  },
  {
    key: 'feasibility' as const,
    label: 'Feasibility',
    description: 'How realistic is it to implement this suggestion?',
    icon: CheckCircle,
    color: 'text-orange-400'
  }
];

const SuggestionFeedbackModal: React.FC<SuggestionFeedbackModalProps> = ({
  isOpen,
  onClose,
  suggestionTitle,
  currentRating = 0,
  onSubmit
}) => {
  const [overallRating, setOverallRating] = useState(currentRating);
  const [categoryRatings, setCategoryRatings] = useState({
    relevance: 0,
    clarity: 0,
    impact: 0,
    feasibility: 0
  });
  const [feedback, setFeedback] = useState('');
  const [isConstructive, setIsConstructive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCategoryRating = (category: keyof typeof categoryRatings, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating: overallRating,
        feedback,
        categories: categoryRatings,
        isConstructive
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOverallScore = () => {
    const categoryAverage = Object.values(categoryRatings).reduce((a, b) => a + b, 0) / 4;
    return categoryAverage > 0 ? categoryAverage : overallRating;
  };

  const isValid = overallRating > 0 && feedback.trim().length > 10;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Rate & Review Suggestion
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              "{suggestionTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Rating */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Overall Rating
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <StarRating
                  rating={overallRating}
                  size="lg"
                  interactive
                  onChange={setOverallRating}
                />
                <span className="text-sm text-gray-400">
                  {overallRating === 0 ? 'Click to rate' : `${overallRating} star${overallRating !== 1 ? 's' : ''}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Category Ratings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                Detailed Assessment
              </h3>
              <p className="text-sm text-gray-400">
                Rate specific aspects of this suggestion (optional)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {FEEDBACK_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${category.color}`} />
                        <div>
                          <h4 className="font-medium text-white">{category.label}</h4>
                          <p className="text-xs text-gray-400">{category.description}</p>
                        </div>
                      </div>
                      <StarRating
                        rating={categoryRatings[category.key]}
                        size="md"
                        interactive
                        onChange={(rating) => handleCategoryRating(category.key, rating)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Score Summary */}
              {Object.values(categoryRatings).some(rating => rating > 0) && (
                <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300">Calculated Score:</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={getOverallScore()} size="sm" />
                      <span className="text-sm text-blue-300">{getOverallScore().toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Written Feedback */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Written Feedback
              </h3>
              <p className="text-sm text-gray-400">
                Share your thoughts and suggestions for improvement
              </p>
            </CardHeader>
            <CardContent>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback about this suggestion. What works well? What could be improved? Any specific recommendations?"
                className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {feedback.length}/1000 characters (min 10)
                </span>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={isConstructive}
                    onChange={(e) => setIsConstructive(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500/50"
                  />
                  Constructive feedback
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionFeedbackModal;
