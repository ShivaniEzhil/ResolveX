import React, { useState } from "react";
import AdminDashboard from "../AdminDashboard";
import AdminComplaints from "./AdminComplaints";
import AdminComplaintDetailsPage from "./AdminComplaintDetails";
import AdminUsers from "./AdminUsers";
import AdminAnalytics from "./AdminAnalytics";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminNotifications from "./AdminNotifications";

import type { ComplaintItem } from "../../types/complaints";
import type { Complaint } from "../../types/analytics";

export const AdminContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintItem | null>(null);

  const handleSelectComplaint = (
    complaint: ComplaintItem
  ) => {
    setSelectedComplaint(complaint);
    setActiveTab("complaint-details");
  };

  const handleDashboardComplaintSelect = (
    complaint: Complaint
  ) => {
    const complaintItem: ComplaintItem = {
      ...complaint,
    };

    handleSelectComplaint(complaintItem);
  };

  const renderContent = () => {
    if (
      activeTab === "complaint-details" &&
      selectedComplaint
    ) {
      return (
        <AdminComplaintDetailsPage
          complaint={selectedComplaint}
          onBack={() => setActiveTab("complaints")}
          onNavigate={(id) => setActiveTab(id)}
        />
      );
    }

    switch (activeTab) {
      case "complaints":
        return (
          <AdminComplaints
            onSelectComplaint={handleSelectComplaint}
            onNavigate={(id) => setActiveTab(id)}
          />
        );

      case "users":
        return (
          <AdminUsers
            onNavigate={(id) => setActiveTab(id)}
          />
        );

      case "analytics":
        return (
          <AdminAnalytics
            onNavigate={(id) => setActiveTab(id)}
          />
        );

      case "audit-logs":
        return (
          <AdminAuditLogs
            onNavigate={(id) => setActiveTab(id)}
          />
        );

      case "notifications":
        return (
          <AdminNotifications
            onNavigate={(id) => setActiveTab(id)}
          />
        );

      case "dashboard":
      default:
        return (
          <AdminDashboard
            onNavigateTab={(id) =>
              setActiveTab(id)
            }
            onSelectComplaint={
              handleDashboardComplaintSelect
            }
          />
        );
    }
  };

  return <>{renderContent()}</>;
};

export default AdminContainer;