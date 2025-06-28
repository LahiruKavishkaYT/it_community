import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Github,
  ExternalLink,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  id: string;
  title: string;
  description: string;
  projectType: 'STUDENT_PROJECT' | 'PRACTICE_PROJECT';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  architecture?: string;
  learningObjectives: string[];
  keyFeatures: string[];
  createdAt: string;
  submittedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  _count: {
    feedback: number;
  };
}

interface ProjectApprovalPanelProps {
  className?: string;
}

export const ProjectApprovalPanel: React.FC<ProjectApprovalPanelProps> = ({ className }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending projects
  const { 
    data: pendingProjects, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin', 'projects', 'pending'],
    queryFn: () => adminAPI.getProjects({ status: 'PENDING_APPROVAL', limit: 10 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Approve project mutation
  const approveMutation = useMutation({
    mutationFn: ({ projectId, notes }: { projectId: string; notes?: string }) =>
      adminAPI.approveProject(projectId, notes),
    onSuccess: () => {
      toast({
        title: 'Project Approved',
        description: 'The project has been approved and is now public.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setIsApprovalDialogOpen(false);
      setSelectedProject(null);
      setApprovalNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to approve project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reject project mutation
  const rejectMutation = useMutation({
    mutationFn: ({ projectId, reason }: { projectId: string; reason: string }) =>
      adminAPI.rejectProject(projectId, reason),
    onSuccess: () => {
      toast({
        title: 'Project Rejected',
        description: 'The project has been rejected.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setIsRejectionDialogOpen(false);
      setSelectedProject(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reject project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleApprove = (project: Project) => {
    setSelectedProject(project);
    setIsApprovalDialogOpen(true);
  };

  const handleReject = (project: Project) => {
    setSelectedProject(project);
    setIsRejectionDialogOpen(true);
  };

  const handleApproveSubmit = () => {
    if (!selectedProject) return;
    approveMutation.mutate({
      projectId: selectedProject.id,
      notes: approvalNotes.trim() || undefined,
    });
  };

  const handleRejectSubmit = () => {
    if (!selectedProject || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }
    rejectMutation.mutate({
      projectId: selectedProject.id,
      reason: rejectionReason.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProjectTypeBadge = (type: string) => {
    switch (type) {
      case 'STUDENT_PROJECT':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">Student</Badge>;
      case 'PRACTICE_PROJECT':
        return <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">Practice</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (error) {
    return (
      <Card className={`bg-red-900/20 border-red-500/20 ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 mb-4">Failed to load pending projects</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Project Approval Queue
            </CardTitle>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              {isLoading ? '...' : pendingProjects?.projects?.length || 0} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-700 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-gray-700" />
                    <Skeleton className="h-3 w-1/2 bg-gray-700" />
                  </div>
                  <Skeleton className="h-8 w-20 bg-gray-700" />
                </div>
              ))}
            </div>
          ) : pendingProjects?.projects?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400 text-lg font-medium">No pending projects</p>
              <p className="text-gray-500 text-sm">All projects have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingProjects?.projects?.map((project: Project) => (
                <div key={project.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white text-lg">{project.title}</h3>
                        {getStatusBadge(project.status)}
                        {getProjectTypeBadge(project.projectType)}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{project.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.submittedAt || project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {project.technologies.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 5).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 5 && (
                          <Badge variant="outline" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                            +{project.technologies.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          // You could open a detailed view modal here
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(project)}
                        className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        disabled={rejectMutation.isPending}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(project)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={approveMutation.isPending}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Approve Project
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedProject.title}</h3>
                <p className="text-gray-400 text-sm mb-4">by {selectedProject.author.name}</p>
                <p className="text-gray-300">{selectedProject.description}</p>
              </div>
              
              <Separator className="bg-gray-600" />
              
              <div>
                <Label htmlFor="approval-notes" className="text-gray-300">
                  Approval Notes (Optional)
                </Label>
                <Textarea
                  id="approval-notes"
                  placeholder="Add any notes about this approval..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsApprovalDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveSubmit}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve Project'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Project
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedProject.title}</h3>
                <p className="text-gray-400 text-sm mb-4">by {selectedProject.author.name}</p>
                <p className="text-gray-300">{selectedProject.description}</p>
              </div>
              
              <Separator className="bg-gray-600" />
              
              <div>
                <Label htmlFor="rejection-reason" className="text-gray-300">
                  Reason for Rejection <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a reason for rejecting this project..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectionDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectSubmit}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Project'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 