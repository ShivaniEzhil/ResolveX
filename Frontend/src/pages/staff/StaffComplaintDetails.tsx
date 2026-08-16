import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
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

  const handleStatusChange = async () => {
    if (!complaint) {
      return;
    }

    const nextStatus =
      complaint.status === "ASSIGNED"
        ? "IN_PROGRESS"
        : "RESOLVED";

    try {
      setError("");

      const result =
        await updateComplaintStatus(
          complaint.id,
          {
            status: nextStatus,
          }
        );

      setComplaint(result.complaint);
    } catch (err) {
      console.error(
        "Failed to update complaint status:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You can only update complaints assigned to you."
          );
        } else if (err.response?.status === 400) {
          setError(
            err.response.data?.detail ||
              "Invalid complaint status transition."
          );
        } else if (err.response?.status === 404) {
          setError(
            "Complaint not found."
          );
        } else {
          setError(
            "Unable to update complaint status. Please try again."
          );
        }
      } else {
        setError(
          "Unable to update complaint status. Please try again."
        );
      }
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
            onUpdateStatusClick={
              handleStatusChange
            }
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