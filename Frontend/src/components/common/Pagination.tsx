import React from "react";
import Button from "./Button";
import "./common.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="rx-pagination">
      <div className="rx-pagination-info">
        {totalItems !== undefined && pageSize !== undefined ? (
          <>
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
            </strong>{" "}
            to <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{" "}
            <strong>{totalItems}</strong> results
          </>
        ) : (
          <>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </>
        )}
      </div>

      <div className="rx-pagination-controls">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
