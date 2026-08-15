import React, { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";

import { getAuditLogs } from "../../services/auditService";

import type { AuditActivity } from "../../types/analytics";

interface AdminAuditLogsProps {
  onNavigate?: (id: string) => void;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({
  onNavigate,
}) => {
  const [logs, setLogs] = useState<AuditActivity[]>([]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const [selectedLog, setSelectedLog] =
    useState<AuditActivity | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // Load audit logs from backend
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const loadAuditLogs = async () => {
      try {
        setError("");

        const result = await getAuditLogs();

        if (isMounted) {
          setLogs(result.audit_logs || []);
        }
      } catch (err) {
        console.error(
          "Failed to load audit logs:",
          err
        );

        if (isMounted) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 403) {
              setError(
                "You do not have permission to view audit logs."
              );
            } else {
              setError(
                "Unable to load audit logs. Please try again."
              );
            }
          } else {
            setError(
              "Unable to load audit logs. Please try again."
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // Filter logs
  // ============================================================

  const filteredLogs = logs.filter((log) => {
    if (
      search &&
      !log.description
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !log.action
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !(log.complaint_id || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }

    if (
      actionFilter &&
      log.action !== actionFilter
    ) {
      return false;
    }

    return true;
  });

  // ============================================================
  // Loading
  // ============================================================

  if (isLoading) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="System Audit Logs"
        activeItem="audit-logs"
        onNavigate={onNavigate}
      >
        <LoadingState message="Loading audit logs..." />
      </DashboardLayout>
    );
  }

  // ============================================================
  // Initial error
  // ============================================================

  if (error && logs.length === 0) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="System Audit Logs"
        activeItem="audit-logs"
        onNavigate={onNavigate}
      >
        <ErrorState
          message={error}
          onRetry={() => window.location.reload()}
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
      title="System Audit Logs"
      subtitle="Complete immutable event log for compliance and complaint action tracking"
      activeItem="audit-logs"
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
        title={`Audit Events (${filteredLogs.length})`}
      >
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
            placeholder="Search action, complaint ID, or description..."
          />

          <FilterDropdown
            label="Action"
            value={actionFilter}
            onChange={setActionFilter}
            allLabel="All Actions"
            options={[
              {
                value: "COMPLAINT_CREATED",
                label: "Complaint Created",
              },
              {
                value: "COMPLAINT_ASSIGNED",
                label: "Complaint Assigned",
              },
              {
                value: "STATUS_CHANGED",
                label: "Status Changed",
              },
              {
                value: "RESPONSE_ADDED",
                label: "Response Added",
              },
              {
                value: "USER_ROLE_CHANGED",
                label: "Role Changed",
              },
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
                  <th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td
                      style={{
                        color:
                          "var(--rx-text-muted)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </td>

                    <td
                      style={{
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {log.action}
                    </td>

                    <td
                      style={{
                        maxWidth: 320,
                      }}
                    >
                      {log.description}
                    </td>

                    <td
                      style={{
                        fontFamily:
                          "var(--rx-font-mono)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {log.complaint_id || "-"}
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedLog(log)
                        }
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
            <div
              style={{
                marginBottom: 12,
              }}
            >
              <span className="rx-meta-label">
                Action
              </span>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {selectedLog.action}
              </div>
            </div>

            <div
              style={{
                marginBottom: 12,
              }}
            >
              <span className="rx-meta-label">
                Description
              </span>

              <div>
                {selectedLog.description}
              </div>
            </div>

            <div
              style={{
                marginBottom: 12,
              }}
            >
              <span className="rx-meta-label">
                Timestamp
              </span>

              <div>
                {new Date(
                  selectedLog.created_at
                ).toLocaleString()}
              </div>
            </div>

            {selectedLog.complaint_id && (
              <div
                style={{
                  marginBottom: 12,
                }}
              >
                <span className="rx-meta-label">
                  Complaint ID
                </span>

                <div
                  style={{
                    fontFamily:
                      "var(--rx-font-mono)",
                  }}
                >
                  {selectedLog.complaint_id}
                </div>
              </div>
            )}

            {selectedLog.user_id && (
              <div
                style={{
                  marginBottom: 12,
                }}
              >
                <span className="rx-meta-label">
                  User ID
                </span>

                <div
                  style={{
                    fontFamily:
                      "var(--rx-font-mono)",
                  }}
                >
                  {selectedLog.user_id}
                </div>
              </div>
            )}

            {selectedLog.metadata &&
              Object.keys(
                selectedLog.metadata
              ).length > 0 && (
                <div>
                  <span className="rx-meta-label">
                    Metadata
                  </span>

                  <pre
                    style={{
                      background:
                        "var(--rx-gray-100)",
                      padding: 12,
                      borderRadius:
                        "var(--rx-radius-md)",
                      fontSize: "0.8125rem",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(
                      selectedLog.metadata,
                      null,
                      2
                    )}
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