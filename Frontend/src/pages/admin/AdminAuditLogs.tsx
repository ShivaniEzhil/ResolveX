import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { MOCK_AUDIT_LOGS } from "../../data/mockData";
import type { AuditActivity } from "../../types/analytics";

interface AdminAuditLogsProps {
  onNavigate?: (id: string) => void;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ onNavigate }) => {
  const [logs] = useState<AuditActivity[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditActivity | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (
      search &&
      !log.description.toLowerCase().includes(search.toLowerCase()) &&
      !log.action.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (actionFilter && log.action !== actionFilter) return false;
    return true;
  });

  return (
    <DashboardLayout
      role="ADMIN"
      title="System Audit Logs"
      subtitle="Complete immutable event log for compliance and complaint action tracking"
      activeItem="audit-logs"
      onNavigate={onNavigate}
    >
      <Card title={`Audit Events (${filteredLogs.length})`}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search action or log description..."
          />

          <FilterDropdown
            label="Action"
            value={actionFilter}
            onChange={setActionFilter}
            allLabel="All Actions"
            options={[
              { value: "COMPLAINT_CREATED", label: "Complaint Created" },
              { value: "COMPLAINT_ASSIGNED", label: "Complaint Assigned" },
              { value: "STATUS_CHANGED", label: "Status Changed" },
              { value: "RESPONSE_ADDED", label: "Response Added" },
              { value: "USER_ROLE_CHANGED", label: "Role Changed" },
            ]}
          />
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No audit events found"
            description="No system logs match your current search parameters."
          />
        ) : (
          <div className="rx-table-container">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Complaint ID</th>
                  <th style={{ textAlign: "right" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--rx-text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                      {log.action}
                    </td>
                    <td style={{ maxWidth: 320 }}>{log.description}</td>
                    <td style={{ fontFamily: "var(--rx-font-mono)", fontSize: "0.8125rem" }}>
                      {log.complaint_id || "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Metadata"
      >
        {selectedLog && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <span className="rx-meta-label">Action</span>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{selectedLog.action}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span className="rx-meta-label">Description</span>
              <div>{selectedLog.description}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span className="rx-meta-label">Timestamp</span>
              <div>{new Date(selectedLog.created_at).toLocaleString()}</div>
            </div>
            {selectedLog.metadata && (
              <div>
                <span className="rx-meta-label">Metadata</span>
                <pre
                  style={{
                    background: "var(--rx-gray-100)",
                    padding: 12,
                    borderRadius: "var(--rx-radius-md)",
                    fontSize: "0.8125rem",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
