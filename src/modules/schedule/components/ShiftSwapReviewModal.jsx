import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import ShiftSwapReviewList from './ShiftSwapReviewList';

export default function ShiftSwapReviewModal({
  isOpen,
  onClose,
  storeId = null,
  onReviewed,
}) {
  const { c } = useAdminTheme();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xét Duyệt Đơn Đổi / Chuyển Ca Trực (Quản Lý Cửa Hàng)"
      sub="Sau khi Phê duyệt, hệ thống sẽ tự động cập nhật ngay nhân sự mới vào bảng lịch phân công tuần."
      width={850}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          <Button variant="primary" kind="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <ShiftSwapReviewList
        storeId={storeId}
        onReviewed={onReviewed}
      />
    </Modal>
  );
}

