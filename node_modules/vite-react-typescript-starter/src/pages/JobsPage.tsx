import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStats } from '../contexts/StatsContext';
import AuthModal from '../components/UI/AuthModal';
import { useAuthModal } from '../hooks/useAuthModal';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  Users,
  Star,
  Eye,
  Bookmark,
  ExternalLink,
  Loader2,
  X,
  CheckCircle,
  ChevronDown,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import JobApplicationModal from '../components/UI/JobApplicationModal';
import ApplicationViewModal from '../components/UI/ApplicationViewModal';
import DeleteConfirmationModal from '../components/UI/DeleteConfirmationModal';
import { Job, JobType, CreateJobData, ExperienceLevel, JobFilters, ApplicationStatus } from '../types';
import { getJobs, createJob, updateJob, deleteJob, getCurrentUser, uploadResume, applyForJob, downloadResumeFile, getJobById, getApplicationDetails } from '../services/api';

// Job Posting Modal Component
const JobPostingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
  onJobUpdated?: (job: Job) => void;
  editJob?: Job | null;
}> = ({ isOpen, onClose, onJobCreated, onJobUpdated, editJob }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [formData, setFormData] = useState({
    /* Basics */
    title: editJob?.title || '',
    location: editJob?.location || '',
    type: (editJob?.type as JobType) || 'FULL_TIME',
    remote: editJob?.remote || false,
    featured: editJob?.featured || false,
    urgent: editJob?.urgent || false,
    /* Requirements */
    description: editJob?.description || '',
    requirements: editJob?.requirements || [],
    /* Compensation */
    salaryMin: editJob?.salaryMin?.toString() || '',
    salaryMax: editJob?.salaryMax?.toString() || '',
    salaryCurrency: editJob?.salaryCurrency || 'USD',
    salaryPeriod: editJob?.salaryPeriod || 'yearly'
  });

  const [newRequirement, setNewRequirement] = useState('');

  // Validation helpers
  const isBasicsValid = () => formData.title.trim().length >= 5 && formData.location.trim().length > 0;
  const isRequirementsValid = () => formData.description.trim().length >= 50 && formData.requirements.length > 0;
  const isCompValid = () => {
    if (!formData.salaryMin && !formData.salaryMax) return true;
    const min = parseInt(formData.salaryMin || '0');
    const max = parseInt(formData.salaryMax || '0');
    return (!formData.salaryMin || min > 0) && (!formData.salaryMax || max > 0) && ( !formData.salaryMin || !formData.salaryMax || min <= max);
  };

  // Reset form when editJob changes
  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title || '',
        description: editJob.description || '',
        requirements: editJob.requirements || [],
        location: editJob.location || '',
        type: (editJob.type as JobType) || 'FULL_TIME',
        salaryMin: editJob.salaryMin?.toString() || '',
        salaryMax: editJob.salaryMax?.toString() || '',
        salaryCurrency: editJob.salaryCurrency || 'USD',
        salaryPeriod: editJob.salaryPeriod || 'yearly',
        remote: editJob.remote || false,
        featured: editJob.featured || false,
        urgent: editJob.urgent || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        requirements: [],
        location: '',
        type: 'FULL_TIME',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD',
        salaryPeriod: 'yearly',
        remote: false,
        featured: false,
        urgent: false
      });
    }
    setError(null);
    setSuccess(false);
  }, [editJob]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (reqToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 2) { // if not final step, just advance
      setStep(prev => (prev + 1) as any);
      return;
    }
    
    if (!user) {
      setError('You must be logged in to post a job');
      return;
    }

    // Secure validation - no sensitive data logging
    const hasValidRole = user.role === 'COMPANY' || user.role === 'PROFESSIONAL';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Job creation validation:', {
        hasUser: !!user,
        hasValidRole,
        timestamp: new Date().toISOString()
      });
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Title, description, and location are required');
      return;
    }

    if (formData.requirements.length === 0) {
      setError('Please add at least one requirement');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Additional role validation
      if (!user.role || (user.role !== 'COMPANY' && user.role !== 'PROFESSIONAL')) {
        setError('Only companies and professionals can post jobs. Please update your account role.');
        return;
      }

      let resultJob: Job;
      
      if (editJob) {
        // Update existing job
        resultJob = await updateJob(editJob.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          requirements: formData.requirements,
          location: formData.location.trim(),
          type: formData.type,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          salaryCurrency: formData.salaryCurrency,
          salaryPeriod: formData.salaryPeriod,
          remote: formData.remote,
          featured: formData.featured,
          urgent: formData.urgent
        }) || editJob;
        
        setSuccess(true);
        onJobUpdated?.(resultJob);
      } else {
        // Create new job
        resultJob = await createJob({
          title: formData.title.trim(),
          description: formData.description.trim(),
          requirements: formData.requirements,
          location: formData.location.trim(),
          type: formData.type,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          salaryCurrency: formData.salaryCurrency,
          salaryPeriod: formData.salaryPeriod,
          remote: formData.remote,
          featured: formData.featured,
          urgent: formData.urgent
        });

        setSuccess(true);
        onJobCreated(resultJob);
      }
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          title: '',
          description: '',
          requirements: [],
          location: '',
          type: 'FULL_TIME',
          salaryMin: '',
          salaryMax: '',
          salaryCurrency: 'USD',
          salaryPeriod: 'yearly',
          remote: false,
          featured: false,
          urgent: false
        });
      }, 1500);
    } catch (err: any) {
      console.error('Error creating job:', err);
      
      // Provide more specific error messages
      if (err.message.includes('Authentication required')) {
        setError('Please log in again to post a job.');
      } else if (err.message.includes('permission')) {
        setError('You do not have permission to post jobs. Please check your account role.');
      } else if (err.message.includes('Forbidden')) {
        setError('Access denied. Please ensure you are logged in with a Company or Professional account.');
      } else {
        setError(err.message || 'Failed to post job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequirement();
    }
  };

  if (!isOpen) return null;

  const renderBasics = () => (
    <>
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Job Title *</label>
        <input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Senior Frontend Developer" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
        <p className="text-xs text-gray-400 mt-1">Minimum 5 characters.</p>
      </div>
      {/* Location & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
          <input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., San Francisco, CA" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">Job Type *</label>
          <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
            <option value="FULL_TIME">Full-time</option><option value="PART_TIME">Part-time</option><option value="INTERNSHIP">Internship</option><option value="CONTRACT">Contract</option>
          </select>
        </div>
      </div>
      {/* Remote toggle */}
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="remote" name="remote" checked={formData.remote} onChange={handleInputChange} className="w-4 h-4" />
        <label htmlFor="remote" className="text-sm text-gray-300">Remote available</label>
      </div>
      {/* Featured / Urgent */}
      <div className="flex items-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleInputChange} className="w-4 h-4" />
          <label htmlFor="featured" className="text-sm text-gray-300">Featured</label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="urgent" name="urgent" checked={formData.urgent} onChange={handleInputChange} className="w-4 h-4" />
          <label htmlFor="urgent" className="text-sm text-gray-300">Urgent</label>
        </div>
      </div>
    </>
  );

  const renderRequirements = () => (
    <>
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Job Description *</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Describe the role, responsibilities…" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        <p className="text-xs text-gray-400 mt-1">50–5000 characters. Tip: include tech keywords (React, Docker, Kubernetes) for better search matches.</p>
      </div>
      {/* Requirements list UI remains existing (reuse) */}
      {/* ... existing requirements code ... */}
    </>
  );

  const renderCompensation = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Salary Min</label>
          <input name="salaryMin" type="number" min={0} value={formData.salaryMin} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Salary Max</label>
          <input name="salaryMax" type="number" min={0} value={formData.salaryMax} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
          <select name="salaryCurrency" value={formData.salaryCurrency} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
            <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
          <select name="salaryPeriod" value={formData.salaryPeriod} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
            <option value="yearly">Yearly</option><option value="monthly">Monthly</option><option value="hourly">Hourly</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderStep = () => {
    if (step === 0) return renderBasics();
    if (step === 1) return renderRequirements();
    return renderCompensation();
  };

  const canNext = () => (step === 0 ? isBasicsValid() : step === 1 ? isRequirementsValid() : isCompValid());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{editJob ? 'Edit Job' : 'Post New Job'} – {step === 0 ? 'Basics' : step === 1 ? 'Requirements' : 'Compensation'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {success && (
            <div className="bg-green-600/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-md mb-4 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>{editJob ? 'Job updated successfully!' : 'Job posted successfully!'}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="formHelp">
            <div className="w-full bg-gray-700 h-2 rounded mb-4" aria-hidden="true">
              <div className="h-full bg-blue-500 rounded" style={{width: `${(step+1)*33.33}%`}} />
            </div>
            {renderStep()}

            {/* Submit Buttons */}
            <div className="flex justify-between space-x-3 pt-4 border-t border-gray-700">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep(prev => (prev - 1) as any)}>
                  Previous
                  </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || success || !canNext()}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? 'Saving...' : step < 2 ? 'Next' : (editJob ? 'Update Job' : 'Post Job')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const { incrementJobCount } = useStats();
  const navigate = useNavigate();
  const { isModalOpen, closeModal, requireAuth, modalAction, modalFeature } = useAuthModal();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'remote' | 'on-site' | 'saved'>('all');
  const [jobType, setJobType] = useState<'all' | JobType>('all');
  const [experienceLevel, setExperienceLevel] = useState<'all' | ExperienceLevel>('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationViewModal, setShowApplicationViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);

  const canPostJobs = user && (user.role === 'COMPANY' || user.role === 'PROFESSIONAL');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobData = await getJobs();
      setJobs(jobData);
      setFilteredJobs(jobData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setFilteredJobs(prev => [newJob, ...prev]);
    incrementJobCount();
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
    setFilteredJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
    setEditingJob(null);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobModal(true);
  };

  const handleDeleteJob = (job: Job) => {
    setDeletingJob(job);
    setShowDeleteModal(true);
  };

  const confirmDeleteJob = async () => {
    if (!deletingJob) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteJob(deletingJob.id);
      
      if (success) {
        setJobs(prev => prev.filter(job => job.id !== deletingJob.id));
        setFilteredJobs(prev => prev.filter(job => job.id !== deletingJob.id));
        setShowDeleteModal(false);
        setDeletingJob(null);
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      // Could add error handling here
    } finally {
      setIsDeleting(false);
    }
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setEditingJob(null);
  };

  const handleApplyClick = (job: Job) => {
    if (!user) {
      requireAuth('apply for this job', 'job-application');
      return;
    }

    // Check if user has already applied
    if (job.hasApplied) {
      handleViewApplication(job);
      return;
    }

    // Check if user can apply (students and professionals only)
    if (user.role !== 'STUDENT' && user.role !== 'PROFESSIONAL') {
      return;
    }

    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleViewApplication = (job: Job) => {
    if (!user) {
      requireAuth('view your application', 'Jobs');
      return;
    }

    if (!job.hasApplied || !job.applicationId) {
      console.warn('No application found for this job');
      return;
    }

    // Fetch full application details including rejection reason
    const fetchApplicationDetails = async () => {
      try {
        const applicationDetails = await getApplicationDetails(job.applicationId!);
        
        // Update selected job with full application details
        setSelectedJob({
          ...job,
          applicationStatus: applicationDetails.status,
          appliedAt: applicationDetails.appliedAt,
        });
        
        // Set application data for the modal
        const applicationForModal = {
          id: applicationDetails.id,
          status: applicationDetails.status,
          appliedAt: applicationDetails.appliedAt,
          coverLetter: applicationDetails.coverLetter || '',
          resumeUrl: applicationDetails.resumeUrl || '',
          portfolioUrl: applicationDetails.portfolioUrl || '',
          expectedSalary: applicationDetails.expectedSalary,
          recruiterNotes: applicationDetails.recruiterNotes || '',
          rejectionReason: applicationDetails.rejectionReason || ''
        };
        
        // Store the application data separately
        setApplicationData(applicationForModal);
    setSelectedJob(job);
    setShowApplicationViewModal(true);
      } catch (error) {
        console.error('Error fetching application details:', error);
        // Fallback to basic application info if fetching details fails
        setSelectedJob(job);
        setShowApplicationViewModal(true);
      }
    };

    fetchApplicationDetails();
  };

  const handleApplicationSubmitted = async (applicationData: {
    coverLetter: string;
    resume: File | null;
    portfolio?: string;
  }) => {
    if (!selectedJob) return;
    
    try {
      // Upload resume first if provided
      let resumeUrl = '';
      if (applicationData.resume) {
        const resumeUploadResult = await uploadResume(applicationData.resume);
        resumeUrl = resumeUploadResult.resumeUrl;
      }

      // Submit the job application
      await applyForJob(selectedJob.id, {
        jobId: selectedJob.id,
        coverLetter: applicationData.coverLetter,
        resumeUrl: resumeUrl,
        portfolioUrl: applicationData.portfolio
      });

      setShowApplicationModal(false);
      setSelectedJob(null);
      
      // Refresh the jobs data to get the updated application status from server
      await fetchJobs();
      if (selectedJob) {
        // Optionally refetch the selected job details if needed
        const updatedJob = await getJobById(selectedJob.id);
        setSelectedJob(updatedJob || null);
      }
      
      // Show success message
      console.log('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
      throw error; // Re-throw so the modal can handle the error
    }
  };

  const handleViewCV = async (resumeUrl: string) => {
    // Implementation for viewing CV if needed
    console.log('View CV:', resumeUrl);
  };

  const handleDownloadCV = async (resumeUrl: string) => {
    try {
      const filename = resumeUrl.split('/').pop();
      if (filename) {
        await downloadResumeFile(filename, 'Resume');
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Filter jobs whenever dependencies change
  useEffect(() => {
    const filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = jobType === 'all' || job.type === jobType;
      
      if (filterBy === 'all') return matchesSearch && matchesType;
      if (filterBy === 'remote') return matchesSearch && matchesType && job.remote;
      if (filterBy === 'on-site') return matchesSearch && matchesType && !job.remote;
      if (filterBy === 'saved') {
        // Mock: assume user has saved some jobs
        return matchesSearch && matchesType && ['1', '3'].includes(job.id);
      }
      return matchesSearch && matchesType;
    });
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterBy, jobType]);

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return Briefcase;
      case 'PART_TIME': return Clock;
      case 'INTERNSHIP': return Users;
      case 'CONTRACT': return ExternalLink;
      default: return Briefcase;
    }
  };

  const getJobTypeDisplayName = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Full-time';
      case 'PART_TIME': return 'Part-time';
      case 'INTERNSHIP': return 'Internship';
      case 'CONTRACT': return 'Contract';
      default: return type;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'PART_TIME': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'INTERNSHIP': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'CONTRACT': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const isJobOwner = (job: Job) => {
    return user && job.companyId === user.id;
  };

  const getApplicationButtonContent = (job: Job) => {
    if (!user) {
      return {
        text: 'Sign up to Apply',
        variant: 'outline' as const,
        disabled: false,
        onClick: () => handleApplyClick(job)
      };
    }

    if (user.role === 'COMPANY') {
      return {
        text: 'Cannot Apply',
        variant: 'outline' as const,
        disabled: true,
        onClick: () => {}
      };
    }

    if (user.role !== 'STUDENT' && user.role !== 'PROFESSIONAL') {
      return {
        text: 'Cannot Apply',
        variant: 'outline' as const,
        disabled: true,
        onClick: () => {}
      };
    }

    if (job.hasApplied) {
      const statusColors = {
        PENDING: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        REVIEWING: 'bg-blue-600 hover:bg-blue-700 text-white',
        SHORTLISTED: 'bg-purple-600 hover:bg-purple-700 text-white',
        INTERVIEWED: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        OFFERED: 'bg-green-600 hover:bg-green-700 text-white',
        ACCEPTED: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        REJECTED: 'bg-red-600 hover:bg-red-700 text-white',
        WITHDRAWN: 'bg-gray-600 hover:bg-gray-700 text-white'
      };

      const status = job.applicationStatus || 'PENDING';
      const statusText = status.charAt(0) + status.slice(1).toLowerCase();
      const appliedDate = job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : '';

      return {
        text: `You Applied (${statusText})`,
        variant: 'default' as const,
        disabled: false,
        onClick: () => handleViewApplication(job),
        className: statusColors[status],
        subtitle: appliedDate ? `Applied on ${appliedDate}` : undefined
      };
    }

    return {
      text: 'Apply Now',
      variant: 'default' as const,
      disabled: false,
      onClick: () => handleApplyClick(job)
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Job Opportunities</h1>
              <p className="text-gray-300 max-w-2xl">
                {user?.role === 'STUDENT' && 'Find internships and entry-level positions to start your career'}
                {user?.role === 'PROFESSIONAL' && 'Discover new career opportunities, advance your skills, and post job openings'}
                {user?.role === 'COMPANY' && 'Post job openings and find top talent'}
                {!user && 'Discover amazing job opportunities from our partner companies'}
              </p>
            </div>
            {/* Post Job Button - Show for authenticated users or trigger modal for guests */}
            {!user ? (
              <Button 
                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-6 py-3 text-base flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                                 onClick={() => requireAuth('post job opportunities', 'Jobs')}
              >
                <Plus className="h-4 w-4" />
                <span>Post Job</span>
              </Button>
            ) : canPostJobs && (
              <Button 
                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-6 py-3 text-base flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={() => setShowJobModal(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Post Job</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as 'all' | 'remote' | 'on-site' | 'saved')}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Jobs</option>
                  <option value="remote">Remote Only</option>
                  <option value="on-site">On-site Only</option>
                  {user && <option value="saved">Saved Jobs</option>}
                </select>
              </div>

              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as 'all' | JobType)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{jobs.length}</div>
            <div className="text-sm text-gray-400">Open Positions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{new Set(jobs.map(job => job.company)).size}</div>
            <div className="text-sm text-gray-400">Companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{jobs.filter(job => job.remote).length}</div>
            <div className="text-sm text-gray-400">Remote Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{jobs.filter(job => job.type === 'INTERNSHIP').length}</div>
            <div className="text-sm text-gray-400">Internships</div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-gray-300">
                  {searchTerm || filterBy !== 'all' || jobType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'New opportunities will be posted soon!'
                  }
                </p>
              </div>
              {!searchTerm && canPostJobs && (
                <Button 
                  className="mt-4"
                  onClick={() => setShowJobModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => {
            const buttonProps = getApplicationButtonContent(job);
            
            return (
              <Card key={job.id} hover className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 lg:gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-gray-300 mb-3">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{job.location}</span>
                              {job.remote && (
                                <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                  Remote
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                                                      <span className={`px-3 py-1 text-sm rounded-full border ${getJobTypeColor(job.type)}`}>
                              {getJobTypeDisplayName(job.type)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {job.description}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Requirements:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 4).map((requirement, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                              >
                                {requirement}
                              </span>
                            ))}
                            {job.requirements.length > 4 && (
                              <span className="px-3 py-1 bg-gray-700 text-gray-400 text-xs rounded-full border border-gray-600">
                                +{job.requirements.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-4">
                            {job.salary && (
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{job.salary}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Posted {formatDate(job.postedAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{Math.floor(Math.random() * 500) + 50}</span>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                              <Bookmark className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:ml-6 flex flex-col space-y-2 lg:min-w-[140px] lg:max-w-[140px]">
                      {isJobOwner(job) ? (
                        <>
                          <Button 
                            className="w-full h-10 bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-1"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full h-10 border-red-500 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center space-x-1"
                            onClick={() => handleDeleteJob(job)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            className={`w-full h-10 ${buttonProps.className || ''}`}
                            variant={buttonProps.variant}
                            disabled={buttonProps.disabled}
                            onClick={buttonProps.onClick}
                          >
                            {buttonProps.text}
                          </Button>
                          {buttonProps.subtitle && (
                            <p className="text-xs text-gray-400 text-center">{buttonProps.subtitle}</p>
                          )}
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full h-10" 
                        onClick={() => {
                          if (job.hasApplied) {
                            handleViewApplication(job);
                          } else {
                            navigate(`/jobs/${job.id}`);
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={showJobModal}
        onClose={closeJobModal}
        onJobCreated={handleJobCreated}
        onJobUpdated={handleJobUpdated}
        editJob={editingJob}
      />

      {/* Job Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          jobTitle={selectedJob.title}
          companyName={selectedJob.company}
          onSubmit={handleApplicationSubmitted}
          hasApplied={selectedJob.hasApplied}
        />
      )}

      {/* Application View Modal */}
      {selectedJob && (
        <ApplicationViewModal
          isOpen={showApplicationViewModal}
          onClose={() => {
            setShowApplicationViewModal(false);
            setApplicationData(null);
          }}
          application={applicationData || {
            id: selectedJob.applicationId || '',
            status: selectedJob.applicationStatus || 'PENDING',
            appliedAt: selectedJob.appliedAt || new Date().toISOString(),
            coverLetter: '',
            resumeUrl: '',
            portfolioUrl: '',
            expectedSalary: undefined,
            recruiterNotes: '',
            rejectionReason: ''
          }}
          jobTitle={selectedJob.title}
          companyName={selectedJob.company}
          onViewCV={handleViewCV}
          onDownloadCV={handleDownloadCV}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingJob(null);
        }}
        onConfirm={confirmDeleteJob}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job posting? This action cannot be undone and will remove all associated applications."
        itemName={deletingJob?.title}
        isDeleting={isDeleting}
        confirmText="Delete Job"
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        action={modalAction}
        feature={modalFeature}
      />
    </div>
  );
};

export default JobsPage; 