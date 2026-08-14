import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import RecentComplaints from "../../components/dashboard/RecentComplaints";
import PriorityChart from "../../components/dashboard/PriorityChart";
import Card from "../../components/common/Card";
import { MOCK_COMPLAINTS } from "../../data/mockData";
import type { ComplaintItem } from "../../types/complaints";
import "../../components/dashboard/dashboard.css";

interface StaffDashboardProps {
  onNavigateTab?: (tabId: string) => void;
  onSelectComplaint?: (complaint: ComplaintItem) => void;
}

export const StaffDashboardPage: React.FC<StaffDashboardProps> = ({
  onNavigateTab,
  onSelectComplaint,
}) => {
  // Staff member sees complaints assigned to them (mock filter or all)
  const assignedComplaints = MOCK_COMPLAINTS.filter(
    (c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS"
  );
  const resolvedCount = MOCK_COMPLAINTS.filter((c) => c.status === "RESOLVED").length;
  const criticalCount = MOCK_COMPLAINTS.filter((c) => c.priority === "CRITICAL").length;

  const priorityData = [
    { name: "Low", value: 1 },
    { name: "Medium", value: 2 },
    { name: "High", value: 3 },
    { name: "Critical", value: 1 },
  ];

  return (
    <DashboardLayout
      role="STAFF"
      title="Staff Workstation"
      subtitle="View your active assignments, update resolution status, and manage tasks"
      activeItem="dashboard"
      onNavigate={onNavigateTab}
    >
      {/* KPI Cards */}
      <div className="rx-stat-grid">
        <StatCard
          label="Active Assigned"
          value={assignedComplaints.length}
          iconBg="var(--rx-status-assigned-bg)"
          iconColor="var(--rx-status-assigned)"
        />
        <StatCard
          label="In Progress"
          value={MOCK_COMPLAINTS.filter((c) => c.status === "IN_PROGRESS").length}
          iconBg="var(--rx-status-in-progress-bg)"
          iconColor="var(--rx-status-in-progress)"
        />
        <StatCard
          label="Resolved Tasks"
          value={resolvedCount}
          iconBg="var(--rx-status-resolved-bg)"
          iconColor="var(--rx-status-resolved)"
        />
        <StatCard
          label="Critical Priority"
          value={criticalCount}
          iconBg="var(--rx-danger-bg)"
          iconColor="var(--rx-danger)"
        />
      </div>

      <div className="rx-chart-grid">
        {/* Active Complaints */}
        <RecentComplaints
          title="My Active Assigned Complaints"
          complaints={assignedComplaints}
          onViewAll={() => onNavigateTab && onNavigateTab("complaints")}
          onSelectComplaint={onSelectComplaint}
        />

        {/* Priority Breakdown */}
        <PriorityChart data={priorityData} title="Workload Priority Breakdown" />
      </div>

      {/* Staff Instructions Banner */}
      <Card title="Staff Operational Guidelines">
        <p style={{ fontSize: "0.875rem", color: "var(--rx-text-secondary)", lineHeight: 1.6 }}>
          Please update the status to <strong>IN_PROGRESS</strong> when you begin working on an assigned complaint. 
          Post regular progress updates in the response thread to keep the reporting student informed before marking the task <strong>RESOLVED</strong>.
        </p>
      </Card>
    </DashboardLayout>
  );
};

export default StaffDashboardPage;
