import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ComplaintFilters from "../../components/complaints/ComplaintFilters";
import ComplaintCard from "../../components/complaints/ComplaintCard";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { getComplaints } from "../../services/complaintService";
import type { ComplaintItem, ComplaintFilterState } from "../../types/complaints";

interface MyComplaintsProps {
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onNavigateTab?: (id: string) => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
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

  useEffect(() => {
    const loadComplaints = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getComplaints();

        setComplaints(result.complaints || []);
      } catch (err) {
        console.error("Failed to load complaints:", err);
        setError("Unable to load your complaints. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (
      filters.search &&
      !c.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !c.complaint_number.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.status && c.status !== filters.status) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    return true;
  });

  return (
    <DashboardLayout
      role="STUDENT"
      title="My Submitted Complaints"
      subtitle="Track live status and resolution updates for your issues"
      activeItem="my-complaints"
      onNavigate={onNavigateTab}
    >
      <Card
        title={`My Tickets (${filteredComplaints.length})`}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab && onNavigateTab("submit-complaint")}
          >
            + New Complaint
          </Button>
        }
      >
        <ComplaintFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            Loading your complaints...
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
          <EmptyState
            title="No complaints found"
            description="You haven't submitted any complaints matching this search criteria."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {filteredComplaints.map((c) => (
              <ComplaintCard
                key={c.complaint_number}
                complaint={c}
                onClick={() =>
                  onSelectComplaint && onSelectComplaint(c)
                }
              />
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default MyComplaints;
