import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import {
  getComplaints,
  updateComplaintStatus,
} from "../../services/complaintService";
import type {
  ComplaintItem,
  ComplaintFilterState,
} from "../../types/complaints";

interface StaffComplaintsProps {
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onNavigateTab?: (id: string) => void;
}

export const StaffComplaints: React.FC<StaffComplaintsProps> = ({
  onSelectComplaint,
  onNavigateTab,
}) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<ComplaintFilterState>({
    search: "",
    status: "",
    priority: "",
    department: "",
    category: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    const loadComplaints = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getComplaints({
          page: 1,
          limit: 100,
        });

        setComplaints(result.complaints || []);
      } catch (err) {
        console.error("Failed to load staff complaints:", err);
        setError(
          "Unable to load your assigned complaints. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    if (
      filters.search &&
      !complaint.title
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      !complaint.id
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.status &&
      complaint.status !== filters.status
    ) {
      return false;
    }

    if (
      filters.priority &&
      complaint.priority !== filters.priority
    ) {
      return false;
    }

    if (
      filters.department &&
      complaint.department !== filters.department
    ) {
      return false;
    }

    if (
      filters.category &&
      complaint.category !== filters.category
    ) {
      return false;
    }

    return true;
  });

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleUpdateStatus = async (
    complaint: ComplaintItem
  ) => {
    const nextStatus =
      complaint.status === "ASSIGNED"
        ? "IN_PROGRESS"
        : "RESOLVED";

    try {
      setError("");

      const result = await updateComplaintStatus(
        complaint.id,
        {
          status: nextStatus,
        }
      );

      const updatedComplaint =
        result.complaint;

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === updatedComplaint.id
            ? updatedComplaint
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update complaint status:",
        err
      );

      setError(
        "Unable to update the complaint status. Please try again."
      );
    }
  };

  const totalPages =
    Math.ceil(filteredComplaints.length / pageSize) || 1;

  return (
    <DashboardLayout
      role="STAFF"
      title="My Assigned Complaints"
      subtitle="Complaints assigned to your department workload queue"
      activeItem="complaints"
      onNavigate={onNavigateTab}
    >
      <Card
        title={`Assigned Tasks (${filteredComplaints.length})`}
      >
        <ComplaintFilters
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
        />

        {isLoading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
            }}
          >
            Loading your assigned complaints...
          </div>
        ) : error ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--rx-danger)",
            }}
          >
            {error}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--rx-text-secondary)",
            }}
          >
            No assigned complaints found.
          </div>
        ) : (
          <>
            <ComplaintTable
              complaints={paginatedComplaints}
              onViewDetails={onSelectComplaint}
              onUpdateStatus={handleUpdateStatus}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredComplaints.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default StaffComplaints;