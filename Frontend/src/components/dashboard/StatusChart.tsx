import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "../common/Card";
import "./dashboard.css";

const STATUS_COLORS: Record<string, string> = {
  Submitted: "#3B82F6",
  Assigned: "#F59E0B",
  "In Progress": "#8B5CF6",
  Resolved: "#10B981",
};

interface StatusChartData {
  name: string;
  value: number;
}

interface StatusChartProps {
  data: StatusChartData[];
  title?: string;
}

export const StatusChart: React.FC<StatusChartProps> = ({
  data,
  title = "Complaint Status",
}) => {
  return (
    <Card title={title}>
      <div className="rx-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] || "#9CA3AF"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StatusChart;
