
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    type: "user_registration",
    user: "Sarah Johnson",
    userInitials: "SJ",
    action: "registered as a Professional",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    priority: "low" as const,
  },
  {
    id: 2,
    type: "project_upload",
    user: "Mike Chen",
    userInitials: "MC",
    action: "uploaded new project 'E-commerce Platform'",
    timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
    priority: "medium" as const,
  },
  {
    id: 3,
    type: "event_registration",
    user: "Emma Davis",
    userInitials: "ED",
    action: "registered for 'React Workshop'",
    timestamp: new Date(Date.now() - 1000 * 60 * 18), // 18 minutes ago
    priority: "low" as const,
  },
  {
    id: 4,
    type: "job_application",
    user: "Alex Rodriguez",
    userInitials: "AR",
    action: "applied for Senior Developer position",
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    priority: "medium" as const,
  },
  {
    id: 5,
    type: "content_report",
    user: "System",
    userInitials: "SY",
    action: "flagged inappropriate content for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
    priority: "high" as const,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
};

export const RecentActivity = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-700/50">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {activity.userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">{activity.user}</span>
                  <Badge
                    className={`w-2 h-2 p-0 rounded-full ${getPriorityColor(activity.priority)}`}
                  />
                </div>
                <p className="text-sm text-gray-300">{activity.action}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(activity.timestamp)} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
