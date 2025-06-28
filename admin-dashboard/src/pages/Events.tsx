import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Calendar,
  MapPin,
  Users,
  Clock,
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
  Play
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
import { eventAPI, Event } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCreationModal } from "@/components/dashboard/events/EventCreationModal";

const EVENT_TYPE_COLORS = {
  WORKSHOP: "bg-blue-600 text-white",
  NETWORKING: "bg-green-600 text-white",
  HACKATHON: "bg-purple-600 text-white",
  SEMINAR: "bg-orange-600 text-white",
};

const EVENT_STATUS_COLORS = {
  DRAFT: "bg-gray-600 text-white",
  PUBLISHED: "bg-green-600 text-white",
  CANCELLED: "bg-red-600 text-white",
  COMPLETED: "bg-blue-600 text-white",
};

const EVENT_STATUS_ICONS = {
  DRAFT: Pause,
  PUBLISHED: Play,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
};

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // Fetch events with filters
  const { 
    data: eventsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['events', { search: searchTerm, status: statusFilter, type: typeFilter, page }],
    queryFn: () => eventAPI.getEvents({
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

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventAPI.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  });

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    await deleteEventMutation.mutateAsync(selectedEvent.id);
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

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else {
      return `In ${diffDays} days`;
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

  const getAttendancePercentage = (current: number, max?: number) => {
    if (!max) return 0;
    return Math.round((current / max) * 100);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Event Management</h1>
          </div>
          <Card className="bg-red-900/20 border-red-500/20">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Events</h3>
                <p className="text-red-400 mb-4">There was an error loading the events data.</p>
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
            <h1 className="text-3xl font-bold text-white">Event Management</h1>
            <p className="text-gray-400 mt-1">Manage community events and activities</p>
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
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-800 to-blue-900/20 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Total Events</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">{eventsData?.total || 0}</span>
                <span className="text-xs text-green-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-green-900/20 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Active Events</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  {eventsData?.events?.filter(e => e.status === 'PUBLISHED').length || 0}
                </span>
                <span className="text-xs text-green-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-purple-900/20 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Upcoming</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  {eventsData?.events?.filter(e => 
                    e.status === 'PUBLISHED' && new Date(e.date) > new Date()
                  ).length || 0}
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
                <CheckCircle className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-gray-400">Completed</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  {eventsData?.events?.filter(e => e.status === 'COMPLETED').length || 0}
                </span>
                <span className="text-xs text-green-400 ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5%
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
                  placeholder="Search events, organizers, or locations..."
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
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                  <SelectItem value="HACKATHON">Hackathon</SelectItem>
                  <SelectItem value="SEMINAR">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
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
            {eventsData?.events?.map((event) => {
              const StatusIcon = EVENT_STATUS_ICONS[event.status];
              const attendancePercentage = getAttendancePercentage(event.currentAttendees, event.maxAttendees);
              
              return (
                <Card key={event.id} className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/20">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white line-clamp-2">{event.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={EVENT_TYPE_COLORS[event.type]}>
                            {event.type}
                          </Badge>
                          <Badge className={EVENT_STATUS_COLORS[event.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {event.status}
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
                              setEditingEvent(event);
                              setIsCreateModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{formatDate(event.date)}</span>
                        <span className="text-gray-500">({formatRelativeDate(event.date)})</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300 line-clamp-1">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">
                          {event.currentAttendees}/{event.maxAttendees || '∞'} attendees
                        </span>
                        {event.maxAttendees && (
                          <span className={`text-xs ${getAttendanceColor(attendancePercentage)}`}>
                            ({attendancePercentage}%)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                          {getInitials(event.organizer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-400">{event.organizer.name}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && eventsData?.events?.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No Events Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first event.'
                  }
                </p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEvent}
                disabled={deleteEventMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Event Creation/Edit Modal */}
        <EventCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingEvent(null);
          }}
          event={editingEvent}
          mode={editingEvent ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
};

export default Events;
