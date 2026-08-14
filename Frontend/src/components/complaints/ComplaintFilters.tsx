import React from "react";
import SearchBar from "../common/SearchBar";
import FilterDropdown from "../common/FilterDropdown";
import type { ComplaintFilterState } from "../../types/complaints";

interface ComplaintFiltersProps {
  filters: ComplaintFilterState;
  onChange: (filters: ComplaintFilterState) => void;
  departmentOptions?: { value: string; label: string }[];
  categoryOptions?: { value: string; label: string }[];
}

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const DEFAULT_DEPARTMENTS = [
  { value: "IT", label: "IT" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ACADEMICS", label: "Academics" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "SECURITY", label: "Security" },
];

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  filters,
  onChange,
  departmentOptions = DEFAULT_DEPARTMENTS,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}
    >
      <SearchBar
        value={filters.search}
        onChange={(val) => onChange({ ...filters, search: val })}
        placeholder="Search complaint title or ID..."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <FilterDropdown
          label="Status"
          value={filters.status}
          onChange={(val) => onChange({ ...filters, status: val })}
          options={STATUS_OPTIONS}
          allLabel="All Statuses"
        />

        <FilterDropdown
          label="Priority"
          value={filters.priority}
          onChange={(val) => onChange({ ...filters, priority: val })}
          options={PRIORITY_OPTIONS}
          allLabel="All Priorities"
        />

        <FilterDropdown
          label="Dept"
          value={filters.department}
          onChange={(val) => onChange({ ...filters, department: val })}
          options={departmentOptions}
          allLabel="All Departments"
        />
      </div>
    </div>
  );
};

export default ComplaintFilters;
