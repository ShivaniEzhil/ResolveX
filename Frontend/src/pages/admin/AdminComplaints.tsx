import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import AssignmentModal from "../../components/complaints/AssignmentModal";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import { MOCK_COMPLAINTS, MOCK_USERS } from "../../data/mockData";
import type { ComplaintItem, ComplaintFilterState } from "../../types/complaints";

interface AdminComplaintsProps {
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onNavigate?: (id: string) => void;
}

export const AdminComplaints: React.FC<AdminComplaintsProps> = ({
  onSelectComplaint,
  onNavigate,
}) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(MOCK_COMPLAINTS);
  const [filters, setFilters] = useState<ComplaintFilterState>({
    search: "",
    status: "",
    priority: "",
    department: "",
    category: "",
  });
  const [assignModalComplaint, setAssignModalComplaint] =
    useState<ComplaintItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredComplaints = complaints.filter((c) => {
    if (
      filters.search &&
      !c.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !c.id.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.status && c.status !== filters.status) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    if (filters.department && c.department !== filters.department) return false;
    return true;
  });

  const handleAssign = (complaintId: string, staffId: string) => {
    const staff = MOCK_USERS.find((u) => u.id === staffId);
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: "ASSIGNED",
              assigned_to: staffId,
              assignedStaffName: staff?.name || "Staff Member",
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  return (
    <DashboardLayout
      role="ADMIN"
      title="Complaint Management"
      subtitle="View, filter, assign, and manage institutional complaints"
      activeItem="complaints"
      onNavigate={onNavigate}
    >
      <Card
        title={`All Complaints (${filteredComplaints.length})`}
        subtitle="Manage end-to-end complaint lifecycle and staff assignments"
      >
        <ComplaintFilters filters={filters} onChange={setFilters} />

        <ComplaintTable
          complaints={filteredComplaints}
          onViewDetails={onSelectComplaint}
          onAssign={(c) => setAssignModalComplaint(c)}
          onUpdateStatus={(c) => onSelectComplaint && onSelectComplaint(c)}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredComplaints.length / pageSize) || 1}
          totalItems={filteredComplaints.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      <AssignmentModal
        isOpen={!!assignModalComplaint}
        onClose={() => setAssignModalComplaint(null)}
        complaint={assignModalComplaint}
        staffMembers={MOCK_USERS}
        onAssign={handleAssign}
      />
    </DashboardLayout>
  );
};

export default AdminComplaints;
