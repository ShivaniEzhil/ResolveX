import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { MOCK_USERS } from "../../data/mockData";
import type { UserManagementItem, UserFilterState } from "../../types/users";

interface AdminUsersProps {
  onNavigate?: (id: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserManagementItem[]>(MOCK_USERS);
  const [filters, setFilters] = useState<UserFilterState>({
    search: "",
    role: "",
    status: "",
    department: "",
  });

  const [selectedUser, setSelectedUser] = useState<UserManagementItem | null>(null);
  const [modalType, setModalType] = useState<"role" | "status" | "department" | null>(null);

  const [newRole, setNewRole] = useState<string>("STAFF");
  const [newDepartment, setNewDepartment] = useState<string>("IT");

  const filteredUsers = users.filter((u) => {
    if (
      filters.search &&
      !u.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !u.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.role && u.role !== filters.role) return false;
    if (filters.status && String(u.is_active) !== filters.status) return false;
    if (filters.department && u.department !== filters.department) return false;
    return true;
  });

  const handleConfirmAction = () => {
    if (!selectedUser || !modalType) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== selectedUser.id) return u;
        if (modalType === "role") return { ...u, role: newRole as any };
        if (modalType === "status") return { ...u, is_active: !u.is_active };
        if (modalType === "department") return { ...u, department: newDepartment };
        return u;
      })
    );

    setModalType(null);
    setSelectedUser(null);
  };

  return (
    <DashboardLayout
      role="ADMIN"
      title="User Management"
      subtitle="Manage institutional user accounts, roles, departments, and active statuses"
      activeItem="users"
      onNavigate={onNavigate}
    >
      <Card title={`Users (${filteredUsers.length})`}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <SearchBar
            value={filters.search}
            onChange={(val) => setFilters({ ...filters, search: val })}
            placeholder="Search name or email..."
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <FilterDropdown
              label="Role"
              value={filters.role}
              onChange={(val) => setFilters({ ...filters, role: val })}
              options={[
                { value: "ADMIN", label: "Admin" },
                { value: "STAFF", label: "Staff" },
                { value: "STUDENT", label: "Student" },
              ]}
              allLabel="All Roles"
            />

            <FilterDropdown
              label="Status"
              value={filters.status}
              onChange={(val) => setFilters({ ...filters, status: val })}
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              allLabel="All Statuses"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Adjust your search criteria to view matching users."
          />
        ) : (
          <div className="rx-table-container">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <Badge
                        variant={
                          u.role === "ADMIN"
                            ? "warning"
                            : u.role === "STAFF"
                            ? "primary"
                            : "default"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td>{u.department || "-"}</td>
                    <td>
                      <Badge variant={u.is_active ? "success" : "danger"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td style={{ color: "var(--rx-text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        {u.role !== "ADMIN" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role === "STUDENT" ? "STAFF" : "STUDENT");
                              setModalType("role");
                            }}
                          >
                            Change Role
                          </Button>
                        )}
                        {u.role === "STAFF" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewDepartment(u.department || "IT");
                              setModalType("department");
                            }}
                          >
                            Dept
                          </Button>
                        )}
                        {u.role !== "ADMIN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setModalType("status");
                            }}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for User Management Actions */}
      <Modal
        isOpen={!!modalType}
        onClose={() => {
          setModalType(null);
          setSelectedUser(null);
        }}
        title={`Modify ${selectedUser?.name}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setModalType(null);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAction}>
              Confirm Action
            </Button>
          </>
        }
      >
        {modalType === "role" && (
          <div>
            <p style={{ fontSize: "0.875rem", marginBottom: 12 }}>
              Select new role for <strong>{selectedUser?.name}</strong>:
            </p>
            <select
              className="rx-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="STUDENT">STUDENT</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>
        )}

        {modalType === "status" && (
          <div>
            <p style={{ fontSize: "0.875rem" }}>
              Are you sure you want to{" "}
              <strong>{selectedUser?.is_active ? "deactivate" : "activate"}</strong>{" "}
              the account for <strong>{selectedUser?.name}</strong>?
            </p>
          </div>
        )}

        {modalType === "department" && (
          <div>
            <p style={{ fontSize: "0.875rem", marginBottom: 12 }}>
              Assign department for staff <strong>{selectedUser?.name}</strong>:
            </p>
            <select
              className="rx-select"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="IT">IT</option>
              <option value="ELECTRICAL">ELECTRICAL</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="TRANSPORT">TRANSPORT</option>
              <option value="ACADEMICS">ACADEMICS</option>
              <option value="HOSTEL">HOSTEL</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsers;
