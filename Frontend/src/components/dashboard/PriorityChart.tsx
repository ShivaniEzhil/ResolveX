import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Card from "../common/Card";
import "./dashboard.css";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#64748B",
  MEDIUM: "#3B82F6",
  HIGH: "#F97316",
  CRITICAL: "#EF4444",
};

interface PriorityChartData {
  name: string;
  value: number;
}

interface PriorityChartProps {
  data: PriorityChartData[];
  title?: string;
}

export const PriorityChart: React.FC<PriorityChartProps> = ({
  data,
  title = "Priority Distribution",
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
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PRIORITY_COLORS[entry.name.toUpperCase()] || "#4F46E5"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PriorityChart;
