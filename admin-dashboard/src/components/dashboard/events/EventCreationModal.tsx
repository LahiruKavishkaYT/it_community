import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Clock,
  Save,
  Loader2,
  Upload,
  Image,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  type: 'WORKSHOP' | 'HACKATHON' | 'NETWORKING' | 'SEMINAR' | 'RECRUITMENT_DRIVE';
  description: string;
  imageFile: File | null;
  imageUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationType: 'ONSITE' | 'VIRTUAL';
  venue: string;
  virtualEventLink: string;
  registrationDeadlineDate: string;
  registrationDeadlineTime: string;
  foodAndDrinksProvided: boolean;
  maxAttendees: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const EVENT_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'RECRUITMENT_DRIVE', label: 'Recruitment Drive' },
];

export const EventCreationModal = ({ 
  isOpen, 
  onClose, 
  event, 
  mode 
}: EventCreationModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    type: event?.type || 'WORKSHOP',
    description: event?.description || '',
    imageFile: null,
    imageUrl: event?.imageUrl || '',
    startDate: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    startTime: event?.date ? new Date(event.date).toTimeString().slice(0, 5) : '',
    endDate: event?.endDateTime ? new Date(event.endDateTime).toISOString().split('T')[0] : '',
    endTime: event?.endDateTime ? new Date(event.endDateTime).toTimeString().slice(0, 5) : '',
    locationType: event?.isVirtual ? 'VIRTUAL' : 'ONSITE',
    venue: event?.venue || '',
    virtualEventLink: event?.virtualEventLink || '',
    registrationDeadlineDate: event?.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : '',
    registrationDeadlineTime: event?.registrationDeadline ? new Date(event.registrationDeadline).toTimeString().slice(0, 5) : '',
    foodAndDrinksProvided: event?.foodAndDrinksProvided || false,
    maxAttendees: event?.maxAttendees?.toString() || '',
    status: event?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(event?.imageUrl || null);
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
          type: data.type,
          description: data.description,
          imageUrl: data.imageUrl || previewImage || undefined,
          startDateTime: new Date(`${data.startDate}T${data.startTime}`).toISOString(),
          endDateTime: data.endDate && data.endTime ? new Date(`${data.endDate}T${data.endTime}`).toISOString() : undefined,
          locationType: data.locationType,
          venue: data.venue,
          virtualEventLink: data.virtualEventLink,
          registrationDeadline: new Date(`${data.registrationDeadlineDate}T${data.registrationDeadlineTime}`).toISOString(),
          foodAndDrinksProvided: data.foodAndDrinksProvided,
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
          ...data,
          startDateTime: new Date(`${data.startDate}T${data.startTime}`).toISOString(),
          endDateTime: data.endDate && data.endTime ? new Date(`${data.endDate}T${data.endTime}`).toISOString() : undefined,
          registrationDeadline: new Date(`${data.registrationDeadlineDate}T${data.registrationDeadlineTime}`).toISOString(),
          maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : undefined,
          imageUrl: data.imageUrl || previewImage || undefined,
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
      newErrors.title = 'Event title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!previewImage && !formData.imageUrl) {
      newErrors.imageUrl = 'Event banner is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    // Validate end time is after start time
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'End time must be after start time';
      }
    }

    // Validate future start time
    if (formData.startDate && formData.startTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      if (startDateTime <= new Date()) {
        newErrors.startDate = 'Event must be scheduled in the future';
      }
    }

    if (!formData.locationType) {
      newErrors.locationType = 'Location type is required';
    }

    if (formData.locationType === 'ONSITE' && !formData.venue.trim()) {
      newErrors.venue = 'Venue is required for on-site events';
    }

    if (formData.locationType === 'VIRTUAL' && !formData.virtualEventLink.trim()) {
      newErrors.virtualEventLink = 'Virtual event link is required for virtual events';
    }

    if (!formData.registrationDeadlineDate) {
      newErrors.registrationDeadlineDate = 'Registration deadline date is required';
    }

    if (!formData.registrationDeadlineTime) {
      newErrors.registrationDeadlineTime = 'Registration deadline time is required';
    }

    // Validate registration deadline is before event start time
    if (formData.registrationDeadlineDate && formData.registrationDeadlineTime && formData.startDate && formData.startTime) {
      const registrationDeadline = new Date(`${formData.registrationDeadlineDate}T${formData.registrationDeadlineTime}`);
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      
      if (registrationDeadline >= startDateTime) {
        newErrors.registrationDeadlineDate = 'Registration deadline must be before event start time';
      }
    }

    if (formData.maxAttendees && parseInt(formData.maxAttendees) <= 0) {
      newErrors.maxAttendees = 'Maximum attendees must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Clear URL field since we're using file upload
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
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
      type: 'WORKSHOP',
      description: '',
      imageFile: null,
      imageUrl: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      locationType: 'ONSITE',
      venue: '',
      virtualEventLink: '',
      registrationDeadlineDate: '',
      registrationDeadlineTime: '',
      foodAndDrinksProvided: false,
      maxAttendees: '',
      status: 'DRAFT',
    });
    setErrors({});
    setPreviewImage(null);
    onClose();
  };

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
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
          {/* Event Title */}
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

          {/* Event Type */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-gray-300">
              Event Type *
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
            {errors.type && (
              <p className="text-red-400 text-xs mt-1">{errors.type}</p>
            )}
          </div>

          {/* Event Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Event Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your event, what attendees will learn, agenda, and any special requirements..."
              rows={6}
              className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Event Banner */}
          <div>
            <Label className="text-sm font-medium text-gray-300">
              Event Banner *
            </Label>
            <div className="mt-2 space-y-4">
              {/* File Upload */}
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewImage ? (
                  <div className="space-y-2">
                    <img 
                      src={previewImage} 
                      alt="Event banner preview" 
                      className="max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                        setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-gray-300">Click to upload event banner</p>
                      <p className="text-xs text-gray-500">Recommended: 16:9 aspect ratio (1920x1080px)</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* URL Input Alternative */}
              <div className="text-center text-gray-400 text-sm">or</div>
              <div>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleInputChange('imageUrl', e.target.value);
                    if (e.target.value) {
                      setPreviewImage(e.target.value);
                      setFormData(prev => ({ ...prev, imageFile: null }));
                    }
                  }}
                  placeholder="Enter image URL"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            {errors.imageUrl && (
              <p className="text-red-400 text-xs mt-1">{errors.imageUrl}</p>
            )}
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-300">
                Event Start Date *
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.startDate && (
                <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startTime" className="text-sm font-medium text-gray-300">
                Event Start Time *
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.startTime && (
                <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>
              )}
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-300">
                Event End Date *
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.endDate && (
                <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime" className="text-sm font-medium text-gray-300">
                Event End Time *
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.endTime && (
                <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Location Type */}
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-3 block">
              Location Type *
            </Label>
            <RadioGroup 
              value={formData.locationType} 
              onValueChange={(value) => handleInputChange('locationType', value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg hover:border-gray-500">
                <RadioGroupItem value="ONSITE" id="onsite" className="text-blue-400" />
                <Label htmlFor="onsite" className="text-gray-300 cursor-pointer flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>On-site</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg hover:border-gray-500">
                <RadioGroupItem value="VIRTUAL" id="virtual" className="text-blue-400" />
                <Label htmlFor="virtual" className="text-gray-300 cursor-pointer flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>Virtual</span>
                </Label>
              </div>
            </RadioGroup>
            {errors.locationType && (
              <p className="text-red-400 text-xs mt-1">{errors.locationType}</p>
            )}
          </div>

          {/* Venue / Address (shown only if on-site) */}
          {formData.locationType === 'ONSITE' && (
            <div>
              <Label htmlFor="venue" className="text-sm font-medium text-gray-300">
                Venue / Address *
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="Enter venue name and address"
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              {errors.venue && (
                <p className="text-red-400 text-xs mt-1">{errors.venue}</p>
              )}
            </div>
          )}

          {/* Virtual Event Link (shown only if virtual) */}
          {formData.locationType === 'VIRTUAL' && (
            <div>
              <Label htmlFor="virtualEventLink" className="text-sm font-medium text-gray-300">
                Virtual Event Link *
              </Label>
              <div className="relative mt-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="virtualEventLink"
                  type="url"
                  value={formData.virtualEventLink}
                  onChange={(e) => handleInputChange('virtualEventLink', e.target.value)}
                  placeholder="e.g., Zoom, Google Meet link"
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              {errors.virtualEventLink && (
                <p className="text-red-400 text-xs mt-1">{errors.virtualEventLink}</p>
              )}
            </div>
          )}

          {/* Registration Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationDeadlineDate" className="text-sm font-medium text-gray-300">
                Registration Deadline Date *
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="registrationDeadlineDate"
                  type="date"
                  value={formData.registrationDeadlineDate}
                  onChange={(e) => handleInputChange('registrationDeadlineDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={formData.startDate}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.registrationDeadlineDate && (
                <p className="text-red-400 text-xs mt-1">{errors.registrationDeadlineDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationDeadlineTime" className="text-sm font-medium text-gray-300">
                Registration Deadline Time *
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="registrationDeadlineTime"
                  type="time"
                  value={formData.registrationDeadlineTime}
                  onChange={(e) => handleInputChange('registrationDeadlineTime', e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              {errors.registrationDeadlineTime && (
                <p className="text-red-400 text-xs mt-1">{errors.registrationDeadlineTime}</p>
              )}
            </div>
          </div>

          {/* Food & Drinks Coordination */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="foodAndDrinksProvided"
              checked={formData.foodAndDrinksProvided}
              onCheckedChange={(checked) => handleInputChange('foodAndDrinksProvided', checked)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor="foodAndDrinksProvided" className="text-sm text-gray-300 cursor-pointer">
              Food and/or drinks will be provided
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            If checked, dietary information may be requested from attendees during registration.
          </p>

          {/* Additional Settings */}
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

          {/* Submit Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={eventMutation.isPending}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={eventMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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