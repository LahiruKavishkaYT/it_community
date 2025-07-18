import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  Mail,
  Phone,
  Globe,
  DollarSign,
  TrendingUp,
  User,
  Clock3,
  Star,
  MessageSquare
} from "lucide-react";
import { jobAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface JobDetailsModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const APPLICATION_STATUS_COLORS = {
  PENDING: "bg-yellow-600 text-white",
  REVIEWING: "bg-blue-600 text-white",
  SHORTLISTED: "bg-purple-600 text-white",
  INTERVIEWED: "bg-indigo-600 text-white",
  OFFERED: "bg-green-600 text-white",
  ACCEPTED: "bg-emerald-600 text-white",
  REJECTED: "bg-red-600 text-white",
  WITHDRAWN: "bg-gray-600 text-white",
};

const APPLICATION_STATUS_ICONS = {
  PENDING: Clock3,
  REVIEWING: Eye,
  SHORTLISTED: Star,
  INTERVIEWED: MessageSquare,
  OFFERED: CheckCircle,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
  WITHDRAWN: AlertTriangle,
};

export const JobDetailsModal = ({ jobId, isOpen, onClose }: JobDetailsModalProps) => {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>("all");
  const [applicationPage, setApplicationPage] = useState(1);
  
  const queryClient = useQueryClient();

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job-details', jobId],
    queryFn: () => jobAPI.getJobDetails(jobId!),
    enabled: !!jobId && isOpen,
  });

  // Fetch job applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['job-applications', jobId, applicationStatusFilter, applicationPage],
    queryFn: () => jobAPI.getJobApplications(jobId!, {
      status: applicationStatusFilter !== 'all' ? applicationStatusFilter : undefined,
      page: applicationPage,
      limit: 10
    }),
    enabled: !!jobId && isOpen,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status, notes }: { applicationId: string; status: string; notes?: string }) =>
      jobAPI.updateApplicationStatus(jobId!, applicationId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      setSelectedApplication(null);
      setNewStatus("");
      setNotes("");
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  });

  const handleUpdateStatus = () => {
    if (!selectedApplication || !newStatus) return;
    
    updateStatusMutation.mutate({
      applicationId: selectedApplication,
      status: newStatus,
      notes: notes || undefined
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getApplicationStatusCount = (status: string) => {
    if (!applicationsData?.applications) return 0;
    return applicationsData.applications.filter(app => app.status === status).length;
  };

  if (!jobId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Details
          </DialogTitle>
        </DialogHeader>

        {jobLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : job ? (
          <div className="space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{job.company?.name}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Posted {formatDate(job.postedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Applications Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Applications</span>
                      <Badge variant="secondary">{applicationsData?.total || 0}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(APPLICATION_STATUS_COLORS).map(([status, color]) => (
                        <div key={status} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{status.toLowerCase()}</span>
                          <Badge className={color} variant="secondary">
                            {getApplicationStatusCount(status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Applications Management
                </CardTitle>
                <div className="flex items-center gap-4 mt-4">
                  <Select value={applicationStatusFilter} onValueChange={setApplicationStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.keys(APPLICATION_STATUS_COLORS).map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : applicationsData?.applications && applicationsData.applications.length > 0 ? (
                  <div className="space-y-4">
                    {applicationsData.applications.map((application) => {
                      const StatusIcon = APPLICATION_STATUS_ICONS[application.status as keyof typeof APPLICATION_STATUS_ICONS] || Clock3;
                      
                      return (
                        <div key={application.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(application.applicant.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{application.applicant.name}</h4>
                              <Badge className={APPLICATION_STATUS_COLORS[application.status as keyof typeof APPLICATION_STATUS_COLORS]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {application.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{application.applicant.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Applied {formatDate(application.appliedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application.id);
                                setNewStatus(application.status);
                                setNotes(application.recruiterNotes || "");
                              }}
                            >
                              Update Status
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {applicationsData.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={applicationPage === 1}
                          onClick={() => setApplicationPage(prev => prev - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {applicationPage} of {applicationsData.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={applicationPage === applicationsData.totalPages}
                          onClick={() => setApplicationPage(prev => prev + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No applications found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Update Modal */}
            {selectedApplication && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background p-6 rounded-lg w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Update Application Status</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">New Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(APPLICATION_STATUS_COLORS).map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this status change..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateStatus}
                        disabled={!newStatus || updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(null);
                          setNewStatus("");
                          setNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Job not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 