import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardApi } from '@/lib/api';

const getBarColor = (progress) => {
  if (progress >= 75) return 'hsl(142, 76%, 36%)';
  if (progress >= 50) return 'hsl(239, 84%, 67%)';
  if (progress >= 25) return 'hsl(38, 92%, 50%)';
  return 'hsl(0, 84%, 60%)';
};

export const DepartmentChart = () => {
  const [departmentProgress, setDepartmentProgress] = useState([]);

  useEffect(() => {
    const loadDepartmentProgress = async () => {
      try {
        const data = await dashboardApi.getDepartmentProgress();
        setDepartmentProgress(data);
      } catch (error) {
        console.error('Error loading department progress:', error);
        setDepartmentProgress([]);
      }
    };
    loadDepartmentProgress();
  }, []);

  return (
    <>
        <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={departmentProgress} 
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis 
            type="number" 
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 13%, 91%)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px hsl(224, 71%, 4%, 0.1)',
            }}
            formatter={(value, name, props) => [
              `${value}% (${props.payload.objectives} objetivos)`,
              'Progreso'
            ]}
          />
          <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={24}>
            {departmentProgress.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    </>
  )
}
