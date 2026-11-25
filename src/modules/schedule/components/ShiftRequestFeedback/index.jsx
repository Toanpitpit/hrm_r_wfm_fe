import Button from "@/shared/components/ui/Button";

export default function ShiftRequestFeedback({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{ color: "#dc2626", padding: "12px 0", fontSize: 13 }}
    >
      <span>{message}</span>
      {onRetry && (
        <Button size="sm" onClick={onRetry} style={{ marginLeft: 12 }}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
