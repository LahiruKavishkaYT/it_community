import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserX, 
  Trash2, 
  Users, 
  ShieldCheck,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface BulkActionsBarProps {
  selectedUserIds: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => void;
}

export const BulkActionsBar = ({ 
  selectedUserIds, 
  onClearSelection, 
  onBulkAction 
}: BulkActionsBarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [newRole, setNewRole] = useState("");

  if (selectedUserIds.length === 0) return null;

  const handleBulkRoleChange = () => {
    if (!newRole) {
      toast({
        title: "No Role Selected",
        description: "Please select a role to assign",
        variant: "destructive",
      });
      return;
    }

    onBulkAction('changeRole', { role: newRole });
    setNewRole("");
    onClearSelection();
    
    toast({
      title: "Roles Updated",
      description: `Updated role for ${selectedUserIds.length} users`,
    });
  };

  const handleBulkSuspend = () => {
    onBulkAction('suspend');
    setShowSuspendDialog(false);
    onClearSelection();
    
    toast({
      title: "Users Suspended",
      description: `Suspended ${selectedUserIds.length} users`,
    });
  };

  const handleBulkDelete = () => {
    onBulkAction('delete');
    setShowDeleteDialog(false);
    onClearSelection();
    
    toast({
      title: "Users Deleted",
      description: `Deleted ${selectedUserIds.length} users`,
    });
  };

  return (
    <>
      <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">
                {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Change role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleBulkRoleChange}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newRole}
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                Apply Role
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowSuspendDialog(true)}
              size="sm"
              variant="outline"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
            >
              <UserX className="h-4 w-4 mr-1" />
              Suspend
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              size="sm"
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            
            <Button
              onClick={onClearSelection}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Suspend Users</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to suspend {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''}? 
              This will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkSuspend}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Suspend Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Users</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to permanently delete {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 