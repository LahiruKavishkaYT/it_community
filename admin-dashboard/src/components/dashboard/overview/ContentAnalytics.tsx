
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { category: "Web Dev", projects: 1240, jobs: 156, events: 18 },
  { category: "Mobile Dev", projects: 980, jobs: 124, events: 12 },
  { category: "Data Science", projects: 756, jobs: 98, events: 8 },
  { category: "DevOps", projects: 542, jobs: 87, events: 6 },
  { category: "UI/UX", projects: 406, jobs: 72, events: 3 },
];

export const ContentAnalytics = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Content by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              <Bar dataKey="projects" fill="#3B82F6" name="Projects" />
              <Bar dataKey="jobs" fill="#8B5CF6" name="Jobs" />
              <Bar dataKey="events" fill="#10B981" name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
