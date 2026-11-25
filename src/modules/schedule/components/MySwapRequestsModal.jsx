import { useState } from "react";
import { useToast } from "@/shared/components/ui/ToastProvider";
import Modal from "@/shared/components/ui/Modal";
import ConfirmModal from "@/shared/components/ui/ConfirmModal";
import Button from "@/shared/components/ui/Button";
import useShiftRequests from "../hooks/useShiftRequests";
import MySwapRequestList from "./MySwapRequestList";
import ShiftRequestFeedback from "./ShiftRequestFeedback";

export default function MySwapRequestsModal({ isOpen, onClose }) {
  const toast = useToast();
  const requests = useShiftRequests({ mode: "history", enabled: isOpen });
  const [cancelId, setCancelId] = useState(null);
  const busy = requests.actionLoadingId !== null;
  const close = () => {
    if (!busy) {
      setCancelId(null);
      onClose();
    }
  };
  const notify = (result) => {
    if (!result.busy && !result.stale)
      toast[result.success ? "success" : "error"](result.message);
    return result;
  };
  const respond = async (id, accepted) =>
    notify(await requests.respondToRequest(id, accepted));
  const confirmCancel = async () => {
    const result = notify(await requests.cancelRequest(cancelId));
    if (result.success) setCancelId(null);
  };
  if (!isOpen) return null;
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Lịch Sử Đơn Đổi / Chuyển Ca Của Tôi"
        sub="Theo dõi tiến độ xét duyệt các đơn xin đổi ca và nhờ người làm thay."
        width={720}
        footer={
          <>
            <Button
              onClick={requests.fetchMyRequests}
              disabled={requests.loadingMyRequests || busy}
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
        <MySwapRequestList
          myTab={requests.myTab}
          setMyTab={requests.setMyTab}
          receivedPendingCount={requests.receivedPendingCount}
          loadingMyRequests={requests.loadingMyRequests}
          requests={requests.pagedMyRequests}
          totalItems={requests.myTotalItems}
          myPage={requests.myPage}
          myPageSize={requests.myPageSize}
          setMyPage={requests.setMyPage}
          setMyPageSize={requests.setMyPageSize}
          actionLoadingId={requests.actionLoadingId}
          myRequestsError={requests.myRequestsError}
          fetchMyRequests={requests.fetchMyRequests}
          onRespond={respond}
          onCancel={setCancelId}
        />
      </Modal>
      <ConfirmModal
        isOpen={cancelId !== null}
        title="Hủy đơn yêu cầu"
        message="Bạn có chắc chắn muốn hủy đơn này không?"
        confirmText="Hủy đơn"
        onClose={() => {
          if (!busy) setCancelId(null);
        }}
        onConfirm={confirmCancel}
        loading={busy}
      />
    </>
  );
}
