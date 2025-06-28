import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, MoreHorizontal, Shield, Mail, Calendar, Loader2, RefreshCw, UserX, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { userAPI, User, analyticsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const ROLES = ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] as const;

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-red-600 text-white";
    case "COMPANY":
      return "bg-purple-600 text-white";
    case "PROFESSIONAL":
      return "bg-blue-600 text-white";
    case "STUDENT":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-600 text-white";
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

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // Fetch users with filters
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users', { search: searchTerm, role: roleFilter, page }],
    queryFn: () => userAPI.getUsers({
      search: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      page,
      limit: 10
    }),
    enabled: hasPermission('users.read'),
  });

  // Fetch user analytics for stats cards
  const { data: analytics } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: () => analyticsAPI.getUserAnalytics(),
    enabled: hasPermission('analytics.read'),
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userAPI.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-analytics'] });
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: (userId: string) => userAPI.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-analytics'] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!hasPermission('users.update')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update user roles",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!hasPermission('users.suspend')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to suspend users",
        variant: "destructive",
      });
      return;
    }

    try {
      await suspendUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !hasPermission('users.delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete users",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'suspended':
        return 'bg-yellow-600 text-white';
      case 'deleted':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (!hasPermission('users.read')) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400">You don't have permission to view user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => refetchUsers()}
            disabled={usersLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission('users.create') && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {analytics?.byRole?.ADMIN || 0}
                </p>
                <p className="text-gray-400">Admin Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {analytics?.byRole?.COMPANY || 0}
                </p>
                <p className="text-gray-400">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {analytics?.byRole?.PROFESSIONAL || 0}
                </p>
                <p className="text-gray-400">Professionals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {analytics?.byRole?.STUDENT || 0}
                </p>
                <p className="text-gray-400">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-white">
              Users ({usersData?.total || 0})
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-400">Loading users...</span>
            </div>
          ) : usersError ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Failed to load users</p>
              <Button onClick={() => refetchUsers()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : !usersData?.users?.length ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Join Date</TableHead>
                  <TableHead className="text-gray-300">Last Active</TableHead>
                  <TableHead className="text-gray-300">Projects</TableHead>
                  <TableHead className="text-gray-300">Events</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.users.map((user) => (
                  <TableRow key={user.id} className="border-gray-700">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          {user.company && (
                            <div className="text-xs text-gray-500">{user.company}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                        disabled={!hasPermission('users.update') || updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {formatDate(user.joinDate)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.lastActive}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.projects}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.events}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700" align="end">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem 
                            className="text-gray-300 hover:bg-gray-700"
                            disabled={!hasPermission('users.read')}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          {user.status !== 'suspended' && (
                            <DropdownMenuItem 
                              className="text-yellow-400 hover:bg-gray-700"
                              onClick={() => handleSuspendUser(user.id)}
                              disabled={!hasPermission('users.suspend') || suspendUserMutation.isPending}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-gray-700"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={!hasPermission('users.delete')}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {usersData && usersData.total > 10 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-gray-400 text-sm">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, usersData.total)} of {usersData.total} users
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * 10 >= usersData.total}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
