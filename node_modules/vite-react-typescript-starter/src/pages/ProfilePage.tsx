import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateProfile, 
  getUserStats, 
  getUserActivity, 
  getProfileCompletion, 
  changePassword, 
  updateUserSettings 
} from '../services/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  Edit3,
  Save,
  X,
  Camera,
  Award,
  Calendar,
  Briefcase,
  Loader2,
  Plus,
  Settings,
  Shield,
  Bell,
  Eye,
  Github,
  Linkedin,
  Twitter,
  Globe,
  CheckCircle,
  AlertCircle,
  Phone,
  Clock,
  TrendingUp,
  BookOpen,
  Star,
  Target,
  Zap,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { UserStats, UserActivity, ProfileCompletion, UserSettings } from '../types';

// Profile Completion Component
const ProfileCompletionWidget: React.FC<{ 
  completion: ProfileCompletion | null;
  isLoading: boolean;
}> = ({ completion, isLoading }) => {
  if (isLoading || !completion) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-600 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { completionPercentage, missingFields } = completion;
  const isComplete = completionPercentage === 100;

  return (
    <Card className={isComplete ? 'border-green-500/30' : 'border-yellow-500/30'}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-400" />
            Profile Completion
          </h3>
          {isComplete && <CheckCircle className="h-5 w-5 text-green-400" />}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">{completionPercentage}% Complete</span>
            <span className="text-gray-400">{completion.completedFields}/{completion.totalFields} fields</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isComplete ? 'bg-green-500' : completionPercentage > 70 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {!isComplete && missingFields.length > 0 && (
          <div className="text-sm">
            <p className="text-gray-300 mb-2">Complete these fields to improve your profile:</p>
            <div className="flex flex-wrap gap-2">
              {missingFields.map(field => (
                <span key={field} className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-xs border border-yellow-500/30">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Activity Timeline Component
const ActivityTimeline: React.FC<{ 
  activities: UserActivity[];
  isLoading: boolean;
}> = ({ activities, isLoading }) => {
  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'folder': return BookOpen;
      case 'briefcase': return Briefcase;
      case 'calendar': return Calendar;
      case 'calendar-check': return CheckCircle;
      default: return Star;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'PROJECT_UPLOAD': return 'text-blue-400 bg-blue-600/20';
      case 'JOB_APPLICATION': return 'text-green-400 bg-green-600/20';
      case 'EVENT_CREATED': return 'text-purple-400 bg-purple-600/20';
      case 'EVENT_REGISTRATION': return 'text-orange-400 bg-orange-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-400" />
          Recent Activity
        </h3>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-300 mb-2">No recent activity</p>
            <p className="text-sm text-gray-500">Start uploading projects, applying to jobs, or joining events!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.icon);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 break-words">{activity.title}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Password Change Modal
const PasswordChangeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await changePassword(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {success && (
            <div className="bg-green-600/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-md mb-4 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Password changed successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must contain at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Profile Page Component
const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    company: user?.company || '',
    skills: user?.skills || [],
    avatar: user?.avatar || ''
  });

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    profileSearchable: true,
    isProfilePublic: true
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const [statsData, activitiesData, completionData] = await Promise.all([
        getUserStats().catch(() => null),
        getUserActivity(10).catch(() => []),
        getProfileCompletion().catch(() => null)
      ]);

      setUserStats(statsData);
      setActivities(activitiesData);
      setProfileCompletion(completionData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
      setIsLoadingCompletion(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Filter out empty values to avoid validation errors
      const profileData = {
        name: editData.name,
        bio: editData.bio,
        location: editData.location,
        company: editData.company,
        skills: editData.skills,
        ...(editData.avatar && editData.avatar.trim() !== '' && { avatar: editData.avatar })
      };
      
      const updatedUser = await updateProfile(profileData);
      
      updateUser(updatedUser.user);
      setIsEditing(false);
      
      // Refresh profile completion
      const completion = await getProfileCompletion();
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      company: user?.company || '',
      skills: user?.skills || [],
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const addSkill = (skill: string) => {
    if (skill && !editData.skills.includes(skill)) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSettingChange = async (key: keyof UserSettings, value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await updateUserSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      // For now, we'll use a simple base64 approach or a placeholder URL
      // In a real app, you'd upload to a cloud service like AWS S3, Cloudinary, etc.
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditData(prev => ({ ...prev, avatar: base64String }));
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setIsUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const getStatsForRole = () => {
    if (!userStats) {
      return [
        { label: 'Loading...', value: '-', icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Loading...', value: '-', icon: TrendingUp, color: 'text-green-400' },
        { label: 'Loading...', value: '-', icon: TrendingUp, color: 'text-purple-400' },
      ];
    }

    switch (user?.role) {
      case 'STUDENT':
        return [
          { label: 'Projects Uploaded', value: userStats.projectsOrJobs.toString(), icon: BookOpen, color: 'text-blue-400' },
          { label: 'Applications Sent', value: userStats.applicationsOrReceived.toString(), icon: Briefcase, color: 'text-green-400' },
          { label: 'Events Attended', value: userStats.eventsOrOrganized.toString(), icon: Calendar, color: 'text-purple-400' },
          { label: 'Feedback Received', value: userStats.feedbackOrTalent.toString(), icon: Star, color: 'text-yellow-400' }
        ];
      case 'PROFESSIONAL':
        return [
          { label: 'Projects Shared', value: userStats.projectsOrJobs.toString(), icon: BookOpen, color: 'text-blue-400' },
          { label: 'Workshops Created', value: userStats.eventsOrOrganized.toString(), icon: Calendar, color: 'text-green-400' },
          { label: 'Students Helped', value: userStats.applicationsOrReceived.toString(), icon: User, color: 'text-purple-400' },
          { label: 'Feedback Given', value: userStats.feedbackOrTalent.toString(), icon: Star, color: 'text-yellow-400' }
        ];
      case 'COMPANY':
        return [
          { label: 'Job Posts', value: userStats.projectsOrJobs.toString(), icon: Briefcase, color: 'text-blue-400' },
          { label: 'Applications Received', value: userStats.applicationsOrReceived.toString(), icon: User, color: 'text-green-400' },
          { label: 'Events Hosted', value: userStats.eventsOrOrganized.toString(), icon: Calendar, color: 'text-purple-400' },
          { label: 'Talent Connected', value: userStats.feedbackOrTalent.toString(), icon: Award, color: 'text-yellow-400' }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-300">Manage your profile information and settings</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex items-center space-x-2">
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={editData.avatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=96`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto ring-2 ring-gray-600 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=96`;
                  }}
                />
                {isEditing && (
                  <>
                    <button 
                      onClick={triggerImageUpload}
                      disabled={isUploadingImage}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload profile picture"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-xl font-bold text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center mb-2 w-full"
                  />
                  <input
                    type="text"
                    value={editData.avatar}
                    onChange={(e) => setEditData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="Profile image URL (optional)"
                    className="text-sm text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center mb-2 w-full px-2 py-1"
                  />
                </>
              ) : (
                <h2 className="text-xl font-bold text-white mb-2">{user.name}</h2>
              )}
              
              <p className="text-sm text-gray-400 capitalize mb-4">{user.role?.toLowerCase()}</p>

              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-gray-400"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-300 mb-4">{user.bio || 'No bio available'}</p>
              )}

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Location"
                      className="bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center text-white placeholder-gray-400 text-sm px-2 py-1"
                    />
                  ) : (
                    <span>{user.location || 'Location not specified'}</span>
                  )}
                </div>

                {user.role !== 'COMPANY' && (
                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.company}
                        onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company"
                        className="bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center text-white placeholder-gray-400 text-sm px-2 py-1"
                      />
                    ) : (
                      <span>{user.company || 'Company not specified'}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <ProfileCompletionWidget 
            completion={profileCompletion} 
            isLoading={isLoadingCompletion} 
          />

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                Activity Stats
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-gray-300 text-sm">{stat.label}</span>
                      </div>
                      {isLoadingStats ? (
                        <div className="h-5 w-8 bg-gray-600 rounded animate-pulse"></div>
                      ) : (
                        <span className="font-semibold text-white">{stat.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Skills Section */}
          {user.role !== 'COMPANY' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-400" />
                  Skills & Expertise
                </h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {editData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {editData.skills.length === 0 && !isEditing && (
                    <p className="text-gray-400 text-sm">No skills added yet</p>
                  )}
                </div>
                
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addSkill(target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).closest('div')?.querySelector('input');
                        if (input) {
                          addSkill(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} isLoading={isLoadingActivities} />

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-400" />
                Account Settings
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Privacy Settings */}
                <div>
                  <h4 className="text-md font-medium text-white mb-4 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Privacy & Visibility
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-300">Public Profile</span>
                        <p className="text-xs text-gray-500">Make your profile visible to everyone</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.isProfilePublic}
                          onChange={(e) => handleSettingChange('isProfilePublic', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-300">Profile Searchable</span>
                        <p className="text-xs text-gray-500">Allow others to find you in search</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.profileSearchable}
                          onChange={(e) => handleSettingChange('profileSearchable', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h4 className="text-md font-medium text-white mb-4 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-gray-300">Email Notifications</span>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h4 className="text-md font-medium text-white mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </h4>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full justify-start"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </div>
  );
};

export default ProfilePage; 