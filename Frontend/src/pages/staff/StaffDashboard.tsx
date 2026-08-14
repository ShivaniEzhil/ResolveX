import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import RecentComplaints from "../../components/dashboard/RecentComplaints";
import PriorityChart from "../../components/dashboard/PriorityChart";
import Card from "../../components/common/Card";
import { getComplaints } from "../../services/complaintService";
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
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getComplaints({
          limit: 100,
        });

        setComplaints(result.complaints || []);
      } catch (err) {
        console.error("Failed to load staff dashboard:", err);
        setError(
          "Unable to load your dashboard. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const assignedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "ASSIGNED" ||
      complaint.status === "IN_PROGRESS"
  );

  const inProgressCount = complaints.filter(
    (complaint) => complaint.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "RESOLVED"
  ).length;

  const criticalCount = complaints.filter(
    (complaint) => complaint.priority === "CRITICAL"
  ).length;

  const priorityData = [
    {
      name: "Low",
      value: complaints.filter(
        (complaint) => complaint.priority === "LOW"
      ).length,
    },
    {
      name: "Medium",
      value: complaints.filter(
        (complaint) => complaint.priority === "MEDIUM"
      ).length,
    },
    {
      name: "High",
      value: complaints.filter(
        (complaint) => complaint.priority === "HIGH"
      ).length,
    },
    {
      name: "Critical",
      value: complaints.filter(
        (complaint) => complaint.priority === "CRITICAL"
      ).length,
    },
  ];

  return (
    <DashboardLayout
      role="STAFF"
      title="Staff Workstation"
      subtitle="View your active assignments, update resolution status, and manage tasks"
      activeItem="dashboard"
      onNavigate={onNavigateTab}
    >
      {isLoading ? (
        <Card>
          <div style={{ padding: 40, textAlign: "center" }}>
            Loading your dashboard...
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--rx-danger)",
            }}
          >
            {error}
          </div>
        </Card>
      ) : (
        <>
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
              value={inProgressCount}
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
              complaints={assignedComplaints.slice(0, 5)}
              onViewAll={() =>
                onNavigateTab && onNavigateTab("complaints")
              }
              onSelectComplaint={onSelectComplaint}
            />

            {/* Priority Breakdown */}
            <PriorityChart
              data={priorityData}
              title="Workload Priority Breakdown"
            />
          </div>

          {/* Staff Instructions Banner */}
          <Card title="Staff Operational Guidelines">
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--rx-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Please update the status to{" "}
              <strong>IN_PROGRESS</strong> when you begin working
              on an assigned complaint. Post regular progress
              updates in the response thread to keep the reporting
              student informed before marking the task{" "}
              <strong>RESOLVED</strong>.
            </p>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default StaffDashboardPage;