import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  MapPin, 
  FileText, 
  Briefcase,
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
import { Job } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
  mode: 'create' | 'edit';
}

interface JobFormData {
  title: string;
  description: string;
  companyName: string;
  companyEmail: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  status: 'DRAFT' | 'PUBLISHED';
}

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
];

export const JobCreationModal = ({ 
  isOpen, 
  onClose, 
  job, 
  mode 
}: JobCreationModalProps) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: job?.title || '',
    description: job?.description || '',
    companyName: job?.company.name || '',
    companyEmail: job?.company.email || '',
    location: job?.location || '',
    type: job?.type || 'FULL_TIME',
    status: job?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  });

  const [errors, setErrors] = useState<Partial<JobFormData>>({});
  const queryClient = useQueryClient();

  // Mock mutation for creating/updating jobs
  const jobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mode === 'create') {
        return {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          company: {
            id: Date.now().toString(),
            name: data.companyName,
            email: data.companyEmail,
          },
          type: data.type,
          location: data.location,
          postedAt: new Date().toISOString(),
          applicationsCount: 0,
          status: data.status,
        };
      } else {
        return {
          ...job,
          title: data.title,
          description: data.description,
          company: {
            id: job?.company.id || Date.now().toString(),
            name: data.companyName,
            email: data.companyEmail,
          },
          type: data.type,
          location: data.location,
          status: data.status,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Success",
        description: `Job ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${mode} job`,
        variant: "destructive",
      });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<JobFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await jobMutation.mutateAsync(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      companyName: '',
      companyEmail: '',
      location: '',
      type: 'FULL_TIME',
      status: 'DRAFT',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
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
            {mode === 'create' ? 'Post New Job' : 'Edit Job'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'create' 
              ? 'Fill in the details below to post a new job opportunity.'
              : 'Update the job information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                Job Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter job title"
                className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                Job Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
                rows={4}
                className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-300">
                Company Name *
              </Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              {errors.companyName && (
                <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyEmail" className="text-sm font-medium text-gray-300">
                Company Email *
              </Label>
              <Input
                id="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                placeholder="Enter company email"
                className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.companyEmail && (
                <p className="text-red-400 text-xs mt-1">{errors.companyEmail}</p>
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
                  placeholder="Enter job location"
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              {errors.location && (
                <p className="text-red-400 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium text-gray-300">
                Job Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="mt-1 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-gray-300">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
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

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={jobMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={jobMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {jobMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Post Job' : 'Update Job'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 