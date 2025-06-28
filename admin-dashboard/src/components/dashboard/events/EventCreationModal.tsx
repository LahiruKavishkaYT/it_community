import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Clock,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  mode: 'create' | 'edit';
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'WORKSHOP' | 'NETWORKING' | 'HACKATHON' | 'SEMINAR';
  maxAttendees: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const EVENT_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'SEMINAR', label: 'Seminar' },
];

export const EventCreationModal = ({ 
  isOpen, 
  onClose, 
  event, 
  mode 
}: EventCreationModalProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    time: event?.date ? new Date(event.date).toTimeString().slice(0, 5) : '',
    location: event?.location || '',
    type: event?.type || 'WORKSHOP',
    maxAttendees: event?.maxAttendees?.toString() || '',
    status: event?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const queryClient = useQueryClient();

  // Mock mutation for creating/updating events
  const eventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mode === 'create') {
        return {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          date: new Date(`${data.date}T${data.time}`).toISOString(),
          location: data.location,
          type: data.type,
          maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : undefined,
          status: data.status,
          organizer: {
            id: '1',
            name: 'Admin User',
            email: 'admin@itcommunity.com'
          },
          currentAttendees: 0,
          createdAt: new Date().toISOString(),
        };
      } else {
        return {
          ...event,
          title: data.title,
          description: data.description,
          date: new Date(`${data.date}T${data.time}`).toISOString(),
          location: data.location,
          type: data.type,
          maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : undefined,
          status: data.status,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: `Event ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${mode} event`,
        variant: "destructive",
      });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.maxAttendees && parseInt(formData.maxAttendees) <= 0) {
      newErrors.maxAttendees = 'Maximum attendees must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await eventMutation.mutateAsync(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'WORKSHOP',
      maxAttendees: '',
      status: 'DRAFT',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'create' 
              ? 'Fill in the details below to create a new community event.'
              : 'Update the event information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={4}
                className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-300">
                Date *
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.date && (
                <p className="text-red-400 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium text-gray-300">
                Time *
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.time && (
                <p className="text-red-400 text-xs mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-300">
                Location *
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              {errors.location && (
                <p className="text-red-400 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium text-gray-300">
                Event Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="mt-1 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-gray-300">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Capacity and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxAttendees" className="text-sm font-medium text-gray-300">
                Maximum Attendees
              </Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              {errors.maxAttendees && (
                <p className="text-red-400 text-xs mt-1">{errors.maxAttendees}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-300">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="mt-1 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="DRAFT" className="text-gray-300">Draft</SelectItem>
                  <SelectItem value="PUBLISHED" className="text-gray-300">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={eventMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={eventMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {eventMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Event' : 'Update Event'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 