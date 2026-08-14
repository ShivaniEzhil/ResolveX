import React from "react";
import type { StaffWorkload } from "../../types/analytics";
import Card from "../common/Card";
import EmptyState from "../common/EmptyState";
import "./dashboard.css";

interface StaffWorkloadTableProps {
  staffWorkload: StaffWorkload[];
  title?: string;
}

export const StaffWorkloadTable: React.FC<StaffWorkloadTableProps> = ({
  staffWorkload,
  title = "Staff Workload Overview",
}) => {
  return (
    <Card title={title}>
      {staffWorkload.length === 0 ? (
        <EmptyState
          title="No staff workload data"
          description="There are currently no active staff members found."
        />
      ) : (
        <div className="rx-table-container">
          <table className="rx-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Department</th>
                <th>Assigned</th>
                <th>In Progress</th>
                <th>Resolved</th>
                <th>Active Workload</th>
              </tr>
            </thead>
            <tbody>
              {staffWorkload.map((staff) => (
                <tr key={staff.staff_id}>
                  <td style={{ fontWeight: 500 }}>{staff.name}</td>
                  <td>{staff.department ?? "-"}</td>
                  <td>{staff.assigned}</td>
                  <td>{staff.in_progress}</td>
                  <td>{staff.resolved}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          staff.active_workload > 5
                            ? "var(--rx-danger)"
                            : "var(--rx-text-primary)",
                      }}
                    >
                      {staff.active_workload}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default StaffWorkloadTable;
