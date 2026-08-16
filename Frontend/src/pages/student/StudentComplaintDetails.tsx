import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintDetails from "../../components/complaints/ComplaintDetails";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { getComplaintById, getComplaintResponses } from "../../services/complaintService";
import type { ComplaintItem, ComplaintResponseItem } from "../../types/complaints";

interface StudentComplaintDetailsProps {
  complaint?: ComplaintItem;
  complaintId?: string;
  onBack?: () => void;
  onNavigateTab?: (id: string) => void;
}

export const StudentComplaintDetailsPage: React.FC<StudentComplaintDetailsProps> = ({
  complaint: initialComplaint,
  complaintId: propComplaintId,
  onBack,
  onNavigateTab,
}) => {
  const [complaint, setComplaint] = useState<ComplaintItem | null>(initialComplaint || null);
  const [responses, setResponses] = useState<ComplaintResponseItem[]>([]);
  const complaintId = initialComplaint?.id || propComplaintId;
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(complaintId));
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!complaintId) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setError("");

      try {
        let loadedComplaint = initialComplaint;
        if (!loadedComplaint || loadedComplaint.id !== complaintId) {
          const res = await getComplaintById(complaintId);
          loadedComplaint = res.complaint;
        }

        const respRes = await getComplaintResponses(complaintId);

        if (isMounted) {
          setComplaint(loadedComplaint || null);
          setResponses(respRes.responses || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load complaint details:", err);
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 403) {
              setError("You do not have permission to access this complaint.");
            } else if (err.response?.status === 404) {
              setError("Complaint not found.");
            } else {
              setError("Unable to load complaint details. Please try again.");
            }
          } else {
            setError("Unable to load complaint details. Please try again.");
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

  return (
    <DashboardLayout
      role="STUDENT"
      title={complaint ? `Ticket #${complaint.complaint_number}` : "Complaint Details"}
      activeItem="my-complaints"
      onNavigate={onNavigateTab}
    >
      <div style={{ marginBottom: 16 }}>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to my complaints
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <div style={{ padding: 40, textAlign: "center" }}>
            Loading complaint details...
          </div>
        </Card>
      ) : error ? (
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
        <ComplaintDetails
          complaint={complaint}
          responses={responses}
          showInternalAIInfo={false}
        />
      ) : (
        <Card>
          <div style={{ padding: 40, textAlign: "center" }}>
            No complaint selected.
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default StudentComplaintDetailsPage;
