import { useToast } from "@/shared/components/ui/ToastProvider";
import Modal from "@/shared/components/ui/Modal";
import Button from "@/shared/components/ui/Button";
import useShiftRequests from "../hooks/useShiftRequests";
import StoreSwapRequestReview from "./StoreSwapRequestReview";
import ShiftRequestFeedback from "./ShiftRequestFeedback";

export default function ShiftSwapReviewModal({
  isOpen,
  onClose,
  storeId = null,
  onReviewed,
}) {
  const toast = useToast();
  const requests = useShiftRequests({
    mode: "review",
    enabled: isOpen,
    branchId: storeId,
    initialReviewFilter: "PENDING",
  });
  const busy = requests.actionLoadingId !== null;
  const close = () => {
    if (!busy) onClose();
  };
  const review = async (id, approved) => {
    const result = await requests.reviewRequest(id, approved);
    if (result.busy || result.stale) return;
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) onReviewed?.();
  };
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Xét Duyệt Đơn Xin Nghỉ / Đổi Ca Trực"
      sub="Sau khi phê duyệt, hệ thống sẽ tự động cập nhật lịch làm việc."
      width={800}
      footer={
        <>
          <Button
            onClick={requests.fetchStoreRequests}
            disabled={requests.loadingStoreRequests || busy}
          >
            Làm Mới Danh Sách
          </Button>
          <Button variant="primary" onClick={close} disabled={busy}>
            Đóng
          </Button>
        </>
      }
    >
      <ShiftRequestFeedback message={requests.permissionError} />
      <StoreSwapRequestReview
        tabs={requests.reviewTabs}
        reviewFilter={requests.reviewFilter}
        setReviewFilter={requests.setReviewFilter}
        searchTerm={requests.searchTerm}
        setSearchTerm={requests.setSearchTerm}
        loadingStoreRequests={requests.loadingStoreRequests}
        requests={requests.pagedStoreRequests}
        totalItems={requests.reviewTotalItems}
        actionLoadingId={requests.actionLoadingId}
        reviewPage={requests.reviewPage}
        reviewPageSize={requests.reviewPageSize}
        setReviewPage={requests.setReviewPage}
        setReviewPageSize={requests.setReviewPageSize}
        storeRequestsError={requests.storeRequestsError}
        fetchStoreRequests={requests.fetchStoreRequests}
        onReview={review}
      />
    </Modal>
  );
}
