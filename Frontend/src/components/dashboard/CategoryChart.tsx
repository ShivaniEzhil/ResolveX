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

interface CategoryChartData {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: CategoryChartData[];
  title?: string;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  title = "Complaints by Category",
}) => {
  return (
    <Card title={title}>
      <div className="rx-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis type="number" allowDecimals={false} stroke="#6B7280" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={12} width={90} />
            <Tooltip />
            <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CategoryChart;
