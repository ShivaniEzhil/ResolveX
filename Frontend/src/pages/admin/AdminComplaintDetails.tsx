import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import AssignmentModal from "../../components/complaints/AssignmentModal";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import {
  getComplaintById,
  getComplaintResponses,
  createComplaintResponse,
  assignComplaint,
} from "../../services/complaintService";
import { getUsers } from "../../services/userService";
import type {
  ComplaintItem,
  ComplaintResponseItem,
} from "../../types/complaints";
import type { UserManagementItem } from "../../types/users";

interface AdminComplaintDetailsProps {
  complaint?: ComplaintItem;
  complaintId?: string;
  onBack?: () => void;
  onNavigate?: (id: string) => void;
}

export const AdminComplaintDetailsPage: React.FC<
  AdminComplaintDetailsProps
> = ({
  complaint: initialComplaint,
  complaintId: propComplaintId,
  onBack,
  onNavigate,
}) => {
  const [complaint, setComplaint] =
    useState<ComplaintItem | null>(
      initialComplaint || null
    );

  const [responses, setResponses] =
    useState<ComplaintResponseItem[]>([]);

  const [staffMembers, setStaffMembers] =
    useState<UserManagementItem[]>([]);

  const complaintId =
    initialComplaint?.id || propComplaintId;

  const [isLoading, setIsLoading] =
    useState<boolean>(Boolean(complaintId));

  const [error, setError] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] =
    useState(false);

  useEffect(() => {
    if (!complaintId) {
      return;
    }

    let isMounted = true;

    const loadComplaintDetails = async () => {
      setIsLoading(true);
      setError("");

      try {
        let loadedComplaint = initialComplaint;

        if (
          !loadedComplaint ||
          loadedComplaint.id !== complaintId
        ) {
          const result =
            await getComplaintById(complaintId);

          loadedComplaint = result.complaint;
        }

        const [
          responseResult,
          usersResult,
        ] = await Promise.all([
          getComplaintResponses(complaintId),
          getUsers(),
        ]);

        if (isMounted) {
          setComplaint(
            loadedComplaint || null
          );

          setResponses(
            responseResult.responses || []
          );

          setStaffMembers(
            usersResult.users || []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load admin complaint details:",
          err
        );

        if (isMounted) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 403) {
              setError(
                "You do not have permission to access this complaint."
              );
            } else if (
              err.response?.status === 404
            ) {
              setError(
                "Complaint not found."
              );
            } else {
              setError(
                "Unable to load complaint details. Please try again."
              );
            }
          } else {
            setError(
              "Unable to load complaint details. Please try again."
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadComplaintDetails();

    return () => {
      isMounted = false;
    };
  }, [complaintId, initialComplaint]);

  const handleAddResponse = async (
    message: string
  ) => {
    if (!complaint) {
      return;
    }

    try {
      setError("");

      const result =
        await createComplaintResponse(
          complaint.id,
          {
            message,
          }
        );

      const createdResponse =
        result.response;

      setResponses((previous) => [
        ...previous,
        createdResponse,
      ]);
    } catch (err) {
      console.error(
        "Failed to add complaint response:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to add a response to this complaint."
          );
        } else if (
          err.response?.status === 404
        ) {
          setError(
            "Complaint not found."
          );
        } else {
          setError(
            "Unable to add response. Please try again."
          );
        }
      } else {
        setError(
          "Unable to add response. Please try again."
        );
      }
    }
  };

  const handleAssign = async (
    complaintIdToAssign: string,
    staffId: string
  ) => {
    try {
      setError("");

      const result =
        await assignComplaint(
          complaintIdToAssign,
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

      setComplaint({
        ...updatedComplaint,
        assignedStaffName:
          assignedStaff?.name || staffId,
      });

      setIsAssignModalOpen(false);
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

  return (
    <DashboardLayout
      role="ADMIN"
      title={
        complaint
          ? `Complaint Details - ${complaint.complaint_number}`
          : "Complaint Details"
      }
      activeItem="complaints"
      onNavigate={onNavigate}
    >
      <div style={{ marginBottom: 16 }}>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            ← Back to complaints list
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <div
            style={{
              padding: 40,
              textAlign: "center",
            }}
          >
            Loading complaint details...
          </div>
        </Card>
      ) : error && !complaint ? (
        <Card>
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--rx-danger)",
            }}
          >
            {error}
          </div>
        </Card>
      ) : complaint ? (
        <>
          {error && (
            <Card>
              <div
                style={{
                  padding: 16,
                  marginBottom: 16,
                  color: "var(--rx-danger)",
                }}
              >
                {error}
              </div>
            </Card>
          )}

          <ComplaintDetails
            complaint={complaint}
            responses={responses}
            onAddResponse={handleAddResponse}
            onAssignClick={() =>
              setIsAssignModalOpen(true)
            }
          />

          <AssignmentModal
            isOpen={isAssignModalOpen}
            onClose={() =>
              setIsAssignModalOpen(false)
            }
            complaint={complaint}
            staffMembers={staffMembers}
            onAssign={handleAssign}
          />
        </>
      ) : (
        <Card>
          <div
            style={{
              padding: 40,
              textAlign: "center",
            }}
          >
            No complaint selected.
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AdminComplaintDetailsPage;