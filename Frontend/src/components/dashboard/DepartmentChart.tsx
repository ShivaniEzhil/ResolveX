import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../common/Card";
import "./dashboard.css";

interface DepartmentChartData {
  name: string;
  value: number;
}

interface DepartmentChartProps {
  data: DepartmentChartData[];
  title?: string;
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({
  data,
  title = "Complaints by Department",
}) => {
  return (
    <Card title={title}>
      <div className="rx-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis allowDecimals={false} stroke="#6B7280" fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DepartmentChart;
