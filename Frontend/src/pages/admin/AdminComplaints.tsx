import React, { useCallback, useEffect, useState } from "react";
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

  const [totalItems, setTotalItems] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // Load complaints and staff members
  // ============================================================

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [
        complaintsResult,
        usersResult,
      ] = await Promise.all([
        getComplaints({
          search: filters.search || undefined,
          status_filter:
            filters.status || undefined,
          priority:
            filters.priority || undefined,
          department:
            filters.department || undefined,
          category:
            filters.category || undefined,
          page: currentPage,
          limit: PAGE_SIZE,
        }),
        getUsers(),
      ]);

      const loadedComplaints: ComplaintItem[] =
        complaintsResult.complaints || [];

      const loadedUsers: UserManagementItem[] =
        usersResult.users || [];

      // Create staff ID -> staff name mapping
      const staffMap = new Map(
        loadedUsers
          .filter(
            (user) => user.role === "STAFF"
          )
          .map((user) => [
            user.id,
            user.name,
          ])
      );

      // Add staff names for frontend display
      const complaintsWithStaffNames =
        loadedComplaints.map(
          (complaint) => ({
            ...complaint,

            assignedStaffName:
              complaint.assigned_to
                ? staffMap.get(
                    complaint.assigned_to
                  ) ||
                  complaint.assignedStaffName ||
                  "Staff Member"
                : undefined,
          })
        );

      setComplaints(
        complaintsWithStaffNames
      );

      setStaffMembers(
        loadedUsers
      );

      // Backend pagination information
      setTotalItems(
        complaintsResult.total || 0
      );

      setTotalPages(
        complaintsResult.total_pages || 0
      );

    } catch (err) {
      console.error(
        "Failed to load admin complaints:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (
          err.response?.status === 403
        ) {
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
  }, [
    currentPage,
    filters,
  ]);

  useEffect(() => {
    // API data fetching intentionally updates component state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // ============================================================
  // Filters
  // ============================================================

  const handleFilterChange = (
    nextFilters: ComplaintFilterState
  ) => {
    setFilters(nextFilters);

    // Always return to page 1 when filters change.
    setCurrentPage(1);
  };

  // ============================================================
  // Assignment
  // ============================================================

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
          (staff) =>
            staff.id === staffId
        );

      const updatedComplaintWithStaffName:
        ComplaintItem = {
          ...updatedComplaint,

          assignedStaffName:
            assignedStaff?.name ||
            updatedComplaint.assignedStaffName ||
            "Staff Member",
        };

      setComplaints(
        (previous) =>
          previous.map(
            (complaint) =>
              complaint.id ===
              complaintId
                ? updatedComplaintWithStaffName
                : complaint
          )
      );

      setAssignModalComplaint(
        null
      );

    } catch (err) {
      console.error(
        "Failed to assign complaint:",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        if (
          err.response?.status === 403
        ) {
          setError(
            "You do not have permission to assign this complaint."
          );
        } else if (
          err.response?.status === 404
        ) {
          setError(
            "Complaint or staff member not found."
          );
        } else if (
          err.response?.status === 400
        ) {
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

  // ============================================================
  // Loading state
  // ============================================================

  if (isLoading) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="Complaint Management"
        activeItem="complaints"
        onNavigate={onNavigate}
      >
        <LoadingState
          message="Loading complaints and staff members..."
        />
      </DashboardLayout>
    );
  }

  // ============================================================
  // Error state
  // ============================================================

  if (
    error &&
    complaints.length === 0
  ) {
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

  // ============================================================
  // Main UI
  // ============================================================

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
        title={`All Complaints (${totalItems})`}
        subtitle="Manage end-to-end complaint lifecycle and staff assignments"
      >
        <ComplaintFilters
          filters={filters}
          onChange={handleFilterChange}
        />

        <ComplaintTable
          complaints={complaints}
          onViewDetails={
            onSelectComplaint
          }
          onAssign={(complaint) =>
            setAssignModalComplaint(
              complaint
            )
          }
          onUpdateStatus={(complaint) =>
            onSelectComplaint &&
            onSelectComplaint(
              complaint
            )
          }
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={
            setCurrentPage
          }
        />
      </Card>

      <AssignmentModal
        isOpen={
          !!assignModalComplaint
        }
        onClose={() =>
          setAssignModalComplaint(
            null
          )
        }
        complaint={
          assignModalComplaint
        }
        staffMembers={
          staffMembers
        }
        onAssign={
          handleAssign
        }
      />
    </DashboardLayout>
  );
};

export default AdminComplaints;