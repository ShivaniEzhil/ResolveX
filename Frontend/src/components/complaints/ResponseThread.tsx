import React, { useState } from "react";
import type { ComplaintResponseItem } from "../../types/complaints";
import Button from "../common/Button";
import Badge from "../common/Badge";
import "./complaints.css";

interface ResponseThreadProps {
  responses: ComplaintResponseItem[];
  onAddResponse?: (message: string) => void;
  canRespond?: boolean;
}

export const ResponseThread: React.FC<ResponseThreadProps> = ({
  responses,
  onAddResponse,
  canRespond = true,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !onAddResponse) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddResponse(newMessage.trim());
      setNewMessage("");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="rx-thread">
      {responses.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--rx-text-muted)", fontStyle: "italic" }}>
          No responses or updates added yet.
        </p>
      ) : (
        responses.map((resp) => (
          <div key={resp.id} className="rx-thread-item">
            <div className="rx-thread-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="rx-thread-author">{resp.userName}</span>
                <Badge
                  variant={
                    resp.userRole === "STAFF"
                      ? "primary"
                      : resp.userRole === "ADMIN"
                      ? "warning"
                      : "default"
                  }
                >
                  {resp.userRole}
                </Badge>
              </div>
              <span className="rx-thread-date">
                {new Date(resp.created_at).toLocaleString()}
              </span>
            </div>
            <div className="rx-thread-message">{resp.message}</div>
          </div>
        ))
      )}

      {canRespond && onAddResponse && (
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a response or status update..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--rx-radius-md)",
                border: "1px solid var(--rx-border)",
                fontFamily: "var(--rx-font-sans)",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!newMessage.trim()}
            >
              Post Response
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResponseThread;
