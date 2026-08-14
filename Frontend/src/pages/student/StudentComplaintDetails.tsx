import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import Button from "../../components/common/Button";
import { MOCK_COMPLAINTS, MOCK_RESPONSES } from "../../data/mockData";
import type { ComplaintItem, ComplaintResponseItem } from "../../types/complaints";

interface StudentComplaintDetailsProps {
  complaint?: ComplaintItem;
  onBack?: () => void;
  onNavigateTab?: (id: string) => void;
}

export const StudentComplaintDetailsPage: React.FC<StudentComplaintDetailsProps> = ({
  complaint: initialComplaint,
  onBack,
  onNavigateTab,
}) => {
  const [complaint] = useState<ComplaintItem>(
    initialComplaint || MOCK_COMPLAINTS[0]
  );

  const [responses, setResponses] = useState<ComplaintResponseItem[]>(
    MOCK_RESPONSES[complaint.id] || []
  );

  const handleAddResponse = (message: string) => {
    const newResp: ComplaintResponseItem = {
      id: `resp-${Date.now()}`,
      complaint_id: complaint.id,
      user_id: "usr-student-1",
      userName: "Rahul Sharma (Student)",
      userRole: "STUDENT",
      message,
      created_at: new Date().toISOString(),
    };
    setResponses((prev) => [...prev, newResp]);
  };

  return (
    <DashboardLayout
      role="STUDENT"
      title={`Ticket #${complaint.id}`}
      activeItem="my-complaints"
      onNavigate={onNavigateTab}
    >
      <div style={{ marginBottom: 16 }}>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to my complaints
          </Button>
        )}
      </div>

      <ComplaintDetails
        complaint={complaint}
        responses={responses}
        onAddResponse={handleAddResponse}
        showInternalAIInfo={false}
      />
    </DashboardLayout>
  );
};

export default StudentComplaintDetailsPage;
