import { useToast } from "@/shared/components/ui/ToastProvider";
import Modal from "@/shared/components/ui/Modal";
import Button from "@/shared/components/ui/Button";
import useShiftRequests from "../hooks/useShiftRequests";
import ShiftRequestForm from "./ShiftRequestForm";
import ShiftRequestFeedback from "./ShiftRequestFeedback";

export default function ShiftSwapModal({ isOpen, onClose, shift, onSuccess }) {
  const toast = useToast();
  const requests = useShiftRequests({
    mode: "create",
    enabled: isOpen && Boolean(shift),
    shift,
  });
  const close = () => {
    if (!requests.submitting) onClose();
  };
  const submit = async (event) => {
    event.preventDefault();
    const result = await requests.submitRequest();
    if (result.busy || result.stale) return;
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) {
      onSuccess?.(result.message);
      onClose();
    }
  };
  if (!isOpen || !shift) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Đơn Xin Nghỉ / Đổi Ca Trực"
      sub="Yêu cầu cần được Quản lý cửa hàng phê duyệt trước khi cập nhật vào lịch làm việc chính thức."
      width={560}
      footer={
        <Button onClick={close} disabled={requests.submitting}>
          Hủy Bỏ
        </Button>
      }
    >
      <ShiftRequestFeedback message={requests.permissionError} />
      <ShiftRequestForm
        requestType={requests.requestType}
        setRequestType={requests.setRequestType}
        selectedMyAssignmentId={requests.selectedMyAssignmentId}
        setSelectedMyAssignmentId={requests.setSelectedMyAssignmentId}
        myUpcomingShifts={requests.myUpcomingShifts}
        selectedColleagueId={requests.selectedColleagueId}
        setSelectedColleagueId={requests.setSelectedColleagueId}
        colleagues={requests.colleagues}
        selectedTargetAssignmentId={requests.selectedTargetAssignmentId}
        setSelectedTargetAssignmentId={requests.setSelectedTargetAssignmentId}
        colleagueShifts={requests.colleagueShifts}
        loadingShifts={requests.loadingShifts}
        loadingColleagues={requests.loadingColleagues}
        loadingColleagueShifts={requests.loadingColleagueShifts}
        colleagueShiftsError={requests.colleagueShiftsError}
        colleaguesError={requests.colleaguesError}
        shiftsError={requests.shiftsError}
        reason={requests.reason}
        setReason={requests.setReason}
        submitting={requests.submitting}
        validationErrors={requests.validationErrors}
        fetchMyShifts={requests.fetchMyShifts}
        fetchColleagues={requests.fetchColleagues}
        fetchColleagueShifts={requests.fetchColleagueShifts}
        isAdvanceNoticeValid={requests.isAdvanceNoticeValid}
        onSubmit={submit}
        fixedShift
      />
    </Modal>
  );
}
