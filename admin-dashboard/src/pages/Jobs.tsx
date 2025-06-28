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
  FileText
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
import { jobAPI, Job } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCreationModal } from "@/components/dashboard/jobs/JobCreationModal";

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
};

const JOB_STATUS_ICONS = {
  DRAFT: Pause,
  PUBLISHED: Play,
  CLOSED: XCircle,
};

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // Fetch jobs with filters
  const { 
    data: jobsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['jobs', { search: searchTerm, status: statusFilter, type: typeFilter, page }],
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

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    await deleteJobMutation.mutateAsync(selectedJob.id);
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
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                >
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Jobs & Internships</h1>
            <p className="text-gray-400 mt-1">Manage job postings and internship opportunities</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-800 to-blue-900/20 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Total Jobs</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">{jobsData?.total || 0}</span>
                <span className="text-xs text-green-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-green-900/20 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Active Jobs</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  {jobsData?.jobs?.filter(j => j.status === 'PUBLISHED').length || 0}
                </span>
                <span className="text-xs text-green-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-purple-900/20 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Internships</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  {jobsData?.jobs?.filter(j => j.type === 'INTERNSHIP').length || 0}
                </span>
                <span className="text-xs text-blue-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-orange-900/20 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-gray-400">Total Applications</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  {jobsData?.jobs?.reduce((sum, job) => sum + job.applicationsCount, 0) || 0}
                </span>
                <span className="text-xs text-green-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +22%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4 bg-gray-700" />
                    <Skeleton className="h-4 w-full bg-gray-700" />
                    <Skeleton className="h-4 w-2/3 bg-gray-700" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16 bg-gray-700" />
                      <Skeleton className="h-6 w-20 bg-gray-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData?.jobs?.map((job) => {
              const StatusIcon = JOB_STATUS_ICONS[job.status];
              
              return (
                <Card key={job.id} className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/20">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white line-clamp-2">{job.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={JOB_TYPE_COLORS[job.type]}>
                            {job.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={JOB_STATUS_COLORS[job.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-gray-300 hover:bg-gray-700"
                            onClick={() => {
                              setEditingJob(job);
                              setIsCreateModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm line-clamp-3">{job.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{job.company.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300 line-clamp-1">{job.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">Posted {formatRelativeDate(job.postedAt)}</span>
                        <span className="text-gray-500">({formatDate(job.postedAt)})</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className={`text-gray-300 ${getApplicationColor(job.applicationsCount)}`}>
                          {job.applicationsCount} applications
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                          {getInitials(job.company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-400">{job.company.email}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobsData?.jobs?.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No Jobs Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by posting your first job opportunity.'
                  }
                </p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Job</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteJob}
                disabled={deleteJobMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteJobMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Job Creation/Edit Modal */}
        <JobCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingJob(null);
          }}
          job={editingJob}
          mode={editingJob ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
