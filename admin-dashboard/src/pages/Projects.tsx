import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ExternalLink, 
  Github, 
  Eye, 
  Trash2, 
  Flag,
  Star,
  Calendar,
  User,
  Code2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectAPI, Project } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailsModal } from "@/components/dashboard/projects/ProjectDetailsModal";
import { BulkActionsBar } from "@/components/dashboard/projects/BulkActionsBar";
import { ProjectAnalytics } from "@/components/dashboard/projects/ProjectAnalytics";

const STATUS_COLORS = {
  published: "bg-green-600 text-white",
  draft: "bg-yellow-600 text-white",
  flagged: "bg-red-600 text-white",
};

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // Fetch projects with filters
  const { 
    data: projectsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['projects', { search: searchTerm, status: statusFilter, page }],
    queryFn: () => projectAPI.getProjects({
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit: 10
    }),
    enabled: hasPermission && hasPermission('content.read'),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => projectAPI.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Project has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  });

  // Approve project mutation
  const approveProjectMutation = useMutation({
    mutationFn: ({ projectId, notes }: { projectId: string; notes?: string }) => 
      projectAPI.approveProject(projectId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Project has been approved successfully",
      });
    },
    onError: (error: any) => {
      console.error('Project approval error:', error);
      
      let errorMessage = 'Failed to approve project. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Reject project mutation
  const rejectProjectMutation = useMutation({
    mutationFn: ({ projectId, reason }: { projectId: string; reason: string }) => 
      projectAPI.rejectProject(projectId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Project has been rejected successfully",
      });
    },
    onError: (error: any) => {
      console.error('Project rejection error:', error);
      
      let errorMessage = 'Failed to reject project. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Rejection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Bulk operations
  const bulkApproveMutation = useMutation({
    mutationFn: async (projectIds: string[]) => {
      const promises = projectIds.map(id => projectAPI.approveProject(id));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProjects([]);
      toast({
        title: "Success",
        description: "Projects have been approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve some projects",
        variant: "destructive",
      });
    }
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async ({ projectIds, reason }: { projectIds: string[]; reason: string }) => {
      const promises = projectIds.map(id => projectAPI.rejectProject(id, reason));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProjects([]);
      toast({
        title: "Success",
        description: "Projects have been rejected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject some projects",
        variant: "destructive",
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (projectIds: string[]) => {
      const promises = projectIds.map(id => projectAPI.deleteProject(id));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProjects([]);
      toast({
        title: "Success",
        description: "Projects have been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete some projects",
        variant: "destructive",
      });
    }
  });

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    await deleteProjectMutation.mutateAsync(selectedProject.id);
  };

  const handleApproveProject = async (projectId: string, notes?: string) => {
    await approveProjectMutation.mutateAsync({ projectId, notes });
  };

  const handleRejectProject = async (projectId: string, reason: string) => {
    await rejectProjectMutation.mutateAsync({ projectId, reason });
  };

  const handleBulkApprove = async (projectIds: string[]) => {
    await bulkApproveMutation.mutateAsync(projectIds);
  };

  const handleBulkReject = async (projectIds: string[]) => {
    // For bulk reject, we'll use a simple reason
    await bulkRejectMutation.mutateAsync({ projectIds, reason: "Bulk rejection by admin" });
  };

  const handleBulkDelete = async (projectIds: string[]) => {
    await bulkDeleteMutation.mutateAsync(projectIds);
  };

  const handleExport = (projectIds: string[]) => {
    const selectedProjectsData = projectsData?.projects?.filter(p => projectIds.includes(p.id)) || [];
    const csvContent = [
      ['Title', 'Author', 'Status', 'Technologies', 'Created', 'Feedback Count'],
      ...selectedProjectsData.map(p => [
        p.title,
        p.author?.name || 'Unknown',
        p.status,
        (p.technologies || []).join(', '),
        new Date(p.createdAt).toLocaleDateString(),
        p.feedbackCount.toString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${projectIds.length} projects exported successfully`,
    });
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projectsData?.projects?.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projectsData?.projects?.map(p => p.id) || []);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Project Management</h1>
          </div>
          <Card className="bg-red-900/20 border-red-500/20">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Projects</h3>
                <p className="text-red-400 mb-4">There was an error loading the projects data.</p>
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
            <h1 className="text-3xl font-bold text-white">Project Management</h1>
            <p className="text-gray-400 mt-1">Manage community projects and portfolios</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
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
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <ProjectAnalytics 
            projects={projectsData?.projects || []} 
            isLoading={isLoading}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-800 to-blue-900/20 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Code2 className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Projects</p>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? <Skeleton className="h-6 w-16 bg-gray-700" /> : projectsData?.total || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800 to-green-900/20 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Published</p>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? <Skeleton className="h-6 w-16 bg-gray-700" /> : 
                      (projectsData?.projects?.filter(p => p.status === 'published')?.length || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800 to-yellow-900/20 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Drafts</p>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? <Skeleton className="h-6 w-16 bg-gray-700" /> : 
                      (projectsData?.projects?.filter(p => p.status === 'draft')?.length || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800 to-red-900/20 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Flag className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm text-gray-400">Flagged</p>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? <Skeleton className="h-6 w-16 bg-gray-700" /> : 
                      (projectsData?.projects?.filter(p => p.status === 'flagged')?.length || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          projects={projectsData?.projects || []}
          selectedProjects={selectedProjects}
          onSelectAll={handleSelectAll}
          onSelectProject={handleSelectProject}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          isLoading={bulkApproveMutation.isPending || bulkRejectMutation.isPending || bulkDeleteMutation.isPending}
        />

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects by title, author, or technology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3 bg-gray-700" />
                      <Skeleton className="h-3 w-1/2 bg-gray-700" />
                    </div>
                    <Skeleton className="h-6 w-16 bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-750">
                    <TableHead className="text-gray-300 w-12">
                      <Checkbox
                        checked={selectedProjects.length === projectsData?.projects?.length}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = selectedProjects.length > 0 && selectedProjects.length < (projectsData?.projects?.length || 0);
                          }
                        }}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableHead>
                    <TableHead className="text-gray-300">Project</TableHead>
                    <TableHead className="text-gray-300">Author</TableHead>
                    <TableHead className="text-gray-300">Technologies</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Feedback</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(projectsData?.projects ?? []).map((project) => (
                    <TableRow key={project.id} className="border-gray-700 hover:bg-gray-750">
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={() => handleSelectProject(project.id)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{project.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {project.description}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {project.githubUrl && (
                              <a 
                                href={project.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white"
                              >
                                <Github className="h-3 w-3" />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a 
                                href={project.liveUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {getInitials(project.author?.name || 'Unknown')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-white">{project.author?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">{project.author?.role || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies?.slice(0, 3)?.map((tech) => (
                            <Badge 
                              key={tech} 
                              variant="secondary" 
                              className="bg-gray-700 text-gray-300 text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {(project.technologies?.length ?? 0) > 3 && (
                            <Badge variant="secondary" className="bg-gray-700 text-gray-400 text-xs">
                              +{(project.technologies?.length ?? 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || "bg-gray-600 text-white"}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {formatDate(project.createdAt)}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {project.feedbackCount}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="text-gray-300 hover:bg-gray-700"
                              onClick={() => setSelectedProject(project)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {project.status === 'flagged' && (
                              <>
                                <DropdownMenuItem 
                                  className="text-green-400 hover:bg-gray-700"
                                  onClick={() => handleApproveProject(project.id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-gray-700"
                                  onClick={() => handleRejectProject(project.id, "Rejected by admin")}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-gray-700"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!projectsData?.projects?.length && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                        No projects available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {!isLoading && (!projectsData?.projects || projectsData?.projects?.length === 0) && (
              <div className="text-center py-8">
                <Code2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No projects found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No projects have been created yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details Modal */}
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onApprove={handleApproveProject}
          onReject={handleRejectProject}
          onDelete={handleDeleteProject}
          isLoading={approveProjectMutation.isPending || rejectProjectMutation.isPending || deleteProjectMutation.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Project</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone and will permanently remove the project and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedProject(null);
                }}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                disabled={deleteProjectMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
