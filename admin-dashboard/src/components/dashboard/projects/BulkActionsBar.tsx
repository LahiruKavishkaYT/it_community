import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle, 
  XCircle, 
  Trash2, 
  Download, 
  MoreHorizontal,
  Filter,
  SelectAll,
  Square
} from "lucide-react";
import { Project } from "@/services/api";

interface BulkActionsBarProps {
  projects: Project[];
  selectedProjects: string[];
  onSelectAll: () => void;
  onSelectProject: (projectId: string) => void;
  onBulkApprove: (projectIds: string[]) => void;
  onBulkReject: (projectIds: string[]) => void;
  onBulkDelete: (projectIds: string[]) => void;
  onExport: (projectIds: string[]) => void;
  isLoading?: boolean;
}

export const BulkActionsBar = ({
  projects,
  selectedProjects,
  onSelectAll,
  onSelectProject,
  onBulkApprove,
  onBulkReject,
  onBulkDelete,
  onExport,
  isLoading = false
}: BulkActionsBarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isAllSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const isIndeterminate = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  const handleSelectAll = () => {
    onSelectAll();
  };

  const handleBulkApprove = () => {
    onBulkApprove(selectedProjects);
  };

  const handleBulkReject = () => {
    if (rejectionReason.trim()) {
      onBulkReject(selectedProjects);
      setRejectionReason("");
      setShowRejectDialog(false);
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete(selectedProjects);
    setShowDeleteDialog(false);
  };

  const handleExport = () => {
    onExport(selectedProjects);
  };

  const getSelectedProjectsData = () => {
    return projects.filter(project => selectedProjects.includes(project.id));
  };

  const selectedProjectsData = getSelectedProjectsData();
  const flaggedCount = selectedProjectsData.filter(p => p.status === 'flagged').length;
  const draftCount = selectedProjectsData.filter(p => p.status === 'draft').length;
  const publishedCount = selectedProjectsData.filter(p => p.status === 'published').length;

  if (selectedProjects.length === 0) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = isIndeterminate;
              }
            }}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <span className="text-sm text-gray-400">
            {isAllSelected ? 'Deselect All' : 'Select All'} ({projects.length} projects)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            {projects.length} total
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isIndeterminate;
                }
              }}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <span className="text-sm font-medium text-blue-300">
              {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {flaggedCount > 0 && (
              <Badge className="bg-red-600 text-white">
                {flaggedCount} flagged
              </Badge>
            )}
            {draftCount > 0 && (
              <Badge className="bg-yellow-600 text-white">
                {draftCount} draft
              </Badge>
            )}
            {publishedCount > 0 && (
              <Badge className="bg-green-600 text-white">
                {publishedCount} published
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          {flaggedCount > 0 && (
            <Button
              onClick={handleBulkApprove}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve ({flaggedCount})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="text-gray-300">Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              
              {flaggedCount > 0 && (
                <DropdownMenuItem 
                  onClick={() => setShowRejectDialog(true)}
                  className="text-red-400 hover:bg-gray-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Projects
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={handleExport}
                className="text-gray-300 hover:bg-gray-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-400 hover:bg-gray-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reject Projects</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Provide a reason for rejecting {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none"
              rows={3}
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkReject}
              disabled={!rejectionReason.trim() || isLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading ? 'Rejecting...' : 'Reject Projects'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Projects</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove all selected projects and their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog(false)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete Projects'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 