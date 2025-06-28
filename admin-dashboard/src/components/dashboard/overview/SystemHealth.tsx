
import { Activity, Database, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const healthMetrics = [
  {
    title: "Server Uptime",
    value: "99.9%",
    progress: 99.9,
    icon: Activity,
    status: "healthy" as const,
  },
  {
    title: "Database Performance",
    value: "Good",
    progress: 87,
    icon: Database,
    status: "healthy" as const,
  },
  {
    title: "Security Score",
    value: "A+",
    progress: 95,
    icon: Shield,
    status: "healthy" as const,
  },
  {
    title: "API Response Time",
    value: "124ms",
    progress: 82,
    icon: TrendingUp,
    status: "healthy" as const,
  },
];

export const SystemHealth = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthMetrics.map((metric) => (
          <div key={metric.title} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{metric.title}</span>
              </div>
              <span
                className={`text-sm font-medium ${
                  metric.status === "healthy" ? "text-green-400" : "text-red-400"
                }`}
              >
                {metric.value}
              </span>
            </div>
            <Progress
              value={metric.progress}
              className="h-2 bg-gray-700"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
