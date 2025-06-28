import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  onSubmit: (applicationData: {
    coverLetter: string;
    resume: File | null;
    portfolio?: string;
  }) => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        coverLetter: formData.coverLetter,
        resume,
        portfolio: formData.portfolio
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Apply for Position
              </h2>
              <p className="text-gray-300">
                <span className="font-medium">{jobTitle}</span> at <span className="font-medium">{companyName}</span>
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  placeholder="Tell us why you're perfect for this role..."
                  rows={6}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resume *
                </label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors">
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Choose File</span>
                    </div>
                  </label>
                  {resume && (
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <FileText className="h-4 w-4" />
                      <span>{resume.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>

              {/* Portfolio (Optional) */}
              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio/GitHub URL
                </label>
                <input
                  id="portfolio"
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                  placeholder="https://github.com/yourusername or https://yourportfolio.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.coverLetter || !resume || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobApplicationModal; 