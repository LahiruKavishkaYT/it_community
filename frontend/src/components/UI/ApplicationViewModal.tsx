import React from 'react';
import { X, Eye, FileText, ExternalLink, Clock, CheckCircle, Star, Users, Award, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';
import { ApplicationStatus } from '../../types';

interface ApplicationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    coverLetter?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    expectedSalary?: number;
    recruiterNotes?: string;
    rejectionReason?: string;
  };
  jobTitle: string;
  companyName: string;
  onViewCV?: (resumeUrl: string) => void;
  onDownloadCV?: (resumeUrl: string) => void;
}

const ApplicationViewModal: React.FC<ApplicationViewModalProps> = ({
  isOpen,
  onClose,
  application,
  jobTitle,
  companyName,
  onViewCV,
  onDownloadCV
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      REVIEWING: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      SHORTLISTED: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      INTERVIEWED: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
      OFFERED: 'text-green-400 bg-green-400/10 border-green-400/30',
      ACCEPTED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      REJECTED: 'text-red-400 bg-red-400/10 border-red-400/30',
      WITHDRAWN: 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REVIEWING': return <Eye className="h-4 w-4" />;
      case 'SHORTLISTED': return <Star className="h-4 w-4" />;
      case 'INTERVIEWED': return <Users className="h-4 w-4" />;
      case 'OFFERED': return <Award className="h-4 w-4" />;
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'WITHDRAWN': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: ApplicationStatus) => {
    const messages = {
      PENDING: 'Your application is pending review by the company.',
      REVIEWING: 'Your application is currently being reviewed.',
      SHORTLISTED: 'Congratulations! You have been shortlisted for this position.',
      INTERVIEWED: 'You have completed the interview process.',
      OFFERED: 'Congratulations! You have received a job offer.',
      ACCEPTED: 'Your application has been accepted.',
      REJECTED: 'Unfortunately, your application was not successful this time.',
      WITHDRAWN: 'You have withdrawn your application.'
    };
    return messages[status] || 'Application status unknown.';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Application</h2>
              <p className="text-gray-400">{jobTitle} at {companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Application Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Application Status</h3>
                  <span className={`px-3 py-1 text-sm rounded-full border flex items-center space-x-2 ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="capitalize">{application.status.toLowerCase()}</span>
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{getStatusMessage(application.status)}</p>
                <p className="text-gray-400 text-xs">
                  Applied on {new Date(application.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Recruiter Feedback (always directly below status) */}
            {application.recruiterNotes && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Feedback for Applicant</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{application.recruiterNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Reason & Feedback (if rejected) */}
            {application.status === 'REJECTED' && (
              <>
                {application.rejectionReason && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center space-x-2">
                        <XCircle className="h-5 w-5" />
                        <span>Reason for Rejection</span>
                      </h3>
                      <p className="text-red-300 text-sm whitespace-pre-wrap">{application.rejectionReason}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Application Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Application Details</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.coverLetter && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Cover Letter</h4>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                      </div>
                    </div>
                  )}
                  {application.expectedSalary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Expected Salary</h4>
                      <p className="text-white">${application.expectedSalary.toLocaleString()}</p>
                    </div>
                  )}
                  {application.resumeUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Resume</h4>
                      <div className="flex space-x-2">
                        {onViewCV && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewCV(application.resumeUrl!)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Resume
                          </Button>
                        )}
                        {onDownloadCV && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownloadCV(application.resumeUrl!)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Download Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  {application.portfolioUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Portfolio</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.portfolioUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Portfolio
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationViewModal; 