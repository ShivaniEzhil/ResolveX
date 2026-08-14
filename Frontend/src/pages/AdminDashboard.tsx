import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import StatusChart from "../components/dashboard/StatusChart";
import PriorityChart from "../components/dashboard/PriorityChart";
import DepartmentChart from "../components/dashboard/DepartmentChart";
import StaffWorkloadTable from "../components/dashboard/StaffWorkloadTable";
import RecentComplaints from "../components/dashboard/RecentComplaints";
import RecentActivity from "../components/dashboard/RecentActivity";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

import {
  getComplaintStatistics,
  getStaffWorkload,
  getRecentComplaints,
  getRecentActivity,
} from "../services/analyticsService";

import type {
  ComplaintStatistics,
  StaffWorkload,
  Complaint,
  AuditActivity,
} from "../types/analytics";

import "./AdminDashboard.css";

interface AdminDashboardProps {
  onNavigateTab?: (tabId: string) => void;
  onSelectComplaint?: (complaint: Complaint) => void;
}

function AdminDashboard({ onNavigateTab, onSelectComplaint }: AdminDashboardProps) {
  const [statistics, setStatistics] = useState<ComplaintStatistics | null>(null);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditActivity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statisticsData,
        workloadData,
        complaintsData,
        activityData,
      ] = await Promise.all([
        getComplaintStatistics(),
        getStaffWorkload(),
        getRecentComplaints(10),
        getRecentActivity(10),
      ]);

      setStatistics(statisticsData);
      setStaffWorkload(workloadData);
      setRecentComplaints(complaintsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error(err);
      setError("Unable to load live backend dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // API data fetching intentionally updates component state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="Admin Dashboard" activeItem="dashboard">
        <LoadingState message="Loading dashboard analytics from backend API..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="Admin Dashboard" activeItem="dashboard">
        <ErrorState message={error} onRetry={loadDashboard} />
      </DashboardLayout>
    );
  }

  const statusData = statistics
    ? [
        { name: "Submitted", value: statistics.summary.submitted },
        { name: "Assigned", value: statistics.summary.assigned },
        { name: "In Progress", value: statistics.summary.in_progress },
        { name: "Resolved", value: statistics.summary.resolved },
      ]
    : [];

  const priorityData = statistics
    ? Object.entries(statistics.by_priority).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const departmentData = statistics
    ? Object.entries(statistics.by_department).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <DashboardLayout
      role="ADMIN"
      title="Admin Overview Dashboard"
      subtitle="Live platform metrics, automated routing stats, and system activity"
      activeItem="dashboard"
      onNavigate={onNavigateTab}
    >
      {/* KPI Cards */}
      {statistics && (
        <div className="rx-stat-grid">
          <StatCard
            label="Total Complaints"
            value={statistics.summary.total}
          />
          <StatCard
            label="Submitted"
            value={statistics.summary.submitted}
            iconBg="var(--rx-status-submitted-bg)"
            iconColor="var(--rx-status-submitted)"
          />
          <StatCard
            label="Assigned"
            value={statistics.summary.assigned}
            iconBg="var(--rx-status-assigned-bg)"
            iconColor="var(--rx-status-assigned)"
          />
          <StatCard
            label="In Progress"
            value={statistics.summary.in_progress}
            iconBg="var(--rx-status-in-progress-bg)"
            iconColor="var(--rx-status-in-progress)"
          />
          <StatCard
            label="Resolved"
            value={statistics.summary.resolved}
            iconBg="var(--rx-status-resolved-bg)"
            iconColor="var(--rx-status-resolved)"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="rx-chart-grid">
        <StatusChart data={statusData} />
        <PriorityChart data={priorityData} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <DepartmentChart data={departmentData} />
      </div>

      {/* Staff Workload */}
      <div style={{ marginBottom: 24 }}>
        <StaffWorkloadTable staffWorkload={staffWorkload} />
      </div>

      {/* Recent Complaints & Activity */}
      <div className="rx-chart-grid">
        <RecentComplaints
          complaints={recentComplaints}
          onViewAll={() => onNavigateTab && onNavigateTab("complaints")}
          onSelectComplaint={(c) => onSelectComplaint && onSelectComplaint(c)}
        />
        <RecentActivity activity={recentActivity} />
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;