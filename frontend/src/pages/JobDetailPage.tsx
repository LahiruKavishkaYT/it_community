import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import { Card, CardContent } from '../components/UI/Card';
import { getJobById, applyForJob } from '../services/api';
import { Job } from '../types';
import { 
  MapPin, 
  Building, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Briefcase,
  Globe,
  Star,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import JobApplicationModal from '../components/UI/JobApplicationModal';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await getJobById(id!);
        setJob(data || null);
        if (data?.isBookmarked) {
          setIsBookmarked(true);
        }
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  // Helper function to safely get company name
  const getCompanyName = (company: any): string => {
    if (typeof company === 'string') return company;
    if (company && typeof company === 'object' && company.name) return company.name;
    if (company && typeof company === 'object' && company.company) return company.company;
    return 'Unknown Company';
  };

  // Helper function to safely get location
  const getLocation = (location: any): string => {
    if (typeof location === 'string') return location;
    if (location && typeof location === 'object' && location.location) return location.location;
    return 'Location not specified';
  };

  // Format salary display
  const formatSalary = (job: Job): string => {
    if (job.salary) return job.salary;
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.salaryPeriod || 'per year'}`;
    }
    if (job.salaryMin) {
      return `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()}+ ${job.salaryPeriod || 'per year'}`;
    }
    return 'Salary not specified';
  };

  // Get job type display name
  const getJobTypeDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'INTERNSHIP': 'Internship',
      'CONTRACT': 'Contract'
    };
    return typeMap[type] || type;
  };

  // Get experience level display
  const getExperienceLevelDisplay = (level: string): string => {
    const levelMap: Record<string, string> = {
      'ENTRY_LEVEL': 'Entry Level',
      'MID_LEVEL': 'Mid Level',
      'SENIOR_LEVEL': 'Senior Level',
      'LEAD_LEVEL': 'Lead Level',
      'EXECUTIVE': 'Executive'
    };
    return levelMap[level] || level;
  };

  // Handle apply button click
  const handleApplyClick = () => {
    setShowApplicationModal(true);
  };

  // Handle application submission
  const handleApplicationSubmitted = async (applicationData: {
    coverLetter: string;
    resume: File | null;
    portfolio?: string;
  }) => {
    if (!job) return;

    try {
      setApplying(true);
      await applyForJob(job.id, {
        jobId: job.id,
        coverLetter: applicationData.coverLetter,
        portfolioUrl: applicationData.portfolio,
      });
      
      // Update job state to reflect application
      setJob(prev => prev ? { ...prev, hasApplied: true, applicationStatus: 'PENDING' } : null);
      setShowApplicationModal(false);
      
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title || 'Job Posting',
        text: `Check out this ${job?.type?.toLowerCase()} position at ${getCompanyName(job?.company)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-400">Job not found.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={handleBookmarkToggle}
                className={`text-gray-400 hover:text-white ${isBookmarked ? 'text-yellow-400' : ''}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-gray-400 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                    <div className="flex items-center text-gray-400 mb-2">
                      <Building className="h-4 w-4 mr-2" />
                      <span>{getCompanyName(job.company)}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{getLocation(job.location)}</span>
                      {job.remote && (
                        <span className="ml-2 px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full border border-green-500/30">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-500/30">
                      {getJobTypeDisplay(job.type)}
                    </span>
                    {job.experienceLevel && (
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                        {getExperienceLevelDisplay(job.experienceLevel)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{job.views || 0}</div>
                    <div className="text-sm text-gray-400">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{job.applicationsCount || 0}</div>
                    <div className="text-sm text-gray-400">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{job.bookmarksCount || 0}</div>
                    <div className="text-sm text-gray-400">Bookmarks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-400">Posted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-600/20 text-red-300 text-sm rounded-full border border-red-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferred Skills */}
            {job.preferredSkills && job.preferredSkills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Preferred Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technologies */}
            {job.technologies && job.technologies.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  {job.salary && (
                    <div className="text-2xl font-bold text-white mb-2">
                      {formatSalary(job)}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mb-4">
                    {job.views || 0} people have viewed this job
                  </div>
                </div>

                {job.hasApplied ? (
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">Application Submitted</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Status: {job.applicationStatus || 'Pending Review'}
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleApplyClick}
                    disabled={applying}
                    className="w-full h-12 text-lg font-semibold"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Applying...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                )}

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    {job.applicationsCount || 0} applications • Apply before {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'deadline not set'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{getJobTypeDisplay(job.type)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{getLocation(job.location)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {job.remote && (
                    <div className="flex items-center text-green-400">
                      <Globe className="h-4 w-4 mr-3" />
                      <span>Remote work available</span>
                    </div>
                  )}
                  {job.teamSize && (
                    <div className="flex items-center text-gray-300">
                      <Users className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Team size: {job.teamSize}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Benefits</h3>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">About {getCompanyName(job.company)}</h3>
                <div className="text-gray-300 text-sm">
                  <p>Company information not available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {job && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          jobTitle={job.title}
          companyName={getCompanyName(job.company)}
          onSubmit={handleApplicationSubmitted}
          hasApplied={job.hasApplied}
        />
      )}
    </div>
  );
};

export default JobDetailPage; 