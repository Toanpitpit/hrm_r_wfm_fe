import { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import FormField from '@/shared/components/ui/FormField';
import { formatVNDate, formatShiftTemplateName } from '../hooks/useWeeklySchedule';

export default function SetQuotaModal({
  isOpen,
  onClose,
  selectedSchedule,
  templates = [],
  onUpdateSingleQuota,
  onGenerateWeekly,
  actionLoading = false,
}) {
  const { c } = useAdminTheme();

  // Mode: 'SINGLE' (chỉnh 1 ca cụ thể) hoặc 'WEEKLY_DEFAULT' (sinh khung ca & định mức cho cả tuần)
  const isSingleMode = Boolean(selectedSchedule);

  // State cho Single Mode
  const [cashier, setCashier] = useState(1);
  const [sales, setSales] = useState(2);
  const [security, setSecurity] = useState(1);

  // State cho Weekly Default Mode
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [defaultCashier, setDefaultCashier] = useState(1);
  const [defaultSales, setDefaultSales] = useState(2);
  const [defaultSecurity, setDefaultSecurity] = useState(1);

  useEffect(() => {
    if (selectedSchedule) {
      setCashier(selectedSchedule.requiredCashier || 1);
      setSales(selectedSchedule.requiredSales || 1);
      setSecurity(selectedSchedule.requiredSecurity || 1);
    } else {
      setSelectedTemplateIds(templates.map((t) => t.shiftId || t.id));
    }
  }, [selectedSchedule, templates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSingleMode) {
      onUpdateSingleQuota({
        scheduleId: selectedSchedule.scheduleId,
        requiredCashier: cashier,
        requiredSales: sales,
        requiredSecurity: security,
      });
    } else {
      onGenerateWeekly({
        templateIds: selectedTemplateIds,
        defaultRequiredCashier: defaultCashier,
        defaultRequiredSales: defaultSales,
        defaultRequiredSecurity: defaultSecurity,
      });
    }
  };

  const toggleTemplateId = (id) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isSingleMode
          ? `Điều Chỉnh Định Mức Ca: ${formatShiftTemplateName(selectedSchedule.shiftTemplateName)} (${formatVNDate(selectedSchedule.workDate)})`
          : 'Thiết Lập Định Mức Ca Chuẩn Cho Cả Tuần'
      }
    >
      <form onSubmit={handleSubmit}>
        {isSingleMode ? (
          <div>
            <div style={{ fontSize: 13, color: c.fgSubtle, marginBottom: 16 }}>
              Thiết lập nhu cầu số lượng nhân sự từng vị trí cần có mặt trong ca trực này:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <FormField label="Trưởng ca">
                <input
                  type="number"
                  value={1}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: `${c.accentDim}20`,
                    border: `1px solid ${c.border}`,
                    color: c.accent,
                    fontWeight: 700,
                    cursor: 'not-allowed',
                  }}
                  title="Quy định chuỗi cửa hàng tiện lợi: mỗi ca trực bắt buộc tối thiểu 1 Trưởng ca trực"
                />
              </FormField>

              <FormField label="Thu ngân">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    color: c.fg,
                  }}
                  required
                />
              </FormField>

              <FormField label="Bán hàng">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={sales}
                  onChange={(e) => setSales(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    color: c.fg,
                  }}
                  required
                />
              </FormField>

              <FormField label="Bảo vệ">
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={security}
                  onChange={(e) => setSecurity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    color: c.fg,
                  }}
                  required
                />
              </FormField>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: c.fgSubtle, marginBottom: 14 }}>
              Hệ thống sẽ tự động sinh khung ca 7 ngày trong tuần và áp dụng định mức nhân sự mặc định bên dưới:
            </div>

            {/* Chọn các khung ca chuẩn áp dụng */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: c.fg, marginBottom: 8 }}>
                Chọn Khung Ca Chuẩn Áp Dụng:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {templates.map((t) => {
                  const tId = t.shiftId || t.id;
                  const isChecked = selectedTemplateIds.includes(tId);
                  return (
                    <label
                      key={tId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: isChecked ? `${c.accentDim}30` : c.bgElev,
                        border: `1px solid ${isChecked ? c.accent : c.border}`,
                        padding: '8px 14px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: isChecked ? 700 : 500,
                        color: isChecked ? c.accent : c.fg,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTemplateId(tId)}
                      />
                      <span>{t.shiftName || t.name}</span>
                      <span style={{ fontSize: 11, color: c.fgFaint }}>
                        ({t.startTime?.substring(0, 5)} - {t.endTime?.substring(0, 5)})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Định mức mặc định */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
              <FormField label="Trưởng ca / ca">
                <input
                  type="number"
                  value={1}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: `${c.accentDim}20`,
                    border: `1px solid ${c.border}`,
                    color: c.accent,
                    fontWeight: 700,
                    cursor: 'not-allowed',
                  }}
                  title="Quy định chuỗi: mỗi ca trực bắt buộc tối thiểu 1 Trưởng ca trực"
                />
              </FormField>

              <FormField label="Thu ngân / ca">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={defaultCashier}
                  onChange={(e) => setDefaultCashier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    color: c.fg,
                  }}
                  required
                />
              </FormField>

              <FormField label="Bán hàng / ca">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={defaultSales}
                  onChange={(e) => setDefaultSales(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    color: c.fg,
                  }}
                  required
                />
              </FormField>

              <FormField label="Bảo vệ / ca">
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={defaultSecurity}
                  onChange={(e) => setDefaultSecurity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: c.bgElev,
                    border: `1px solid ${c.border}`,
                    color: c.fg,
                  }}
                  required
                />
              </FormField>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <Button variant="ghost" onClick={onClose} type="button" disabled={actionLoading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={actionLoading}>
            {actionLoading ? 'Đang lưu...' : isSingleMode ? 'Cập Nhật Định Mức' : 'Áp Dụng Cho Cả Tuần'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
