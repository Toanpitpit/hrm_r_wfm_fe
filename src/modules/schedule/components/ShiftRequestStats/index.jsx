import StatCard from "@/shared/components/ui/StatCard";

export default function ShiftRequestStats({ stats }) {
  const {
    pendingCount,
    approvedCount,
    rejectedCount,
    expiredCount,
    totalCount,
  } = stats;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
      }}
    >
      <StatCard
        title="ĐƠN CẦN BẠN XÉT DUYỆT"
        value={pendingCount}
        subtext="Đơn xin nghỉ & đổi ca chờ duyệt"
        icon="clock"
        tone={pendingCount > 0 ? "warn" : "neutral"}
      />
      <StatCard
        title="ĐƠN ĐÃ PHÊ DUYỆT"
        value={approvedCount}
        subtext="Đã đồng ý & tự động cập nhật lịch"
        icon="check"
        tone="ok"
      />
      <StatCard
        title="ĐƠN ĐÃ TỪ CHỐI"
        value={rejectedCount}
        subtext="Đã từ chối đơn không hợp lệ"
        icon="close"
        tone={rejectedCount > 0 ? "bad" : "neutral"}
      />
      <StatCard
        title="ĐƠN QUÁ HẠN XỬ LÝ"
        value={expiredCount}
        subtext="Đơn ca trực đã qua hạn xử lý"
        icon="clock"
        tone="neutral"
      />
      <StatCard
        title="TỔNG SỐ ĐƠN TIẾP NHẬN"
        value={totalCount}
        subtext="Tổng số đơn toàn chi nhánh"
        icon="calendar"
        tone="info"
      />
    </div>
  );
}
