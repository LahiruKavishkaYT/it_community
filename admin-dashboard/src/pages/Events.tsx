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
  Play,
  Download,
  BarChart3,
  Send,
  CheckSquare,
  Square,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  Settings,
  UserCheck,
  UserX,
  Mail,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
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

  // Fetch event analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['event-analytics'],
    queryFn: () => eventAPI.getEventAnalytics(),
    enabled: hasPermission && hasPermission('content.read'),
    staleTime: 10 * 60 * 1000,
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

  // Approve event mutation
  const approveEventMutation = useMutation({
    mutationFn: ({ eventId, notes }: { eventId: string; notes?: string }) => 
      eventAPI.approveEvent(eventId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsApprovalDialogOpen(false);
      setApprovalNotes("");
      setApprovalAction(null);
      toast({
        title: "Success",
        description: "Event has been approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve event",
        variant: "destructive",
      });
    }
  });

  // Reject event mutation
  const rejectEventMutation = useMutation({
    mutationFn: ({ eventId, reason }: { eventId: string; reason: string }) => 
      eventAPI.rejectEvent(eventId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsApprovalDialogOpen(false);
      setApprovalNotes("");
      setApprovalAction(null);
      toast({
        title: "Success",
        description: "Event has been rejected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject event",
        variant: "destructive",
      });
    }
  });

  // Bulk operations mutation
  const bulkOperationsMutation = useMutation({
    mutationFn: ({ action, eventIds }: { action: string; eventIds: string[] }) => {
      switch (action) {
        case 'delete':
          return Promise.all(eventIds.map(id => eventAPI.deleteEvent(id)));
        case 'approve':
          return Promise.all(eventIds.map(id => eventAPI.approveEvent(id)));
        case 'reject':
          return Promise.all(eventIds.map(id => eventAPI.rejectEvent(id, 'Bulk rejection')));
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvents([]);
      toast({
        title: "Success",
        description: `Bulk ${action} completed successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to perform bulk operation",
        variant: "destructive",
      });
    }
  });

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    await deleteEventMutation.mutateAsync(selectedEvent.id);
  };

  const handleApprovalAction = async () => {
    if (!selectedEvent || !approvalAction) return;
    
    if (approvalAction === 'approve') {
      await approveEventMutation.mutateAsync({ 
        eventId: selectedEvent.id, 
        notes: approvalNotes 
      });
    } else {
      await rejectEventMutation.mutateAsync({ 
        eventId: selectedEvent.id, 
        reason: approvalNotes 
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEvents.length === 0) {
      toast({
        title: "Warning",
        description: "Please select events to perform bulk operation",
        variant: "destructive",
      });
      return;
    }
    
    await bulkOperationsMutation.mutateAsync({ action, eventIds: selectedEvents });
  };

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, eventId]);
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(eventsData?.events.map(e => e.id) || []);
    } else {
      setSelectedEvents([]);
    }
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
                <p className="text-red-200 mb-4">There was an error loading the events data.</p>
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
            <h1 className="text-3xl font-bold text-white">Event Management</h1>
            <p className="text-gray-400 mt-1">Manage and moderate community events</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Advanced Filters
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-900/20 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Total Events</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.overview.totalEvents}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-900/20 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Published</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.overview.publishedEvents}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-900/20 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.overview.draftEvents}</p>
                  </div>
                  <Pause className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-900/20 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Total Attendees</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.overview.totalAttendees}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="NETWORKING">Networking</SelectItem>
                    <SelectItem value="HACKATHON">Hackathon</SelectItem>
                    <SelectItem value="SEMINAR">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showAdvancedFilters}>
              <CollapsibleContent className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        placeholder="From"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Input
                        type="date"
                        placeholder="To"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
                    <Input
                      placeholder="Filter by location"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Organizer</label>
                    <Input
                      placeholder="Filter by organizer"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedEvents.length > 0 && (
          <Card className="bg-blue-900/20 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-blue-300">
                    {selectedEvents.length} event(s) selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEvents([])}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    disabled={bulkOperationsMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                    disabled={bulkOperationsMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkOperationsMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData?.events.map((event) => {
              const StatusIcon = EVENT_STATUS_ICONS[event.status as keyof typeof EVENT_STATUS_ICONS];
              const isSelected = selectedEvents.includes(event.id);
              
              return (
                <Card key={event.id} className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-6">
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                        />
                        <Badge className={EVENT_TYPE_COLORS[event.type as keyof typeof EVENT_TYPE_COLORS]}>
                          {event.type}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {event.status === 'DRAFT' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setApprovalAction('approve');
                                  setIsApprovalDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setApprovalAction('reject');
                                  setIsApprovalDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Event Title and Description */}
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {event.currentAttendees || 0}
                          {event.maxAttendees && ` / ${event.maxAttendees}`}
                        </span>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(event.organizer?.name || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">
                        {event.organizer?.name || 'Unknown Organizer'}
                      </span>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4 text-gray-400" />
                        <Badge className={EVENT_STATUS_COLORS[event.status as keyof typeof EVENT_STATUS_COLORS]}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {eventsData && eventsData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, eventsData.total)} of {eventsData.total} events
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-300">
                Page {page} of {eventsData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === eventsData.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        event={editingEvent}
        mode={editingEvent ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Dialog */}
      <AlertDialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {approvalAction === 'approve' ? 'Approve Event' : 'Reject Event'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {approvalAction === 'approve' 
                ? `Are you sure you want to approve "${selectedEvent?.title}"?`
                : `Are you sure you want to reject "${selectedEvent?.title}"?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {approvalAction === 'approve' ? 'Notes (optional)' : 'Reason (required)'}
            </label>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder={approvalAction === 'approve' ? 'Add approval notes...' : 'Enter rejection reason...'}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovalAction}
              className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={
                (approvalAction === 'reject' && !approvalNotes.trim()) ||
                approveEventMutation.isPending ||
                rejectEventMutation.isPending
              }
            >
              {approveEventMutation.isPending || rejectEventMutation.isPending 
                ? (approvalAction === 'approve' ? 'Approving...' : 'Rejecting...')
                : (approvalAction === 'approve' ? 'Approve' : 'Reject')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Event Analytics</DialogTitle>
            <DialogDescription className="text-gray-300">
              Detailed analytics and insights about events
            </DialogDescription>
          </DialogHeader>
          {analyticsData && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Events by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.eventsByType?.map((item) => (
                        <div key={item.type} className="flex justify-between items-center py-2">
                          <span className="text-gray-300">{item.type}</span>
                          <Badge>{item.count}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Events by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.eventsByStatus?.map((item) => (
                        <div key={item.status} className="flex justify-between items-center py-2">
                          <span className="text-gray-300">{item.status}</span>
                          <Badge>{item.count}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="trends" className="space-y-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Recent Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.recentEvents?.map((event) => (
                      <div key={event.id} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-gray-300 text-sm">{event.organizer}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={EVENT_STATUS_COLORS[event.status as keyof typeof EVENT_STATUS_COLORS]}>
                            {event.status}
                          </Badge>
                          <p className="text-gray-300 text-sm mt-1">{event.attendeeCount} attendees</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="details" className="space-y-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Summary Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300 text-sm">Total Events</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.overview.totalEvents}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Total Attendees</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.overview.totalAttendees}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Average Attendees</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.overview.averageAttendeesPerEvent}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Unique Organizers</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.overview.uniqueOrganizers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Events;
