import React, { useState } from "react";
import StudentDashboardPage from "./StudentDashboard";
import SubmitComplaint from "./SubmitComplaint";
import MyComplaints from "./MyComplaints";
import StudentComplaintDetailsPage from "./StudentComplaintDetails";
import StudentNotifications from "./StudentNotifications";
import type { ComplaintItem } from "../../types/complaints";

export const StudentContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  const handleSelectComplaint = (complaint: ComplaintItem) => {
    setSelectedComplaint(complaint);
    setActiveTab("complaint-details");
  };

  const renderContent = () => {
    if (activeTab === "complaint-details" && selectedComplaint) {
      return (
        <StudentComplaintDetailsPage
          complaint={selectedComplaint}
          onBack={() => setActiveTab("my-complaints")}
          onNavigateTab={(id) => setActiveTab(id)}
        />
      );
    }

    switch (activeTab) {
      case "submit-complaint":
        return (
          <SubmitComplaint
            onNavigateTab={(id) => setActiveTab(id)}
            onSubmitSuccess={() => setActiveTab("my-complaints")}
          />
        );
      case "my-complaints":
        return (
          <MyComplaints
            onSelectComplaint={handleSelectComplaint}
            onNavigateTab={(id) => setActiveTab(id)}
          />
        );
      case "notifications":
        return <StudentNotifications onNavigateTab={(id) => setActiveTab(id)} />;
      case "dashboard":
      default:
        return (
          <StudentDashboardPage
            onNavigateTab={(id) => setActiveTab(id)}
            onSelectComplaint={handleSelectComplaint}
          />
        );
    }
  };

  return <>{renderContent()}</>;
};

export default StudentContainer;
