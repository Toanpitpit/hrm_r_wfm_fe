import { useState } from "react";
import Modal from "@/shared/components/ui/Modal";
import Button from "@/shared/components/ui/Button";
import ShiftSwapReviewList from "./ShiftSwapReviewList";

export default function ShiftSwapReviewModal({
  isOpen,
  onClose,
  storeId = null,
  onReviewed,
}) {
  const [busy, setBusy] = useState(false);
  const close = () => {
    if (!busy) onClose();
  };
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Xét Duyệt Đơn Đổi / Chuyển Ca Trực (Quản Lý Cửa Hàng)"
      sub="Sau khi phê duyệt, hệ thống sẽ tự động cập nhật lịch làm việc."
      width={850}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button variant="primary" onClick={close} disabled={busy}>
            Đóng
          </Button>
        </div>
      }
    >
      <ShiftSwapReviewList
        storeId={storeId}
        enabled={isOpen}
        onReviewed={onReviewed}
        onBusyChange={setBusy}
      />
    </Modal>
  );
}
