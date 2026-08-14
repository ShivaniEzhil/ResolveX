import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import Button from "../../components/common/Button";
import { MOCK_COMPLAINTS, MOCK_RESPONSES } from "../../data/mockData";
import type { ComplaintItem, ComplaintResponseItem } from "../../types/complaints";

interface StaffComplaintDetailsProps {
  complaint?: ComplaintItem;
  onBack?: () => void;
  onNavigateTab?: (id: string) => void;
}

export const StaffComplaintDetailsPage: React.FC<StaffComplaintDetailsProps> = ({
  complaint: initialComplaint,
  onBack,
  onNavigateTab,
}) => {
  const [complaint, setComplaint] = useState<ComplaintItem>(
    initialComplaint || MOCK_COMPLAINTS[0]
  );

  const [responses, setResponses] = useState<ComplaintResponseItem[]>(
    MOCK_RESPONSES[complaint.id] || []
  );

  const handleAddResponse = (message: string) => {
    const newResp: ComplaintResponseItem = {
      id: `resp-${Date.now()}`,
      complaint_id: complaint.id,
      user_id: "usr-staff-1",
      userName: "Staff Technician",
      userRole: "STAFF",
      message,
      created_at: new Date().toISOString(),
    };
    setResponses((prev) => [...prev, newResp]);
  };

  const handleStatusChange = () => {
    const nextStatus = complaint.status === "ASSIGNED" ? "IN_PROGRESS" : "RESOLVED";
    setComplaint((prev) => ({
      ...prev,
      status: nextStatus as any,
      updated_at: new Date().toISOString(),
    }));
  };

  return (
    <DashboardLayout
      role="STAFF"
      title={`Task ${complaint.id} Details`}
      activeItem="complaints"
      onNavigate={onNavigateTab}
    >
      <div style={{ marginBottom: 16 }}>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to assigned complaints
          </Button>
        )}
      </div>

      <ComplaintDetails
        complaint={complaint}
        responses={responses}
        onAddResponse={handleAddResponse}
        onUpdateStatusClick={handleStatusChange}
      />
    </DashboardLayout>
  );
};

export default StaffComplaintDetailsPage;
