import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import AssignmentModal from "../../components/complaints/AssignmentModal";
import Button from "../../components/common/Button";
import { MOCK_COMPLAINTS, MOCK_RESPONSES, MOCK_USERS } from "../../data/mockData";
import type { ComplaintItem, ComplaintResponseItem } from "../../types/complaints";

interface AdminComplaintDetailsProps {
  complaint?: ComplaintItem;
  onBack?: () => void;
  onNavigate?: (id: string) => void;
}

export const AdminComplaintDetailsPage: React.FC<AdminComplaintDetailsProps> = ({
  complaint: initialComplaint,
  onBack,
  onNavigate,
}) => {
  const [complaint, setComplaint] = useState<ComplaintItem>(
    initialComplaint || MOCK_COMPLAINTS[0]
  );

  const [responses, setResponses] = useState<ComplaintResponseItem[]>(
    MOCK_RESPONSES[complaint.id] || []
  );

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleAddResponse = (message: string) => {
    const newResp: ComplaintResponseItem = {
      id: `resp-${Date.now()}`,
      complaint_id: complaint.id,
      user_id: "usr-admin",
      userName: "Administrator",
      userRole: "ADMIN",
      message,
      created_at: new Date().toISOString(),
    };
    setResponses((prev) => [...prev, newResp]);
  };

  const handleAssign = (_complaintId: string, staffId: string) => {
    const staff = MOCK_USERS.find((u) => u.id === staffId);
    setComplaint((prev) => ({
      ...prev,
      status: "ASSIGNED",
      assigned_to: staffId,
      assignedStaffName: staff?.name || "Staff Member",
      updated_at: new Date().toISOString(),
    }));
  };

  return (
    <DashboardLayout
      role="ADMIN"
      title={`Complaint Details - ${complaint.id}`}
      activeItem="complaints"
      onNavigate={onNavigate}
    >
      <div style={{ marginBottom: 16 }}>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to complaints list
          </Button>
        )}
      </div>

      <ComplaintDetails
        complaint={complaint}
        responses={responses}
        onAddResponse={handleAddResponse}
        onAssignClick={() => setIsAssignModalOpen(true)}
      />

      <AssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        complaint={complaint}
        staffMembers={MOCK_USERS}
        onAssign={handleAssign}
      />
    </DashboardLayout>
  );
};

export default AdminComplaintDetailsPage;
