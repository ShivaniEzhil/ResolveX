import React from "react";
import "./common.css";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel?: string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
  className = "",
}) => {
  return (
    <div
      className={`rx-filter-dropdown ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {label && (
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--rx-text-secondary)",
          }}
        >
          {label}:
        </span>
      )}
      <select
        className="rx-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
