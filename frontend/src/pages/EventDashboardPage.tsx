import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  MapPin,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  UtensilsCrossed,
  RefreshCw,
  Filter,
  Search,
  Badge
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { 
  getEventDashboard, 
  getEventAttendeesForOrganizer, 
  manageAttendeeStatus, 
  checkInAttendee,
  bulkApproveAttendees,
  exportAttendeeList,
  getFoodAndDrinksReport
} from '../services/api';
import { EventDashboard as EventDashboardType, EventAttendee, AttendeeStatus, FoodAndDrinksReport } from '../types';

const EventDashboardPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [dashboard, setDashboard] = useState<EventDashboardType | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [foodReport, setFoodReport] = useState<FoodAndDrinksReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<AttendeeStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFoodReport, setShowFoodReport] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchDashboardData();
    }
  }, [eventId]);

  const fetchDashboardData = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const [dashboardData, attendeesData, foodData] = await Promise.all([
        getEventDashboard(eventId),
        getEventAttendeesForOrganizer(eventId),
        getFoodAndDrinksReport(eventId).catch(() => null)
      ]);
      
      setDashboard(dashboardData);
      setAttendees(attendeesData.attendees);
      setFoodReport(foodData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (attendeeId: string, newStatus: AttendeeStatus) => {
    if (!eventId) return;
    
    try {
      await manageAttendeeStatus(eventId, attendeeId, newStatus);
      await fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendee status');
    }
  };

  const handleCheckIn = async (attendeeId: string) => {
    if (!eventId) return;
    
    try {
      await checkInAttendee(eventId, attendeeId);
      await fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in attendee');
    }
  };

  const handleBulkApprove = async () => {
    if (!eventId || selectedAttendees.length === 0) return;
    
    try {
      const result = await bulkApproveAttendees(eventId, selectedAttendees);
      setSelectedAttendees([]);
      await fetchDashboardData();
      
      if (result.failed > 0) {
        setError(`Approved ${result.successful} attendees, ${result.failed} failed`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk approve attendees');
    }
  };

  const handleExportAttendees = async () => {
    if (!eventId) return;
    
    try {
      const exportData = await exportAttendeeList(eventId);
      
      const headers = Object.keys(exportData.attendees[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.attendees.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-attendees-${eventId}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export attendee list');
    }
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesStatus = statusFilter === 'ALL' || attendee.status === statusFilter;
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (attendee.email && attendee.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: AttendeeStatus) => {
    switch (status) {
      case 'APPROVED': return 'text-green-400 bg-green-400/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/20';
      case 'DECLINED': return 'text-red-400 bg-red-400/20';
      case 'WAITLIST': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: AttendeeStatus) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'DECLINED': return <XCircle className="h-4 w-4" />;
      case 'WAITLIST': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading event dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/events')} variant="outline">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Dashboard data not available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{dashboard.event.title}</h1>
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(dashboard.event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{dashboard.event.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge className="h-4 w-4" />
                <span className="capitalize">{dashboard.event.type.toLowerCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowFoodReport(!showFoodReport)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>Food & Drinks</span>
            </Button>
            <Button
              onClick={handleExportAttendees}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={() => navigate(`/events/${eventId}`)}
              variant="outline"
            >
              View Event
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Attendees</p>
                  <p className="text-2xl font-bold text-white">{dashboard.attendeeStats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{dashboard.attendeeStats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{dashboard.attendeeStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Checked In</p>
                  <p className="text-2xl font-bold text-purple-400">{dashboard.attendeeStats.checkedIn}</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Food & Drinks Report */}
        {showFoodReport && foodReport && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <UtensilsCrossed className="h-5 w-5" />
                <span>Food & Drinks Report</span>
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400">Food Provided</p>
                  <p className="text-lg font-semibold text-white">
                    {foodReport.foodProvided ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Drinks Provided</p>
                  <p className="text-lg font-semibold text-white">
                    {foodReport.drinksProvided ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Alcoholic Beverages</p>
                  <p className="text-lg font-semibold text-white">
                    {foodReport.alcoholicBeverages ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Special Diets</p>
                  <p className="text-lg font-semibold text-white">
                    {Object.keys(foodReport.dietaryRestrictions).length}
                  </p>
                </div>
              </div>

              {Object.keys(foodReport.dietaryRestrictions).length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Dietary Restrictions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(foodReport.dietaryRestrictions).map(([restriction, count]) => (
                      <span
                        key={restriction}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                      >
                        {restriction}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Attendee Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Attendee Management</h3>
              <div className="flex items-center space-x-3">
                {selectedAttendees.length > 0 && (
                  <Button
                    onClick={handleBulkApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Selected ({selectedAttendees.length})
                  </Button>
                )}
                <Button onClick={fetchDashboardData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AttendeeStatus | 'ALL')}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="DECLINED">Declined</option>
                  <option value="WAITLIST">Waitlist</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white flex-1 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAttendees(filteredAttendees.map(a => a.id));
                          } else {
                            setSelectedAttendees([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Attendee</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Registered</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Check-in</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b border-gray-700/50 hover:bg-gray-800/50">
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.includes(attendee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttendees([...selectedAttendees, attendee.id]);
                            } else {
                              setSelectedAttendees(selectedAttendees.filter(id => id !== attendee.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {attendee.avatar && (
                            <img
                              src={attendee.avatar}
                              alt={attendee.name}
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="text-white font-medium">{attendee.name}</p>
                            <p className="text-gray-400 text-sm">{attendee.email}</p>
                            {attendee.company && (
                              <p className="text-gray-500 text-xs">{attendee.company}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                          {getStatusIcon(attendee.status)}
                          <span className="ml-1 capitalize">{attendee.status.toLowerCase()}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {new Date(attendee.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {attendee.status === 'APPROVED' && (
                          <div className="flex items-center space-x-2">
                            {attendee.checkedIn ? (
                              <span className="text-green-400 text-sm">✓ Checked In</span>
                            ) : (
                              <Button
                                onClick={() => handleCheckIn(attendee.id)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Check In
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {attendee.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => handleStatusChange(attendee.id, 'APPROVED')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(attendee.id, 'DECLINED')}
                                size="sm"
                                variant="outline"
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {attendee.status === 'APPROVED' && (
                            <Button
                              onClick={() => handleStatusChange(attendee.id, 'WAITLIST')}
                              size="sm"
                              variant="outline"
                            >
                              Move to Waitlist
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAttendees.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No attendees found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDashboardPage; 