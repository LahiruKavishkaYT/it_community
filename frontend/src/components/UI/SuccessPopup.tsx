import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Zap, Users, Briefcase } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'project' | 'event' | 'job';
  workflow: 'pre-approval' | 'post-publication';
  title: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  type,
  workflow,
  title,
  autoClose = true,
  autoCloseDelay = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Allow fade out animation
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'project': return Clock;
      case 'event': return Users;
      case 'job': return Briefcase;
      default: return CheckCircle;
    }
  };

  const getContent = () => {
    const Icon = getIcon();
    
    if (workflow === 'pre-approval') {
      return {
        icon: <Clock className="h-8 w-8 text-orange-400" />,
        title: 'Successfully Uploaded!',
        message: 'Your project has been submitted for review. An admin will review and approve it shortly.',
        subMessage: 'You\'ll receive a notification once the review is complete.',
        bgColor: 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20',
        borderColor: 'border-orange-400',
        iconBg: 'bg-orange-400/20'
      };
    } else {
      const content = {
        event: {
          icon: <Zap className="h-8 w-8 text-green-400" />,
          title: 'Event Published Successfully!',
          message: 'Your event is now live and accepting registrations.',
          subMessage: 'Users can now discover and register for your event.',
          bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-400',
          iconBg: 'bg-green-400/20'
        },
        job: {
          icon: <Zap className="h-8 w-8 text-blue-400" />,
          title: 'Job Posted Successfully!',
          message: 'Your job posting is now live and accepting applications.',
          subMessage: 'Candidates can now discover and apply for this position.',
          bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-400',
          iconBg: 'bg-blue-400/20'
        },
        project: {
          icon: <CheckCircle className="h-8 w-8 text-green-400" />,
          title: 'Project Published!',
          message: 'Your project is now live and visible to the community.',
          subMessage: 'Others can now view and provide feedback on your work.',
          bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-400',
          iconBg: 'bg-green-400/20'
        }
      };
      return content[type] || content.project;
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className={`
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          bg-gray-800 rounded-xl border ${content.borderColor} shadow-2xl max-w-md w-full
          ${content.bgColor}
        `}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-full ${content.iconBg}`}>
              {content.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{content.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{title}</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-gray-200">{content.message}</p>
            <p className="text-sm text-gray-400">{content.subMessage}</p>
            
            {workflow === 'pre-approval' && (
              <div className="bg-gray-700/50 rounded-lg p-3 border-l-4 border-orange-400">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>Estimated review time: 24-48 hours</span>
                </div>
              </div>
            )}

            {workflow === 'post-publication' && (
              <div className="bg-gray-700/50 rounded-lg p-3 border-l-4 border-green-400">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Live and discoverable by users</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
                // Navigate to relevant page based on type
                if (type === 'project') {
                  window.location.href = '/projects';
                } else if (type === 'event') {
                  window.location.href = '/events';
                } else if (type === 'job') {
                  window.location.href = '/jobs';
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              View {type === 'project' ? 'Projects' : type === 'event' ? 'Events' : 'Jobs'}
            </button>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-700">
            <div 
              className="h-1 bg-blue-500 transition-all ease-linear"
              style={{
                width: isVisible ? '0%' : '100%',
                transitionDuration: `${autoCloseDelay}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPopup; 