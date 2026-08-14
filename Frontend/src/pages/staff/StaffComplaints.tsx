import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import { MOCK_COMPLAINTS } from "../../data/mockData";
import type { ComplaintItem, ComplaintFilterState } from "../../types/complaints";

interface StaffComplaintsProps {
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onNavigateTab?: (id: string) => void;
}

export const StaffComplaints: React.FC<StaffComplaintsProps> = ({
  onSelectComplaint,
  onNavigateTab,
}) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(MOCK_COMPLAINTS);
  const [filters, setFilters] = useState<ComplaintFilterState>({
    search: "",
    status: "",
    priority: "",
    department: "",
    category: "",
  });
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
    return true;
  });

  const handleUpdateStatus = (complaint: ComplaintItem) => {
    const nextStatus = complaint.status === "ASSIGNED" ? "IN_PROGRESS" : "RESOLVED";
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaint.id
          ? { ...c, status: nextStatus as any, updated_at: new Date().toISOString() }
          : c
      )
    );
  };

  return (
    <DashboardLayout
      role="STAFF"
      title="My Assigned Complaints"
      subtitle="Complaints assigned to your department workload queue"
      activeItem="complaints"
      onNavigate={onNavigateTab}
    >
      <Card title={`Assigned Tasks (${filteredComplaints.length})`}>
        <ComplaintFilters filters={filters} onChange={setFilters} />

        <ComplaintTable
          complaints={filteredComplaints}
          onViewDetails={onSelectComplaint}
          onUpdateStatus={handleUpdateStatus}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredComplaints.length / pageSize) || 1}
          totalItems={filteredComplaints.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </DashboardLayout>
  );
};

export default StaffComplaints;
