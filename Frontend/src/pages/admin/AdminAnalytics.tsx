import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusChart from "../../components/dashboard/StatusChart";
import PriorityChart from "../../components/dashboard/PriorityChart";
import DepartmentChart from "../../components/dashboard/DepartmentChart";
import CategoryChart from "../../components/dashboard/CategoryChart";
import Card from "../../components/common/Card";
import FilterDropdown from "../../components/common/FilterDropdown";
import "../../components/dashboard/dashboard.css";

interface AdminAnalyticsProps {
  onNavigate?: (id: string) => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState("30");

  const statusData = [
    { name: "Submitted", value: 14 },
    { name: "Assigned", value: 22 },
    { name: "In Progress", value: 18 },
    { name: "Resolved", value: 68 },
  ];

  const priorityData = [
    { name: "Low", value: 35 },
    { name: "Medium", value: 48 },
    { name: "High", value: 27 },
    { name: "Critical", value: 12 },
  ];

  const departmentData = [
    { name: "IT", value: 42 },
    { name: "Electrical", value: 28 },
    { name: "Maintenance", value: 22 },
    { name: "Transport", value: 15 },
    { name: "Academics", value: 10 },
    { name: "Hostel", value: 5 },
  ];

  const categoryData = [
    { name: "Network", value: 38 },
    { name: "Electrical", value: 25 },
    { name: "Facilities", value: 20 },
    { name: "Technical", value: 18 },
    { name: "Cleanliness", value: 12 },
    { name: "Other", value: 9 },
  ];

  return (
    <DashboardLayout
      role="ADMIN"
      title="Analytics & System Insights"
      subtitle="Deep-dive operational metrics, resolution speeds, and departmental workload distribution"
      activeItem="analytics"
      onNavigate={onNavigate}
    >
      {/* Date Filter Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <FilterDropdown
          label="Time Range"
          value={timeRange}
          onChange={setTimeRange}
          allLabel="All Time"
          options={[
            { value: "7", label: "Last 7 Days" },
            { value: "30", label: "Last 30 Days" },
            { value: "90", label: "Last 90 Days" },
          ]}
        />
      </div>

      {/* KPI Cards */}
      <div className="rx-stat-grid">
        <StatCard
          label="Resolution Rate"
          value="84.2%"
          trendLabel="+5.4% from last period"
          trendDirection="up"
        />
        <StatCard
          label="Avg Resolution Time"
          value="14.5 hrs"
          trendLabel="-2.1 hrs faster"
          trendDirection="up"
        />
        <StatCard
          label="Total Complaints"
          value={122}
          trendLabel="12 new this week"
          trendDirection="neutral"
        />
        <StatCard
          label="SLA Compliance"
          value="92.8%"
          trendLabel="Within 24h target"
          trendDirection="up"
        />
      </div>

      {/* Charts Grid */}
      <div className="rx-chart-grid">
        <StatusChart data={statusData} />
        <PriorityChart data={priorityData} />
      </div>

      <div className="rx-chart-grid">
        <DepartmentChart data={departmentData} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Summary Note */}
      <Card title="Analytics Report Summary">
        <p style={{ fontSize: "0.875rem", color: "var(--rx-text-secondary)", lineHeight: 1.6 }}>
          IT & Network issues account for 34% of total complaints submitted over the last {timeRange} days. 
          Average resolution duration has improved by 2.1 hours due to automated Gemini AI routing directly to assigned staff members upon creation.
        </p>
      </Card>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
