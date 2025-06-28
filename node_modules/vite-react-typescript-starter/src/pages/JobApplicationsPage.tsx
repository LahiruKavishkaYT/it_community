import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  Briefcase,
  FileText,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { JobApplication, ApplicationStatus } from '../types';
import { getCompanyApplications, updateApplicationStatus } from '../services/api';

const JobApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [skillsMatchFilter, setSkillsMatchFilter] = useState<number>(0);

  // Check authorization
  if (!user || (user.role !== 'COMPANY' && user.role !== 'PROFESSIONAL')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <h1 className="text-xl font-bold text-white text-center">Access Denied</h1>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-center">
              Only companies and professionals can access job applications.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, skillsMatchFilter]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const filters: any = {};
      
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      
      if (skillsMatchFilter > 0) {
        filters.skillsMatch = skillsMatchFilter;
      }

      const data = await getCompanyApplications(user.id, filters);
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus, notes?: string) => {
    try {
      await updateApplicationStatus(applicationId, { status: newStatus, recruiterNotes: notes });
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, recruiterNotes: notes }
            : app
        )
      );

      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus, recruiterNotes: notes });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update application status');
    }
  };

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

  const getSkillsMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesSearch;
  });

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    reviewing: applications.filter(app => app.status === 'REVIEWING').length,
    shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
    interviewed: applications.filter(app => app.status === 'INTERVIEWED').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Applications</h1>
          <p className="text-gray-300">Manage and review applications for your job postings</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{applicationStats.total}</p>
              </div>
              <Users className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{applicationStats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Reviewing</p>
                <p className="text-2xl font-bold text-blue-400">{applicationStats.reviewing}</p>
              </div>
              <Eye className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Shortlisted</p>
                <p className="text-2xl font-bold text-purple-400">{applicationStats.shortlisted}</p>
              </div>
              <Star className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Interviewed</p>
                <p className="text-2xl font-bold text-indigo-400">{applicationStats.interviewed}</p>
              </div>
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applicants or positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEWED">Interviewed</option>
          <option value="OFFERED">Offered</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={skillsMatchFilter}
          onChange={(e) => setSkillsMatchFilter(parseInt(e.target.value))}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0}>All Skill Matches</option>
          <option value={80}>80%+ Match</option>
          <option value={60}>60%+ Match</option>
          <option value={40}>40%+ Match</option>
        </select>

        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
              <p className="text-gray-300">
                {applications.length === 0 
                  ? "You haven't received any job applications yet."
                  : "No applications match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:bg-gray-700/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {application.applicant?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {application.applicant?.name}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Applied for {application.job?.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs rounded-full border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="capitalize">{application.status.toLowerCase()}</span>
                        </span>
                        
                        {application.skillsMatchScore !== undefined && (
                          <span className={`text-sm font-semibold ${getSkillsMatchColor(application.skillsMatchScore)}`}>
                            {Math.round(application.skillsMatchScore)}% Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                      
                      {application.applicant?.location && (
                        <div className="flex items-center space-x-2 text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span>{application.applicant.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Briefcase className="h-4 w-4" />
                        <span className="capitalize">{application.applicant?.role.toLowerCase()}</span>
                      </div>

                      {application.expectedSalary && (
                        <div className="flex items-center space-x-2 text-gray-300">
                          <span className="text-green-400">$</span>
                          <span>${application.expectedSalary.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {application.applicant?.skills && application.applicant.skills.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {application.applicant.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                          {application.applicant.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                              +{application.applicant.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 lg:ml-6 lg:min-w-[200px]">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {application.resumeUrl && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Extract filename from URL and download
                          const filename = application.resumeUrl?.split('/').pop();
                          if (filename) {
                            window.open(`http://localhost:3001/jobs/download-resume/${filename}`, '_blank');
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download Resume
                      </Button>
                    )}

                    <div className="flex space-x-1">
                      {application.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'REVIEWING')}
                          >
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {application.status === 'REVIEWING' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                          >
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {application.status === 'SHORTLISTED' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'INTERVIEWED')}
                          >
                            Interview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {application.status === 'INTERVIEWED' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'OFFERED')}
                          >
                            Offer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white font-medium">{selectedApplication.applicant?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white">{selectedApplication.applicant?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Role</p>
                      <p className="text-white capitalize">{selectedApplication.applicant?.role.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Expected Salary</p>
                      <p className="text-white">
                        {selectedApplication.expectedSalary 
                          ? `$${selectedApplication.expectedSalary.toLocaleString()}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Cover Letter</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedApplication.applicant?.skills && selectedApplication.applicant.skills.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.applicant.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  {selectedApplication.resumeUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const filename = selectedApplication.resumeUrl?.split('/').pop();
                        if (filename) {
                          window.open(`http://localhost:3001/jobs/download-resume/${filename}`, '_blank');
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  )}
                  
                  {selectedApplication.portfolioUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedApplication.portfolioUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Button>
                  )}

                  <Button onClick={() => setSelectedApplication(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage;