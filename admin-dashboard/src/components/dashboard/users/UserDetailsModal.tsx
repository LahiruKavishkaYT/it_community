import { useState } from "react";
import { User, userAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  Activity, 
  Settings,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "ADMIN":
      return <Settings className="h-4 w-4" />;
    case "COMPANY":
      return <Building className="h-4 w-4" />;
    case "PROFESSIONAL":
      return <Briefcase className="h-4 w-4" />;
    case "STUDENT":
      return <GraduationCap className="h-4 w-4" />;
    default:
      return <UserIcon className="h-4 w-4" />;
  }
};

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

export const UserDetailsModal = ({ user, isOpen, onClose }: UserDetailsModalProps) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            User Profile Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive view of user information and activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role}</span>
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    {user.company && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Joined {formatDate(user.joinDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span>Last active: {user.lastActive}</span>
                    </div>
                  </div>
                  {user.bio && (
                    <div className="mt-3">
                      <p className="text-gray-300">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-gray-600">
                Activity
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-gray-600">
                Content
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gray-600">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stats Cards */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{user.projects}</div>
                    <p className="text-xs text-gray-400">Created projects</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{user.events}</div>
                    <p className="text-xs text-gray-400">Attended events</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1">
                      <div className="text-2xl font-bold text-white">4.8</div>
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                    <p className="text-xs text-gray-400">Average rating</p>
                  </CardContent>
                </Card>
              </div>

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Activity tracking feature coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">User Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-400">
                      <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Content overview feature coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-400">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Advanced settings feature coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 