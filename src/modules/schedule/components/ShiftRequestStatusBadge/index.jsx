import Badge from "@/shared/components/ui/Badge";

const STATUSES = {
  PENDING: ["warn", "Chờ Xét Duyệt"],
  PENDING_PEER: ["info", "Chờ Đồng Nghiệp Duyệt"],
  APPROVED: ["active", "Đã Phê Duyệt"],
  REJECTED: ["bad", "Đã Từ Chối"],
  CANCELLED: ["neutral", "Đã Hủy"],
  EXPIRED: ["expired", "Quá Hạn Xử Lý"],
  EXPRIED: ["expired", "Quá Hạn Xử Lý"],
};

export default function ShiftRequestStatusBadge({ status }) {
  const [tone, label] = STATUSES[status] || [
    "neutral",
    status || "Không xác định",
  ];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

export function ShiftRequestTypeBadge({ type }) {
  const [tone, label] =
    type === "LEAVE"
      ? ["warn", "Xin Nghỉ Ca"]
      : type === "SWAP"
        ? ["active", "Đổi Ca Trực"]
        : ["info", "Chuyển Ca"];
  return <Badge tone={tone}>{label}</Badge>;
}
