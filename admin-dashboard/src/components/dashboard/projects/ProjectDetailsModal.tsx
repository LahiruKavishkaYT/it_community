import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ExternalLink, 
  Github, 
  Calendar, 
  User, 
  Code2, 
  MessageSquare,
  Eye,
  Star,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Project } from "@/services/api";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (projectId: string, notes?: string) => void;
  onReject?: (projectId: string, reason: string) => void;
  onDelete?: (projectId: string) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  published: {
    label: 'Published',
    color: 'bg-green-600 text-white',
    icon: CheckCircle,
    description: 'Project is live and visible to the community'
  },
  draft: {
    label: 'Draft',
    color: 'bg-yellow-600 text-white',
    icon: Eye,
    description: 'Project is in draft mode and not publicly visible'
  },
  flagged: {
    label: 'Flagged',
    color: 'bg-red-600 text-white',
    icon: Flag,
    description: 'Project has been flagged for review'
  }
};

export const ProjectDetailsModal = ({
  project,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
  isLoading = false
}: ProjectDetailsModalProps) => {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!project) return null;

  const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || AlertTriangle;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(project.id, approvalNotes);
      setApprovalNotes("");
      setShowApprovalForm(false);
    }
  };

  const handleReject = () => {
    if (onReject && rejectionReason.trim()) {
      onReject(project.id, rejectionReason);
      setRejectionReason("");
      setShowRejectionForm(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Project Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Header */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
              <p className="text-gray-400 mb-4">{project.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge className={statusConfig?.color || "bg-gray-600 text-white"}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig?.label || project.status}
                </Badge>
                <div className="flex items-center gap-1 text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span>{project.feedbackCount} feedback</span>
                </div>
              </div>

              {/* External Links */}
              <div className="flex items-center gap-4">
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-400 hover:text-green-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>

            {project.imageUrl && (
              <div className="lg:w-48 h-32 bg-gray-700 rounded-lg overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <Separator className="bg-gray-700" />

          {/* Project Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author Information */}
            <Card className="bg-gray-750 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Author Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(project.author?.name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">{project.author?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-400">{project.author?.email}</div>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 mt-1">
                      {project.author?.role || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Metadata */}
            <Card className="bg-gray-750 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className={statusConfig?.color || "bg-gray-600 text-white"}>
                    {statusConfig?.label || project.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Feedback:</span>
                  <span className="text-white">{project.feedbackCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technologies */}
          <Card className="bg-gray-750 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Technologies Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech) => (
                  <Badge 
                    key={tech} 
                    variant="secondary" 
                    className="bg-gray-700 text-gray-300"
                  >
                    {tech}
                  </Badge>
                ))}
                {(!project.technologies || project.technologies.length === 0) && (
                  <span className="text-gray-500">No technologies specified</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Description */}
          {statusConfig?.description && (
            <Card className="bg-gray-750 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <StatusIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Status Information</h4>
                    <p className="text-gray-400">{statusConfig.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval/Rejection Forms */}
          {project.status === 'flagged' && (
            <div className="space-y-4">
              {!showApprovalForm && !showRejectionForm && (
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowApprovalForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Project
                  </Button>
                  <Button 
                    onClick={() => setShowRejectionForm(true)}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Project
                  </Button>
                </div>
              )}

              {showApprovalForm && (
                <Card className="bg-green-900/20 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-300">Approve Project</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      placeholder="Add approval notes (optional)..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Approving...' : 'Approve Project'}
                      </Button>
                      <Button 
                        onClick={() => setShowApprovalForm(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showRejectionForm && (
                <Card className="bg-red-900/20 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-300">Reject Project</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      placeholder="Provide rejection reason (required)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none"
                      rows={3}
                      required
                    />
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleReject}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isLoading || !rejectionReason.trim()}
                      >
                        {isLoading ? 'Rejecting...' : 'Reject Project'}
                      </Button>
                      <Button 
                        onClick={() => setShowRejectionForm(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-3">
            {onDelete && (
              <Button 
                onClick={handleDelete}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
                disabled={isLoading}
              >
                Delete Project
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 