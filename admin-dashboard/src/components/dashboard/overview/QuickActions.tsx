import { Plus, UserPlus, Settings, Download, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Add Admin User",
    description: "Invite new administrator",
    icon: UserPlus,
    variant: "secondary" as const,
  },
  {
    title: "System Announcement",
    description: "Broadcast to all users",
    icon: Megaphone,
    variant: "secondary" as const,
  },
  {
    title: "Export Data",
    description: "Download platform analytics",
    icon: Download,
    variant: "outline" as const,
  },
];

export const QuickActions = () => {
  const getActionStyles = (title: string) => {
    switch (title) {
      case "Add Admin User":
        return "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-purple-500 shadow-purple-500/20";
      case "System Announcement":
        return "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white border-green-500 shadow-green-500/20";
      case "Export Data":
        return "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border-gray-600 shadow-gray-500/20";
      default:
        return "bg-gray-700 hover:bg-gray-600 border-gray-600";
    }
  };

  const getIconColor = (title: string) => {
    switch (title) {
      case "Add Admin User":
        return "text-purple-200";
      case "System Announcement":
        return "text-green-200";
      case "Export Data":
        return "text-gray-300";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg font-semibold flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Button
            key={action.title}
            variant="default"
            className={`w-full justify-start h-auto p-4 ${getActionStyles(action.title)} transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden`}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <action.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${getIconColor(action.title)} group-hover:scale-110 transition-transform duration-300 relative z-10`} />
            <div className="text-left relative z-10">
              <div className="font-semibold text-white group-hover:text-gray-100 transition-colors">
                {action.title}
              </div>
              <div className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors mt-0.5">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
