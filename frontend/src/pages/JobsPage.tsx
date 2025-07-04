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
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import JobApplicationModal from '../components/UI/JobApplicationModal';
import { Job, JobType, CreateJobData } from '../types';
import { getJobs, createJob, getCurrentUser } from '../services/api';

// Job Posting Modal Component
const JobPostingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}> = ({ isOpen, onClose, onJobCreated }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [] as string[],
    location: '',
    type: 'FULL_TIME' as JobType,
    salary: '',
    remote: false
  });

  const [newRequirement, setNewRequirement] = useState('');

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
    
    if (!user) {
      setError('You must be logged in to post a job');
      return;
    }

    // Debug: Log user info for troubleshooting
    console.log('User info for job creation:', {
      id: user.id,
      role: user.role,
      name: user.name,
      company: user.company
    });

    // Debug: Check token
    const token = localStorage.getItem('token');
    console.log('JWT token exists:', !!token);
    console.log('Token length:', token?.length);
    
    // Debug: Check if role validation passes
    const hasValidRole = user.role === 'COMPANY' || user.role === 'PROFESSIONAL';
    console.log('Has valid role for job posting:', hasValidRole);

    // Debug: Test authentication with a simple endpoint first
    try {
      const userData = await getCurrentUser();
      console.log('Auth test response status: 200');
      console.log('Auth test user data:', userData);
    } catch (err) {
      console.log('Auth test error:', err);
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

      const newJob = await createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements,
        location: formData.location.trim(),
        type: formData.type,
        salary: formData.salary.trim() || undefined,
        remote: formData.remote
      });

      setSuccess(true);
      onJobCreated(newJob);
      
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
          salary: '',
          remote: false
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Post New Job</h2>
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
              <span>Job posted successfully!</span>
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements *
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 3+ years React experience"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={addRequirement}
                    disabled={!newRequirement.trim()}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
                
                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((requirement, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                      >
                        <span>{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(requirement)}
                          className="hover:text-blue-100 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location and Job Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                  Job Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-2">
                Salary (Optional)
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., $80K-120K or $25-35/hr"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Remote Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remote"
                name="remote"
                checked={formData.remote}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="remote" className="text-sm text-gray-300">
                Remote work available
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
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
                disabled={isSubmitting || success}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Posted!</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Post Job</span>
                  </>
                )}
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
  const { isModalOpen, modalAction, modalFeature, requireAuth, closeModal, isAuthenticated } = useAuthModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [jobType, setJobType] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const jobsData = await getJobs();
        setJobs(jobsData);
      } catch (err) {
        setError('Failed to load jobs. Please try again.');
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    incrementJobCount();
  };

  const handleApplyClick = (job: Job) => {
    if (!isAuthenticated) {
      requireAuth('apply for this job', 'Jobs');
      return;
    }
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmitted = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    // Optionally refresh jobs or show success message
  };

  const filteredJobs = jobs.filter(job => {
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

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'full-time': return Briefcase;
      case 'part-time': return Clock;
      case 'internship': return Users;
      case 'contract': return ExternalLink;
      default: return Briefcase;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'part-time': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'internship': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'contract': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
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

  const canPostJobs = user?.role === 'COMPANY' || user?.role === 'PROFESSIONAL';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
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
                  onChange={(e) => setFilterBy(e.target.value)}
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
                onChange={(e) => setJobType(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
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
            const TypeIcon = getJobTypeIcon(job.type);
            
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
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
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
                      {user && (user.role === 'STUDENT' || user.role === 'PROFESSIONAL') ? (
                        <Button className="w-full h-10" onClick={() => handleApplyClick(job)}>
                          Apply Now
                        </Button>
                      ) : user && user.role === 'COMPANY' ? (
                        <Button variant="outline" className="w-full h-10" disabled>
                          Cannot Apply
                        </Button>
                      ) : !user ? (
                        <Button variant="outline" className="w-full h-10" onClick={() => handleApplyClick(job)}>
                          Sign up to Apply
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full h-10" disabled>
                          Cannot Apply
                        </Button>
                      )}
                      <Button variant="outline" className="w-full h-10">
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
        onClose={() => setShowJobModal(false)}
        onJobCreated={handleJobCreated}
      />

      {/* Job Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          job={selectedJob}
          onApplicationSubmitted={handleApplicationSubmitted}
        />
      )}

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