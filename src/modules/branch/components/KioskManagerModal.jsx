import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import { Field as FormField } from '@/shared/components/ui/FormField';
import Icon from '@/shared/components/ui/Icon';
import { useToast } from '@/components/ui/toast/ToastProvider';

/**
 * ==============================================================================
 * COMPONENT: KioskManagerModal.jsx (Drawer/Modal Quản lý Kiosk theo Chi nhánh)
 * UC 1.2: Cấu hình & Giám sát Kiosk theo từng chi nhánh cụ thể
 * ==============================================================================
 * 1. Bảng Kiosk: Tên thiết bị, IP Whitelist, User Agent Pattern, Trạng thái,
 *    Mã Token Kiosk (có nút copy), Nút Khóa/Mở.
 * 2. Form thêm Kiosk: Nhập Device Name, IP cho phép, User Agent rule.
 */
export default function KioskManagerModal({
  open = false,
  branch = null,
  allKiosks = [],
  onClose,
  onToggleKioskLock,
  onAddKiosk,
}) {
  const { c } = useAdminTheme();
  const toast = useToast();

  const [copiedToken, setCopiedToken] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKiosk, setNewKiosk] = useState({
    kioskName: '',
    deviceIp: '',
    browserAgent: 'Chrome Enterprise Kiosk v120+',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!branch) return null;

  // Lọc các Kiosk thuộc chi nhánh này
  const branchKiosks = (allKiosks || []).filter(
    (k) =>
      String(k.storeId) === String(branch.storeId) ||
      k.branchCode === branch.branchCode
  );

  const handleCopyToken = (token) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success('Đã sao chép mã Token Kiosk vào clipboard!');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCreateKiosk = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newKiosk.kioskName.trim()) {
      toast.error('Vui lòng nhập tên thiết bị Kiosk.');
      return;
    }

    try {
      setSubmitting(true);
      if (onAddKiosk) {
        await onAddKiosk(branch.storeId, newKiosk);
      }
      toast.success(`Đã thêm máy Kiosk "${newKiosk.kioskName}" thành công!`);
      setNewKiosk({
        kioskName: '',
        deviceIp: '',
        browserAgent: 'Chrome Enterprise Kiosk v120+',
      });
      setShowAddForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cấu Hình Máy Trạm Kiosk - ${branch.name}`}
      width="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header thông tin chi nhánh & nút thêm Kiosk */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: `${c.bgSubtle}80`,
            border: `1px solid ${c.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: c.fgSubtle }}>
              Mã chi nhánh: <strong>{branch.branchCode}</strong>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: c.fg,
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              Dải IP Whitelist: {branch.kioskAllowedIp || 'Mặc định chi nhánh'}
            </div>
          </div>

          <Button
            variant={showAddForm ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Icon
              name={showAddForm ? 'close' : 'plus'}
              size={14}
            />
            <span>{showAddForm ? 'Đóng Form Thêm' : 'Thêm Máy Kiosk'}</span>
          </Button>
        </div>

        {/* Form thêm Kiosk mới */}
        {showAddForm && (
          <form
            onSubmit={handleCreateKiosk}
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${c.accent}40`,
              backgroundColor: `${c.accent}08`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: c.accent,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon
                name="screen"
                size={16}
              />
              <span>Đăng Ký Máy Trạm Kiosk Mới</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <FormField
                label="Tên Thiết Bị (Device Name)"
                required
              >
                <input
                  type="text"
                  value={newKiosk.kioskName}
                  onChange={(e) =>
                    setNewKiosk({ ...newKiosk, kioskName: e.target.value })
                  }
                  placeholder="VD: Máy Kiosk Cầu Giấy 02"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                  }}
                />
              </FormField>

              <FormField
                label="IP Thiết Bị Cho Phép (IP Whitelist)"
                hint="IP tĩnh hoặc IP mạng nội bộ của quầy"
              >
                <input
                  type="text"
                  value={newKiosk.deviceIp}
                  onChange={(e) =>
                    setNewKiosk({ ...newKiosk, deviceIp: e.target.value })
                  }
                  placeholder="VD: 192.168.1.16"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.bgCard,
                    color: c.fg,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
              </FormField>
            </div>

            <FormField
              label="Quy tắc Trình duyệt (User Agent Rule)"
              hint="Chuỗi định danh trình duyệt Kiosk Lockdown Mode"
            >
              <input
                type="text"
                value={newKiosk.browserAgent}
                onChange={(e) =>
                  setNewKiosk({ ...newKiosk, browserAgent: e.target.value })
                }
                placeholder="VD: Chrome Enterprise Kiosk v120+"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.bgCard,
                  color: c.fg,
                  fontSize: '13px',
                }}
              />
            </FormField>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowAddForm(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateKiosk}
                loading={submitting}
              >
                Lưu Thiết Bị Kiosk
              </Button>
            </div>
          </form>
        )}

        {/* Bảng danh sách Kiosk */}
        {branchKiosks.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              backgroundColor: `${c.bgSubtle}40`,
              borderRadius: '8px',
              border: `1px dashed ${c.border}`,
            }}
          >
            <div style={{ color: c.fgSubtle, fontSize: '13px' }}>
              Chưa có máy trạm Kiosk nào được kích hoạt tại chi nhánh này.
            </div>
            <div style={{ marginTop: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                + Đăng Ký Trạm Kiosk Đầu Tiên
              </Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: `${c.bgSubtle}90`,
                    borderBottom: `1px solid ${c.border}`,
                    color: c.fgSubtle,
                    textAlign: 'left',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <th style={{ padding: '10px 12px' }}>Tên Thiết Bị</th>
                  <th style={{ padding: '10px 12px' }}>IP Whitelist</th>
                  <th style={{ padding: '10px 12px' }}>User Agent Pattern</th>
                  <th style={{ padding: '10px 12px' }}>Mã Token Kiosk</th>
                  <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {branchKiosks.map((kiosk, idx) => {
                  const isActive = kiosk.status === 'ACTIVE';
                  const token =
                    kiosk.kioskToken ||
                    kiosk.activationCode ||
                    `KSK-TOKEN-${branch.branchCode}-${kiosk.kioskId || idx + 1}`;
                  const isCopied = copiedToken === token;

                  return (
                    <tr
                      key={kiosk.kioskId || idx}
                      style={{
                        borderBottom:
                          idx === branchKiosks.length - 1
                            ? 'none'
                            : `1px solid ${c.border}60`,
                        backgroundColor: c.bgCard,
                      }}
                    >
                      {/* 1. Tên Thiết Bị */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: c.fg }}>
                          {kiosk.kioskName || kiosk.kioskCode || `Máy Kiosk ${idx + 1}`}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: c.fgSubtle,
                            fontFamily: 'monospace',
                          }}
                        >
                          {kiosk.kioskCode || `KSK-0${idx + 1}`}
                        </div>
                      </td>

                      {/* 2. IP Whitelist */}
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: c.fg,
                            backgroundColor: `${c.bgSubtle}`,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {kiosk.deviceIp || kiosk.ipAddress || '192.168.1.15'}
                        </span>
                      </td>

                      {/* 3. User Agent Pattern */}
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            color: c.fgSubtle,
                            display: 'inline-block',
                            maxWidth: '160px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={
                            kiosk.browserAgent ||
                            kiosk.lastBrowserUserAgent ||
                            'Chrome Enterprise Kiosk v120+'
                          }
                        >
                          {kiosk.browserAgent ||
                            kiosk.lastBrowserUserAgent ||
                            'Chrome Kiosk'}
                        </span>
                      </td>

                      {/* 4. Mã Token Kiosk + Nút Copy */}
                      <td style={{ padding: '10px 12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              color: c.accent,
                              backgroundColor: `${c.accent}12`,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {token}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyToken(token)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: isCopied ? '#10b981' : c.fgSubtle,
                              padding: '2px 4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Sao chép mã Token Kiosk"
                          >
                            <Icon
                              name={isCopied ? 'check' : 'copy'}
                              size={13}
                            />
                          </button>
                        </div>
                      </td>

                      {/* 5. Trạng thái */}
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={isActive ? 'good' : 'bad'}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#10b981' : '#ef4444',
                              marginRight: '4px',
                            }}
                          />
                          {isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </td>

                      {/* 6. Thao tác Khóa / Mở */}
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onToggleKioskLock &&
                            onToggleKioskLock(kiosk.kioskId, kiosk.status)
                          }
                          style={{
                            color: isActive ? '#f87171' : '#34d399',
                          }}
                        >
                          <Icon
                            name={isActive ? 'lock' : 'unlock'}
                            size={12}
                          />
                          <span>{isActive ? 'Khóa Trạm' : 'Mở Trạm'}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '8px',
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
