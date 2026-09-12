import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import StatusUpdateModal from "../../components/complaints/StatusUpdateModal";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import {
  getComplaintById,
  getComplaintResponses,
  createComplaintResponse,
  updateComplaintStatus,
} from "../../services/complaintService";
import type {
  ComplaintItem,
  ComplaintResponseItem,
} from "../../types/complaints";

interface StaffComplaintDetailsProps {
  complaint?: ComplaintItem;
  complaintId?: string;
  onBack?: () => void;
  onNavigateTab?: (id: string) => void;
}

export const StaffComplaintDetailsPage: React.FC<
  StaffComplaintDetailsProps
> = ({
  complaint: initialComplaint,
  complaintId: propComplaintId,
  onBack,
  onNavigateTab,
}) => {
  const [complaint, setComplaint] =
    useState<ComplaintItem | null>(
      initialComplaint || null
    );

  const [responses, setResponses] =
    useState<ComplaintResponseItem[]>([]);

  const complaintId =
    initialComplaint?.id || propComplaintId;

  const [isLoading, setIsLoading] =
    useState<boolean>(Boolean(complaintId));

  const [error, setError] = useState("");
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    if (!complaintId) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
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

        const responseResult =
          await getComplaintResponses(complaintId);

        if (isMounted) {
          setComplaint(loadedComplaint || null);

          setResponses(
            responseResult.responses || []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load staff complaint details:",
          err
        );

        if (isMounted) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 403) {
              setError(
                "You do not have permission to access this complaint."
              );
            } else if (err.response?.status === 404) {
              setError("Complaint not found.");
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

    fetchData();

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

      setResponses((prev) => [
        ...prev,
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
        } else if (err.response?.status === 404) {
          setError(
            "Complaint not found."
          );
        } else {
          setError(
            "Unable to add your response. Please try again."
          );
        }
      } else {
        setError(
          "Unable to add your response. Please try again."
        );
      }
    }
  };

  const handleStatusUpdate = async (
    complaintIdToUpdate: string,
    nextStatus: "IN_PROGRESS" | "RESOLVED"
  ) => {
    try {
      setError("");
      setStatusSuccessMessage(null);

      const result = await updateComplaintStatus(
        complaintIdToUpdate,
        {
          status: nextStatus,
        }
      );

      setComplaint(result.complaint);
      setStatusSuccessMessage(
        `Task status successfully updated to ${
          nextStatus === "IN_PROGRESS" ? "In Progress" : "Resolved"
        }.`
      );
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error("Failed to update task status:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError("You can only update complaints assigned to you.");
        } else if (err.response?.status === 400) {
          setError(
            err.response.data?.detail || "Invalid task status transition."
          );
        } else if (err.response?.status === 404) {
          setError("Complaint not found.");
        } else {
          setError("Unable to update complaint status. Please try again.");
        }
      } else {
        setError("Unable to update complaint status. Please try again.");
      }
      throw err;
    }
  };

  return (
    <DashboardLayout
      role="STAFF"
      title={
        complaint
          ? `Task ${complaint.complaint_number} Details`
          : "Complaint Details"
      }
      activeItem="complaints"
      onNavigate={onNavigateTab}
    >
      <div style={{ marginBottom: 16 }}>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            ← Back to assigned complaints
          </Button>
        )}
      </div>

      {statusSuccessMessage && (
        <div
          style={{
            background: "var(--rx-success-bg)",
            color: "var(--rx-success)",
            border: "1px solid var(--rx-success-border, #A7F3D0)",
            padding: "12px 16px",
            borderRadius: "var(--rx-radius-md)",
            marginBottom: 16,
            fontSize: "0.875rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>✓ {statusSuccessMessage}</span>
          <button
            type="button"
            onClick={() => setStatusSuccessMessage(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--rx-success)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✕
          </button>
        </div>
      )}

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
            onUpdateStatusClick={() => setIsStatusModalOpen(true)}
          />

          <StatusUpdateModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            complaint={complaint}
            onUpdateStatus={handleStatusUpdate}
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

export default StaffComplaintDetailsPage;