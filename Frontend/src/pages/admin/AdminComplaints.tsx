import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import AssignmentModal from "../../components/complaints/AssignmentModal";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import {
  getComplaints,
  assignComplaint,
} from "../../services/complaintService";
import { getUsers } from "../../services/userService";
import type {
  ComplaintItem,
  ComplaintFilterState,
} from "../../types/complaints";
import type { UserManagementItem } from "../../types/users";

interface AdminComplaintsProps {
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onNavigate?: (id: string) => void;
}

const PAGE_SIZE = 10;

export const AdminComplaints: React.FC<
  AdminComplaintsProps
> = ({
  onSelectComplaint,
  onNavigate,
}) => {
  const [complaints, setComplaints] =
    useState<ComplaintItem[]>([]);

  const [staffMembers, setStaffMembers] =
    useState<UserManagementItem[]>([]);

  const [filters, setFilters] =
    useState<ComplaintFilterState>({
      search: "",
      status: "",
      priority: "",
      department: "",
      category: "",
    });

  const [assignModalComplaint, setAssignModalComplaint] =
    useState<ComplaintItem | null>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [
        complaintsResult,
        usersResult,
      ] = await Promise.all([
        getComplaints(),
        getUsers(),
      ]);

      const loadedComplaints: ComplaintItem[] =
        complaintsResult.complaints || [];

      const loadedUsers: UserManagementItem[] =
        usersResult.users || [];

      const staffMap = new Map(
        loadedUsers
          .filter((user) => user.role === "STAFF")
          .map((user) => [user.id, user.name])
      );

      const complaintsWithStaffNames = loadedComplaints.map(
        (complaint) => ({
          ...complaint,
          assignedStaffName: complaint.assigned_to
            ? staffMap.get(complaint.assigned_to) || complaint.assigned_to
            : undefined,
        })
      );

      setComplaints(complaintsWithStaffNames);
      setStaffMembers(loadedUsers);
    } catch (err) {
      console.error(
        "Failed to load admin complaints:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to access complaint management."
          );
        } else {
          setError(
            "Unable to load complaints and staff members. Please try again."
          );
        }
      } else {
        setError(
          "Unable to load complaints and staff members. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // API data fetching intentionally updates component state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const filteredComplaints =
    complaints.filter((complaint) => {
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

  const totalPages =
    Math.ceil(
      filteredComplaints.length / PAGE_SIZE
    ) || 1;

  const paginatedComplaints =
    filteredComplaints.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

  const handleFilterChange = (
    nextFilters: ComplaintFilterState
  ) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  const handleAssign = async (
    complaintId: string,
    staffId: string
  ) => {
    try {
      setError("");

      const result =
        await assignComplaint(
          complaintId,
          {
            staff_id: staffId,
          }
        );

      const updatedComplaint: ComplaintItem =
        result.complaint;

      const assignedStaff =
        staffMembers.find(
          (staff) => staff.id === staffId
        );

      const updatedComplaintWithStaffName: ComplaintItem = {
        ...updatedComplaint,
        assignedStaffName:
          assignedStaff?.name || staffId,
      };

      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.id === complaintId
            ? updatedComplaintWithStaffName
            : complaint
        )
      );

      setAssignModalComplaint(null);
    } catch (err) {
      console.error(
        "Failed to assign complaint:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to assign this complaint."
          );
        } else if (err.response?.status === 404) {
          setError(
            "Complaint or staff member not found."
          );
        } else if (err.response?.status === 400) {
          setError(
            err.response.data?.detail ||
              "Unable to assign this complaint."
          );
        } else {
          setError(
            "Unable to assign complaint. Please try again."
          );
        }
      } else {
        setError(
          "Unable to assign complaint. Please try again."
        );
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="Complaint Management"
        activeItem="complaints"
        onNavigate={onNavigate}
      >
        <LoadingState message="Loading complaints and staff members..." />
      </DashboardLayout>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="Complaint Management"
        activeItem="complaints"
        onNavigate={onNavigate}
      >
        <ErrorState
          message={error}
          onRetry={loadData}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="ADMIN"
      title="Complaint Management"
      subtitle="View, filter, assign, and manage institutional complaints"
      activeItem="complaints"
      onNavigate={onNavigate}
    >
      {error && (
        <Card>
          <div
            style={{
              padding: 16,
              color: "var(--rx-danger)",
            }}
          >
            {error}
          </div>
        </Card>
      )}

      <Card
        title={`All Complaints (${filteredComplaints.length})`}
        subtitle="Manage end-to-end complaint lifecycle and staff assignments"
      >
        <ComplaintFilters
          filters={filters}
          onChange={handleFilterChange}
        />

        <ComplaintTable
          complaints={paginatedComplaints}
          onViewDetails={onSelectComplaint}
          onAssign={(complaint) =>
            setAssignModalComplaint(complaint)
          }
          onUpdateStatus={(complaint) =>
            onSelectComplaint &&
            onSelectComplaint(complaint)
          }
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredComplaints.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </Card>

      <AssignmentModal
        isOpen={!!assignModalComplaint}
        onClose={() =>
          setAssignModalComplaint(null)
        }
        complaint={assignModalComplaint}
        staffMembers={staffMembers}
        onAssign={handleAssign}
      />
    </DashboardLayout>
  );
};

export default AdminComplaints;