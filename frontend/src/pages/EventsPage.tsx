import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Eye,
  MessageCircle,
  Award,
  Zap,
  Code,
  Briefcase,
  GraduationCap,
  Building2,
  Globe,
  ChevronDown,
  Heart,
  Share2,
  Loader2,
  X,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Event } from '../types';
import { getEvents, createEvent } from '../services/api';

// Event Creation Modal Component
const EventCreationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}> = ({ isOpen, onClose, onEventCreated }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'workshop' as 'workshop' | 'networking' | 'hackathon' | 'seminar',
    date: '',
    time: '',
    maxAttendees: '',
    imageUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create an event');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.date || !formData.time) {
      setError('Title, description, location, date, and time are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Combine date and time into ISO format
      const eventDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const newEvent = await createEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        organizer: user.company || user.name,
        organizerId: user.id,
        date: eventDateTime,
        location: formData.location.trim(),
        type: formData.type,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        imageUrl: formData.imageUrl.trim() || undefined
      });

      setSuccess(true);
      onEventCreated(newEvent);
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          title: '',
          description: '',
          location: '',
          type: 'workshop',
          date: '',
          time: '',
          maxAttendees: '',
          imageUrl: ''
        });
      }, 1500);
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create New Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {success && (
            <div className="bg-green-600/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-md mb-4 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Event created successfully!</span>
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., React.js Advanced Workshop"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Event Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event, what attendees will learn, and what makes it special..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Event Type and Max Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="workshop">Workshop</option>
                  <option value="networking">Networking</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-300 mb-2">
                  Max Attendees (Optional)
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                  Event Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Online, San Francisco Conference Center, or Zoom Link"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Event Image URL (Optional)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/event-image.jpg"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Created!</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (err) {
        setError('Failed to load events. Please try again.');
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = eventType === 'all' || event.type === eventType;
    
    if (filterBy === 'all') return matchesSearch && matchesType;
    if (filterBy === 'my-events' && user) {
      // Show events organized by the user or events they've joined
      return matchesSearch && matchesType && (event.organizerId === user.id);
    }
    if (filterBy === 'joined') {
      // Mock: assume user has joined some events
      return matchesSearch && matchesType && ['1', '4'].includes(event.id);
    }
    return matchesSearch && matchesType;
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return Code;
      case 'networking': return Users;
      case 'hackathon': return Zap;
      case 'seminar': return GraduationCap;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'networking': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'hackathon': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
      case 'seminar': return 'bg-green-600/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  const getAttendancePercentage = (current: number, max?: number) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const canCreateEvents = user?.role === 'company' || user?.role === 'professional';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-gray-300">
            {user?.role === 'student' && 'Discover workshops, networking events, and learning opportunities'}
            {user?.role === 'professional' && 'Share knowledge, attend events, and grow your network'}
            {user?.role === 'company' && 'Host events, engage with talent, and build your brand'}
          </p>
        </div>
        {canCreateEvents && (
          <Button 
            className="flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, organizers, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  {user && <option value="joined">Joined Events</option>}
                  {canCreateEvents && <option value="my-events">My Events</option>}
                </select>
              </div>

              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="workshop">Workshops</option>
                <option value="networking">Networking</option>
                <option value="hackathon">Hackathons</option>
                <option value="seminar">Seminars</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-sm text-gray-400">This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">1.2K</div>
            <div className="text-sm text-gray-400">Attendees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">45</div>
            <div className="text-sm text-gray-400">Organizers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">4.8</div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const TypeIcon = getEventTypeIcon(event.type);
          const dateInfo = formatDate(event.date);
          const attendancePercentage = getAttendancePercentage(event.currentAttendees, event.maxAttendees);
          
          return (
            <Card key={event.id} hover className="overflow-hidden">
              <div className="aspect-video bg-gray-700 overflow-hidden relative">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <TypeIcon className="h-12 w-12 text-white" />
                  </div>
                )}
                
                {/* Event Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getEventTypeColor(event.type)}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>

                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-gray-800">{dateInfo.date}</div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-3">{event.description}</p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{event.organizer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{dateInfo.full}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{dateInfo.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{event.location}</span>
                      {event.location === 'Online' && (
                        <Globe className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                  </div>

                  {/* Attendance Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        {event.currentAttendees} / {event.maxAttendees} attendees
                      </span>
                      <span className="text-gray-400">{Math.round(attendancePercentage)}% full</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          attendancePercentage > 90 ? 'bg-red-500' :
                          attendancePercentage > 70 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 20) + 5}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Register/Join Button */}
                  <div className="pt-2">
                    {attendancePercentage >= 100 ? (
                      <Button variant="outline" className="w-full" disabled>
                        Event Full
                      </Button>
                    ) : (
                      <Button className="w-full">
                        {user?.role === 'company' && event.organizerId === user.id ? 'Manage Event' : 'Register Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
                <p className="text-gray-300">
                  {searchTerm
                    ? `No events match your search for "${searchTerm}"`
                    : 'No events available at the moment'
                  }
                </p>
              </div>
              {!searchTerm && canCreateEvents && (
                <Button 
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Event Modal */}
      <EventCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={(newEvent) => setEvents(prev => [newEvent, ...prev])}
      />
    </div>
  );
};

export default EventsPage;