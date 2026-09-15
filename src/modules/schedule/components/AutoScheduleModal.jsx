import { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';

export default function AutoScheduleModal({
  isOpen,
  onClose,
  onRunAutoSchedule,
  actionLoading = false,
}) {
  const { c, fonts } = useAdminTheme();

  const [maxShifts, setMaxShifts] = useState(6);
  const [minShiftsFullTime, setMinShiftsFullTime] = useState(5);
  const [overwrite, setOverwrite] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRunAutoSchedule({
      maxShiftsPerWeek: Number(maxShifts),
      minShiftsPerWeek: Number(minShiftsFullTime),
      overwriteExisting: overwrite,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tự Động Xếp Ca Bằng Google OR-Tools (UC 2.1)"
    >
      <form onSubmit={handleSubmit}>
        {/* Banner giải thuật */}
        <div
          style={{
            background: `linear-gradient(135deg, ${c.accentDim}40, ${c.bgElev})`,
            border: `1px solid ${c.accent}`,
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ color: c.accent }}><Icon name="zap" size={20} /></span>
            <span style={{ fontWeight: 800, fontSize: 14, color: c.fg, fontFamily: fonts.display }}>
              Mô Hình Tối Ưu Hóa Toán Học (CP-SAT Solver)
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: c.fgSubtle, lineHeight: 1.5 }}>
            Hệ thống áp dụng thư viện chuẩn công nghiệp <strong>Google OR-Tools</strong> để tự động tìm phương án phân công ca trực tối ưu trong vài giây, thỏa mãn đầy đủ các ràng buộc vận hành chuỗi.
          </div>
        </div>

        {/* Danh sách ràng buộc */}
        <div style={{ background: c.bgElev, border: `1px solid ${c.border}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.fg, textTransform: 'uppercase', marginBottom: 6 }}>
            🔒 Ràng buộc cứng (Hard Constraints - Bắt buộc thỏa mãn):
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: c.fgSubtle, lineHeight: 1.6 }}>
            <li>Mỗi ca đảm bảo đúng số lượng Trưởng ca, Thu ngân, Bán hàng, Bảo vệ theo định mức.</li>
            <li><strong>Tuyệt đối không trùng:</strong> Mỗi nhân viên làm tối đa 1 ca / ngày.</li>
            <li><strong>Bảo vệ sức khỏe:</strong> Nhân viên làm ca đêm hôm trước bắt buộc nghỉ ca sáng hôm sau.</li>
            <li>Không xếp quá giới hạn số ca quy định trong tuần (đảm bảo ngày nghỉ).</li>
          </ul>

          <div style={{ fontSize: 12, fontWeight: 800, color: c.fg, textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>
            🎯 Ràng buộc mềm (Soft Constraints - Ưu tiên tối ưu):
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: c.fgSubtle, lineHeight: 1.6 }}>
            <li>Ưu tiên tối đa số ca cho nhân sự Full-time đạt định mức tiêu chuẩn.</li>
            <li>Cân bằng tải khối lượng công việc giữa các nhân viên trong chi nhánh.</li>
          </ul>
        </div>

        {/* Cấu hình tham số */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <FormField label="Số ca tối đa / nhân viên / tuần:">
            <input
              type="number"
              min="1"
              max="7"
              value={maxShifts}
              onChange={(e) => setMaxShifts(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                background: c.bgRaised,
                border: `1px solid ${c.border}`,
                color: c.fg,
              }}
              required
            />
          </FormField>

          <FormField label="Chỉ tiêu ca Full-time / tuần:">
            <input
              type="number"
              min="1"
              max="7"
              value={minShiftsFullTime}
              onChange={(e) => setMinShiftsFullTime(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                background: c.bgRaised,
                border: `1px solid ${c.border}`,
                color: c.fg,
              }}
              required
            />
          </FormField>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: c.fg,
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
          />
          <span>Ghi đè và xếp lại toàn bộ các phân công chưa công bố trong tuần này</span>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={onClose} type="button" disabled={actionLoading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" onClick={handleSubmit} disabled={actionLoading}>
            <Icon name="zap" size={15} style={{ marginRight: 6 }} />
            {actionLoading ? 'Đang chạy thuật toán OR-Tools...' : 'Chạy Tự Động Xếp Ca'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
