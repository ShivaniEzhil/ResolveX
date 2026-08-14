import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import RecentComplaints from "../../components/dashboard/RecentComplaints";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { getComplaints } from "../../services/complaintService";
import type { ComplaintItem } from "../../types/complaints";
import "../../components/dashboard/dashboard.css";

interface StudentDashboardProps {
  onNavigateTab?: (tabId: string) => void;
  onSelectComplaint?: (complaint: ComplaintItem) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onSelectComplaint,
}) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaints = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getComplaints({ limit: 100 });
        setComplaints(result.complaints || []);
      } catch (err) {
        console.error("Failed to load complaints for dashboard:", err);
        setError("Unable to load complaints summary.");
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const submittedCount = complaints.filter((c) => c.status === "SUBMITTED").length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <DashboardLayout
      role="STUDENT"
      title="Student Helpdesk Dashboard"
      subtitle="Track your submitted issues, receive AI status updates, and report new concerns"
      activeItem="dashboard"
      onNavigate={onNavigateTab}
    >
      {/* Quick Submission Callout Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--rx-primary) 0%, #312E81 100%)",
          borderRadius: "var(--rx-radius-lg)",
          padding: "24px 28px",
          color: "white",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ color: "white", fontSize: "1.25rem", margin: "0 0 6px" }}>
            Encountering a facility or campus issue?
          </h2>
          <p style={{ color: "#E0E7FF", fontSize: "0.875rem", margin: 0 }}>
            ResolveX AI instantly analyzes your request and routes it to the right department.
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => onNavigateTab && onNavigateTab("submit-complaint")}
          style={{ background: "white", color: "var(--rx-primary)", fontWeight: 600 }}
        >
          + Submit New Complaint
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="rx-stat-grid">
        <StatCard
          label="Total Submitted"
          value={complaints.length}
        />
        <StatCard
          label="Pending Review"
          value={submittedCount}
          iconBg="var(--rx-status-submitted-bg)"
          iconColor="var(--rx-status-submitted)"
        />
        <StatCard
          label="Active Resolution"
          value={inProgressCount}
          iconBg="var(--rx-status-in-progress-bg)"
          iconColor="var(--rx-status-in-progress)"
        />
        <StatCard
          label="Resolved Issues"
          value={resolvedCount}
          iconBg="var(--rx-status-resolved-bg)"
          iconColor="var(--rx-status-resolved)"
        />
      </div>

      {/* Recent My Complaints Table */}
      <div style={{ marginBottom: 24 }}>
        {isLoading ? (
          <Card title="My Recent Complaints">
            <div style={{ padding: 30, textAlign: "center" }}>
              Loading recent complaints...
            </div>
          </Card>
        ) : error ? (
          <Card title="My Recent Complaints">
            <div style={{ padding: 30, textAlign: "center", color: "var(--rx-danger)" }}>
              {error}
            </div>
          </Card>
        ) : (
          <RecentComplaints
            title="My Recent Complaints"
            complaints={complaints.slice(0, 5)}
            onViewAll={() => onNavigateTab && onNavigateTab("my-complaints")}
            onSelectComplaint={onSelectComplaint}
          />
        )}
      </div>

      {/* AI Assistance Tip */}
      <Card title="How ResolveX AI Helps You">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: "var(--rx-gray-50)" }}>
            <h4 style={{ fontSize: "0.875rem", margin: "0 0 4px", color: "var(--rx-primary)" }}>
              ⚡ Auto Classification
            </h4>
            <p style={{ fontSize: "0.8125rem", margin: 0 }}>
              AI assigns urgency and category immediately upon submission.
            </p>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: "var(--rx-gray-50)" }}>
            <h4 style={{ fontSize: "0.875rem", margin: "0 0 4px", color: "var(--rx-primary)" }}>
              🎯 Direct Department Routing
            </h4>
            <p style={{ fontSize: "0.8125rem", margin: 0 }}>
              Routed straight to staff members with the lightest workload.
            </p>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: "var(--rx-gray-50)" }}>
            <h4 style={{ fontSize: "0.875rem", margin: "0 0 4px", color: "var(--rx-primary)" }}>
              🔔 Real-time Alerts
            </h4>
            <p style={{ fontSize: "0.8125rem", margin: 0 }}>
              Receive instant updates as staff members resolve your ticket.
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
