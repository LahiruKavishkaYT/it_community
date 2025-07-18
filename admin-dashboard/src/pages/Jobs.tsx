import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Building2,
  MapPin,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Briefcase,
  GraduationCap,
  Clock,
  FileText,
  BarChart3,
  Download,
  Archive,
  Settings,
  UserCheck,
  UserX,
  Ban,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  SortAsc,
  SortDesc
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jobAPI, Job } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCreationModal } from "@/components/dashboard/jobs/JobCreationModal";
import { JobDetailsModal } from "@/components/dashboard/jobs/JobDetailsModal";
import { JobAnalytics } from "@/components/dashboard/jobs/JobAnalytics";

const JOB_TYPE_COLORS = {
  FULL_TIME: "bg-blue-600 text-white",
  PART_TIME: "bg-green-600 text-white",
  INTERNSHIP: "bg-purple-600 text-white",
  CONTRACT: "bg-orange-600 text-white",
};

const JOB_STATUS_COLORS = {
  DRAFT: "bg-gray-600 text-white",
  PUBLISHED: "bg-green-600 text-white",
  CLOSED: "bg-red-600 text-white",
  ARCHIVED: "bg-yellow-600 text-white",
};

const JOB_STATUS_ICONS = {
  DRAFT: Pause,
  PUBLISHED: Play,
  CLOSED: XCircle,
  ARCHIVED: Archive,
};

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkNotes, setBulkNotes] = useState("");
  const [sortBy, setSortBy] = useState("postedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState("jobs");
  
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // Fetch jobs with filters
  const { 
    data: jobsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['jobs', { search: searchTerm, status: statusFilter, type: typeFilter, page, sortBy, sortOrder }],
    queryFn: () => jobAPI.getJobs({
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      page,
      limit: 12
    }),
    enabled: hasPermission && hasPermission('content.read'),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => jobAPI.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      toast({
        title: "Success",
        description: "Job has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  });

  // Approve job mutation
  const approveJobMutation = useMutation({
    mutationFn: ({ jobId, notes }: { jobId: string; notes?: string }) => 
      jobAPI.approveJob(jobId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Success",
        description: "Job has been approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve job",
        variant: "destructive",
      });
    }
  });

  // Reject job mutation
  const rejectJobMutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) => 
      jobAPI.rejectJob(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Success",
        description: "Job has been rejected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject job",
        variant: "destructive",
      });
    }
  });

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) => 
      jobAPI.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Success",
        description: "Job status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  });

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    await deleteJobMutation.mutateAsync(selectedJob.id);
  };

  const handleApproveJob = async (jobId: string, notes?: string) => {
    await approveJobMutation.mutateAsync({ jobId, notes });
  };

  const handleRejectJob = async (jobId: string, reason: string) => {
    await rejectJobMutation.mutateAsync({ jobId, reason });
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    await updateStatusMutation.mutateAsync({ jobId, status });
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedJobs.length === 0) return;

    try {
      switch (bulkAction) {
        case 'approve':
          await Promise.all(selectedJobs.map(jobId => 
            approveJobMutation.mutateAsync({ jobId, notes: bulkNotes })
          ));
          break;
        case 'reject':
          await Promise.all(selectedJobs.map(jobId => 
            rejectJobMutation.mutateAsync({ jobId, reason: bulkNotes })
          ));
          break;
        case 'delete':
          await Promise.all(selectedJobs.map(jobId => 
            deleteJobMutation.mutateAsync(jobId)
          ));
          break;
        case 'archive':
          await Promise.all(selectedJobs.map(jobId => 
            updateStatusMutation.mutateAsync({ jobId, status: 'ARCHIVED' })
          ));
          break;
      }
      
      setSelectedJobs([]);
      setIsBulkActionsOpen(false);
      setBulkAction("");
      setBulkNotes("");
      
      toast({
        title: "Success",
        description: `Bulk action completed for ${selectedJobs.length} jobs`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobsData?.jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobsData?.jobs.map(job => job.id) || []);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getApplicationColor = (count: number) => {
    if (count >= 50) return "text-green-400";
    if (count >= 20) return "text-yellow-400";
    return "text-red-400";
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Jobs & Internships</h1>
          </div>
          <Card className="bg-red-900/20 border-red-500/20">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Jobs</h3>
                <p className="text-red-400 mb-4">There was an error loading the jobs data.</p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Jobs & Internships</h1>
            <p className="text-muted-foreground">Manage job postings and applications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsAnalyticsOpen(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({jobsData?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs by title, company, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postedAt">Posted Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="applicationsCount">Applications</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedJobs.length > 0 && (
              <Card className="bg-blue-900/20 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBulkActionsOpen(true)}
                      >
                        Bulk Actions
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedJobs([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Jobs Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                      <div className="flex gap-2 mt-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobsData.jobs.map((job) => {
                  const StatusIcon = JOB_STATUS_ICONS[job.status as keyof typeof JOB_STATUS_ICONS] || Pause;
                  const isSelected = selectedJobs.includes(job.id);
                  
                  return (
                    <Card key={job.id} className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{job.company?.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectJob(job.id)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedJob(job);
                                  setIsDetailsModalOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingJob(job)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {job.status === 'DRAFT' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApproveJob(job.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRejectJob(job.id, 'Rejected by admin')}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {job.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={JOB_TYPE_COLORS[job.type as keyof typeof JOB_TYPE_COLORS]}>
                            {job.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={JOB_STATUS_COLORS[job.status as keyof typeof JOB_STATUS_COLORS]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {job.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className={getApplicationColor(job.applicationsCount)}>
                                {job.applicationsCount} applications
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeDate(job.postedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'Get started by creating your first job posting.'}
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {jobsData && jobsData.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, jobsData.total)} of {jobsData.total} jobs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {jobsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === jobsData.totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <JobAnalytics />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <JobCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          editingJob={editingJob}
          onEditComplete={() => {
            setEditingJob(null);
            setIsCreateModalOpen(false);
          }}
        />

        <JobDetailsModal
          jobId={selectedJob?.id || null}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedJob(null);
          }}
        />

        {/* Analytics Modal */}
        <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Analytics</DialogTitle>
              <DialogDescription>
                Comprehensive insights into job postings and applications
              </DialogDescription>
            </DialogHeader>
            <JobAnalytics />
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Dialog */}
        <Dialog open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
              <DialogDescription>
                Perform actions on {selectedJobs.length} selected job{selectedJobs.length !== 1 ? 's' : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="action">Select Action</Label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve Jobs</SelectItem>
                    <SelectItem value="reject">Reject Jobs</SelectItem>
                    <SelectItem value="archive">Archive Jobs</SelectItem>
                    <SelectItem value="delete">Delete Jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(bulkAction === 'approve' || bulkAction === 'reject') && (
                <div>
                  <Label htmlFor="notes">
                    {bulkAction === 'approve' ? 'Notes (Optional)' : 'Reason (Required)'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                    placeholder={
                      bulkAction === 'approve' 
                        ? 'Add notes about the approval...'
                        : 'Provide a reason for rejection...'
                    }
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || (bulkAction === 'reject' && !bulkNotes.trim())}
                >
                  {bulkAction === 'approve' && 'Approve Jobs'}
                  {bulkAction === 'reject' && 'Reject Jobs'}
                  {bulkAction === 'archive' && 'Archive Jobs'}
                  {bulkAction === 'delete' && 'Delete Jobs'}
                </Button>
                <Button variant="outline" onClick={() => setIsBulkActionsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteJob}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
