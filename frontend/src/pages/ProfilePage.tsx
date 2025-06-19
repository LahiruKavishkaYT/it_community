import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/api';
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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    company: user?.company || '',
    skills: user?.skills || []
  });

  if (!user) return null;

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        ...user,
        name: editData.name,
        bio: editData.bio,
        location: editData.location,
        company: editData.company,
        skills: editData.skills
      });
      
      // In a real app, you would update the user context here
      console.log('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // You could show an error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      bio: user.bio || '',
      location: user.location || '',
      company: user.company || '',
      skills: user.skills || []
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

  const getProfileStats = () => {
    switch (user.role) {
      case 'student':
        return [
          { label: 'Projects', value: '12' },
          { label: 'Applications', value: '8' },
          { label: 'Events Attended', value: '5' }
        ];
      case 'professional':
        return [
          { label: 'Projects', value: '18' },
          { label: 'Workshops', value: '6' },
          { label: 'Mentees', value: '15' }
        ];
      case 'company':
        return [
          { label: 'Job Posts', value: '7' },
          { label: 'Applications', value: '142' },
          { label: 'Events Hosted', value: '3' }
        ];
      default:
        return [];
    }
  };

  const stats = getProfileStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
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

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto ring-2 ring-gray-600"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xl font-bold text-white bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center mb-2 w-full"
                />
              ) : (
                <h2 className="text-xl font-bold text-white mb-2">{user.name}</h2>
              )}
              
              <p className="text-sm text-gray-400 capitalize mb-4">{user.role}</p>

              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-gray-400"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-300 mb-4">{user.bio}</p>
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
                      className="bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center text-white placeholder-gray-400"
                    />
                  ) : (
                    <span>{user.location}</span>
                  )}
                </div>

                {user.role !== 'company' && (
                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.company}
                        onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company"
                        className="bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-center text-white placeholder-gray-400"
                      />
                    ) : (
                      <span>{user.company || 'Not specified'}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Activity Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-300">{stat.label}</span>
                    <span className="font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Skills Section */}
          {user.role !== 'company' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Skills</h3>
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
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        addSkill(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Completed React.js Advanced Workshop</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">
                      {user.role === 'student' && 'Applied to Frontend Developer position at TechCorp'}
                      {user.role === 'professional' && 'Mentored 3 students on full-stack development'}
                      {user.role === 'company' && 'Posted new Senior Developer position'}
                    </p>
                    <p className="text-xs text-gray-500">5 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Joined Tech Career Fair 2024</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Account Settings</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-300">Email notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-300">Profile visibility</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;