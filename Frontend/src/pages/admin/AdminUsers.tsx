import React, { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";

import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  updateUserDepartment,
} from "../../services/userService";

import type { UserManagementItem, UserFilterState } from "../../types/users";
import type { UserRole } from "../../types/auth";

interface AdminUsersProps {
  onNavigate?: (id: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  onNavigate,
}) => {
  // ============================================================
  // Users
  // ============================================================

  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // Filters
  // ============================================================

  const [filters, setFilters] =
    useState<UserFilterState>({
      search: "",
      role: "",
      status: "",
      department: "",
    });

  // ============================================================
  // Modal state
  // ============================================================

  const [selectedUser, setSelectedUser] =
    useState<UserManagementItem | null>(null);

  const [modalType, setModalType] =
    useState<
      "role" | "status" | "department" | null
    >(null);

  const [newRole, setNewRole] =
    useState<UserRole>("STAFF");

  const [newDepartment, setNewDepartment] =
    useState("IT");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ============================================================
  // Load users from backend
  // ============================================================

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await getUsers();

      setUsers(result.users || []);
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to manage users."
          );
        } else {
          setError(
            "Unable to load users. Please try again."
          );
        }
      } else {
        setError(
          "Unable to load users. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setError("");

        const result = await getUsers();

        if (isMounted) {
          setUsers(result.users || []);
        }
      } catch (err) {
        console.error(
          "Failed to load users:",
          err
        );

        if (isMounted) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 403) {
              setError(
                "You do not have permission to manage users."
              );
            } else {
              setError(
                "Unable to load users. Please try again."
              );
            }
          } else {
            setError(
              "Unable to load users. Please try again."
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // Filtering
  // ============================================================

  const filteredUsers = users.filter((user) => {
    if (
      filters.search &&
      !user.name
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      !user.email
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.role &&
      user.role !== filters.role
    ) {
      return false;
    }

    if (
      filters.status &&
      String(user.is_active) !== filters.status
    ) {
      return false;
    }

    if (
      filters.department &&
      user.department !== filters.department
    ) {
      return false;
    }

    return true;
  });

  // ============================================================
  // Open role modal
  // ============================================================

  const handleOpenRoleModal = (
    user: UserManagementItem
  ) => {
    setSelectedUser(user);

    setNewRole(
      user.role === "STUDENT"
        ? "STAFF"
        : "STUDENT"
    );

    setModalType("role");
    setError("");
  };

  // ============================================================
  // Open department modal
  // ============================================================

  const handleOpenDepartmentModal = (
    user: UserManagementItem
  ) => {
    setSelectedUser(user);

    setNewDepartment(
      user.department || "IT"
    );

    setModalType("department");
    setError("");
  };

  // ============================================================
  // Open status modal
  // ============================================================

  const handleOpenStatusModal = (
    user: UserManagementItem
  ) => {
    setSelectedUser(user);
    setModalType("status");
    setError("");
  };

  // ============================================================
  // Close modal
  // ============================================================

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setModalType(null);
    setSelectedUser(null);
  };

  // ============================================================
  // Confirm user-management action
  // ============================================================

  const handleConfirmAction = async () => {
    if (!selectedUser || !modalType) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      let result;

      // --------------------------------------------------------
      // Change Role
      // --------------------------------------------------------

      if (modalType === "role") {
        result = await updateUserRole(
          selectedUser.id,
          newRole
        );
      }

      // --------------------------------------------------------
      // Change Status
      // --------------------------------------------------------

      else if (modalType === "status") {
        result = await updateUserStatus(
          selectedUser.id,
          !selectedUser.is_active
        );
      }

      // --------------------------------------------------------
      // Change Department
      // --------------------------------------------------------

      else {
        result = await updateUserDepartment(
          selectedUser.id,
          newDepartment
        );
      }

      // --------------------------------------------------------
      // Update local state using backend response
      // --------------------------------------------------------

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === selectedUser.id
            ? result.user
            : user
        )
      );

      // Close modal after successful API call
      setModalType(null);
      setSelectedUser(null);
    } catch (err) {
      console.error(
        "Failed to update user:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to perform this action."
          );
        } else if (err.response?.status === 400) {
          setError(
            err.response.data?.detail ||
              "Invalid user update request."
          );
        } else if (err.response?.status === 404) {
          setError("User not found.");
        } else {
          setError(
            "Unable to update user. Please try again."
          );
        }
      } else {
        setError(
          "Unable to update user. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // Loading state
  // ============================================================

  if (isLoading) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="User Management"
        activeItem="users"
        onNavigate={onNavigate}
      >
        <LoadingState message="Loading users..." />
      </DashboardLayout>
    );
  }

  // ============================================================
  // Initial loading error
  // ============================================================

  if (error && users.length === 0) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="User Management"
        activeItem="users"
        onNavigate={onNavigate}
      >
        <ErrorState
          message={error}
          onRetry={loadUsers}
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
      title="User Management"
      subtitle="Manage institutional user accounts, roles, departments, and active statuses"
      activeItem="users"
      onNavigate={onNavigate}
    >
      {/* API action error */}
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
        title={`Users (${filteredUsers.length})`}
      >
        {/* ================================================== */}
        {/* Search & Filters */}
        {/* ================================================== */}

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
            onChange={(value) =>
              setFilters({
                ...filters,
                search: value,
              })
            }
            placeholder="Search name or email..."
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <FilterDropdown
              label="Role"
              value={filters.role}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  role: value,
                })
              }
              options={[
                {
                  value: "ADMIN",
                  label: "Admin",
                },
                {
                  value: "STAFF",
                  label: "Staff",
                },
                {
                  value: "STUDENT",
                  label: "Student",
                },
              ]}
              allLabel="All Roles"
            />

            <FilterDropdown
              label="Status"
              value={filters.status}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  status: value,
                })
              }
              options={[
                {
                  value: "true",
                  label: "Active",
                },
                {
                  value: "false",
                  label: "Inactive",
                },
              ]}
              allLabel="All Statuses"
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* Empty State */}
        {/* ================================================== */}

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Adjust your search criteria to view matching users."
          />
        ) : (
          /* ================================================== */
          /* Users Table */
          /* ================================================== */

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
                  <th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    {/* Name */}
                    <td
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {user.name}
                    </td>

                    {/* Email */}
                    <td>
                      {user.email}
                    </td>

                    {/* Role */}
                    <td>
                      <Badge
                        variant={
                          user.role === "ADMIN"
                            ? "warning"
                            : user.role === "STAFF"
                            ? "primary"
                            : "default"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    {/* Department */}
                    <td>
                      {user.department || "-"}
                    </td>

                    {/* Status */}
                    <td>
                      <Badge
                        variant={
                          user.is_active
                            ? "success"
                            : "danger"
                        }
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </td>

                    {/* Created */}
                    <td
                      style={{
                        color:
                          "var(--rx-text-muted)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {new Date(
                        user.created_at
                      ).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          gap: 6,
                        }}
                      >
                        {/* Change Role */}
                        {user.role !== "ADMIN" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenRoleModal(
                                user
                              )
                            }
                          >
                            Change Role
                          </Button>
                        )}

                        {/* Change Department */}
                        {user.role === "STAFF" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenDepartmentModal(
                                user
                              )
                            }
                          >
                            Dept
                          </Button>
                        )}

                        {/* Activate / Deactivate */}
                        {user.role !== "ADMIN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleOpenStatusModal(
                                user
                              )
                            }
                          >
                            {user.is_active
                              ? "Deactivate"
                              : "Activate"}
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

      {/* ==================================================== */}
      {/* User Management Modal */}
      {/* ==================================================== */}

      <Modal
        isOpen={!!modalType}
        onClose={closeModal}
        title={`Modify ${selectedUser?.name || "User"}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirmAction}
              isLoading={isSubmitting}
              disabled={!selectedUser}
            >
              Confirm Action
            </Button>
          </>
        }
      >
        {/* ================================================== */}
        {/* Role Modal */}
        {/* ================================================== */}

        {modalType === "role" && (
          <div>
            <p
              style={{
                fontSize: "0.875rem",
                marginBottom: 12,
              }}
            >
              Select new role for{" "}
              <strong>
                {selectedUser?.name}
              </strong>
              :
            </p>

            <select
              className="rx-select"
              value={newRole}
              onChange={(event) =>
                setNewRole(
                  event.target.value as UserRole
                )
              }
              style={{
                width: "100%",
              }}
              disabled={isSubmitting}
            >
              <option value="STUDENT">
                STUDENT
              </option>

              <option value="STAFF">
                STAFF
              </option>
            </select>
          </div>
        )}

        {/* ================================================== */}
        {/* Status Modal */}
        {/* ================================================== */}

        {modalType === "status" && (
          <div>
            <p
              style={{
                fontSize: "0.875rem",
              }}
            >
              Are you sure you want to{" "}
              <strong>
                {selectedUser?.is_active
                  ? "deactivate"
                  : "activate"}
              </strong>{" "}
              the account for{" "}
              <strong>
                {selectedUser?.name}
              </strong>
              ?
            </p>
          </div>
        )}

        {/* ================================================== */}
        {/* Department Modal */}
        {/* ================================================== */}

        {modalType === "department" && (
          <div>
            <p
              style={{
                fontSize: "0.875rem",
                marginBottom: 12,
              }}
            >
              Assign department for staff{" "}
              <strong>
                {selectedUser?.name}
              </strong>
              :
            </p>

            <select
              className="rx-select"
              value={newDepartment}
              onChange={(event) =>
                setNewDepartment(
                  event.target.value
                )
              }
              style={{
                width: "100%",
              }}
              disabled={isSubmitting}
            >
              <option value="IT">
                IT
              </option>

              <option value="ELECTRICAL">
                ELECTRICAL
              </option>

              <option value="MAINTENANCE">
                MAINTENANCE
              </option>

              <option value="TRANSPORT">
                TRANSPORT
              </option>

              <option value="ACADEMICS">
                ACADEMICS
              </option>

              <option value="HOSTEL">
                HOSTEL
              </option>

              <option value="SECURITY">
                SECURITY
              </option>
            </select>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsers;