import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardApi } from "@/lib/api";

export const ProgressChart = () => {
  const [monthlyProgress, setMonthlyProgress] = useState([]);

  useEffect(() => {
    const loadMonthlyProgress = async () => {
      try {
        const data = await dashboardApi.getMonthlyProgress();
        setMonthlyProgress(data);
      } catch (error) {
        console.error('Error loading monthly progress:', error);
        // Fallback to empty array
        setMonthlyProgress([]);
      }
    };
    loadMonthlyProgress();
  }, []);

  return (
    <>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={monthlyProgress}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(239, 84%, 67%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(239, 84%, 67%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 13%, 91%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px hsl(224, 71%, 4%, 0.1)",
              }}
              formatter={(value) => [`${value}%`, "Progreso"]}
            />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="hsl(239, 84%, 67%)"
              strokeWidth={2}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
