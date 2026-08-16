import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import type { ComplaintItem } from "../../types/complaints";
import type { UserManagementItem } from "../../types/users";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintItem | null;
  staffMembers: UserManagementItem[];
  onAssign: (complaintId: string, staffId: string) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  complaint,
  staffMembers,
  onAssign,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState("");

  if (!complaint) return null;

  const filteredStaff = staffMembers.filter(
    (s) => s.role === "STAFF" && s.is_active
  );

  const handleConfirm = () => {
    if (!selectedStaffId) return;
    onAssign(complaint.id, selectedStaffId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Complaint ${complaint.complaint_number}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selectedStaffId}
            onClick={handleConfirm}
          >
            Assign Complaint
          </Button>
        </>
      }
    >
      <div>
        <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "var(--rx-text-secondary)" }}>
          Assign <strong>"{complaint.title}"</strong> ({complaint.department} department) to an active staff member.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredStaff.length === 0 ? (
            <p style={{ color: "var(--rx-text-muted)", fontSize: "0.875rem" }}>
              No active staff members available.
            </p>
          ) : (
            filteredStaff.map((staff) => {
              const isSelected = selectedStaffId === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "var(--rx-radius-md)",
                    border: `1px solid ${
                      isSelected ? "var(--rx-primary)" : "var(--rx-border)"
                    }`,
                    background: isSelected
                      ? "var(--rx-primary-light)"
                      : "var(--rx-surface)",
                    cursor: "pointer",
                    transition: "all var(--rx-transition-fast)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {staff.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--rx-text-muted)" }}>
                      Dept: {staff.department || "General"} • {staff.email}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="staff_select"
                    checked={isSelected}
                    onChange={() => setSelectedStaffId(staff.id)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AssignmentModal;
