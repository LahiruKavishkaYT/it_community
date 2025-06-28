
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Jan", users: 8400, projects: 2400, events: 12 },
  { month: "Feb", users: 9200, projects: 2800, events: 18 },
  { month: "Mar", users: 10100, projects: 3200, events: 24 },
  { month: "Apr", users: 10800, projects: 3600, events: 28 },
  { month: "May", users: 11600, projects: 3800, events: 32 },
  { month: "Jun", users: 12847, projects: 3924, events: 47 },
];

export const UserGrowthChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-semibold">{entry.name}:</span> {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="text-white text-lg font-semibold flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          Platform Growth
        </CardTitle>
        <p className="text-gray-400 text-sm mt-1">User registration and engagement trends</p>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#F3F4F6', fontSize: '14px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Users"
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#3B82F6", strokeWidth: 2, fill: "#1D4ED8" }}
                filter="url(#glow)"
              />
              <Line
                type="monotone"
                dataKey="projects"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Projects"
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#8B5CF6", strokeWidth: 2, fill: "#7C3AED" }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#10B981"
                strokeWidth={3}
                name="Events"
                dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#10B981", strokeWidth: 2, fill: "#059669" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
