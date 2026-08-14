import React, { useState } from "react";
import StaffDashboardPage from "./StaffDashboard";
import StaffComplaints from "./StaffComplaints";
import StaffComplaintDetailsPage from "./StaffComplaintDetails";
import StaffNotifications from "./StaffNotifications";
import type { ComplaintItem } from "../../types/complaints";

export const StaffContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  const handleSelectComplaint = (complaint: ComplaintItem) => {
    setSelectedComplaint(complaint);
    setActiveTab("complaint-details");
  };

  const renderContent = () => {
    if (activeTab === "complaint-details" && selectedComplaint) {
      return (
        <StaffComplaintDetailsPage
          complaint={selectedComplaint}
          onBack={() => setActiveTab("complaints")}
          onNavigateTab={(id) => setActiveTab(id)}
        />
      );
    }

    switch (activeTab) {
      case "complaints":
        return (
          <StaffComplaints
            onSelectComplaint={handleSelectComplaint}
            onNavigateTab={(id) => setActiveTab(id)}
          />
        );
      case "notifications":
        return <StaffNotifications onNavigateTab={(id) => setActiveTab(id)} />;
      case "dashboard":
      default:
        return (
          <StaffDashboardPage
            onNavigateTab={(id) => setActiveTab(id)}
            onSelectComplaint={handleSelectComplaint}
          />
        );
    }
  };

  return <>{renderContent()}</>;
};

export default StaffContainer;
