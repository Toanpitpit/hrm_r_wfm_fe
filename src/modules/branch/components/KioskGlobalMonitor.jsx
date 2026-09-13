import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Modal from '@/shared/components/ui/Modal';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';

/**
 * ==============================================================================
 * COMPONENT: KioskGlobalMonitor.jsx
 * Giám sát trạng thái Kiosk toàn chuỗi cửa hàng
 * ==============================================================================
 */
export default function KioskGlobalMonitor({
  open = false,
  kiosks = [],
  branches = [],
  onClose,
}) {
  const { c } = useAdminTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Giám Sát Trạm Kiosk Toàn Chuỗi"
      width="820px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <th style={{ padding: '10px 12px' }}>Chi Nhánh</th>
                <th style={{ padding: '10px 12px' }}>Mã Thiết Bị</th>
                <th style={{ padding: '10px 12px' }}>Tên Máy Kiosk</th>
                <th style={{ padding: '10px 12px' }}>IP Thiết Bị</th>
                <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                <th style={{ padding: '10px 12px' }}>Ping Gần Nhất</th>
              </tr>
            </thead>
            <tbody>
              {kiosks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: c.fgSubtle,
                    }}
                  >
                    Chưa có dữ liệu trạm Kiosk trong hệ thống.
                  </td>
                </tr>
              ) : (
                kiosks.map((k, idx) => {
                  const br = branches.find(
                    (b) =>
                      String(b.storeId) === String(k.storeId) ||
                      b.branchCode === k.branchCode
                  );
                  const isActive = k.status === 'ACTIVE';

                  return (
                    <tr
                      key={k.kioskId || idx}
                      style={{
                        borderBottom:
                          idx === kiosks.length - 1
                            ? 'none'
                            : `1px solid ${c.border}60`,
                        backgroundColor: c.bgCard,
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {br?.name || k.branchCode || 'Chi nhánh'}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>
                        {k.kioskCode || `KSK-0${idx + 1}`}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {k.kioskName || 'Trạm Kiosk'}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'monospace',
                          color: c.accent,
                        }}
                      >
                        {k.deviceIp || k.ipAddress || '192.168.1.15'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={isActive ? 'good' : 'bad'}>
                          {isActive ? 'Trực tuyến' : 'Tạm khóa'}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: c.fgSubtle,
                          fontSize: '12px',
                        }}
                      >
                        {k.lastPing
                          ? new Date(k.lastPing).toLocaleTimeString('vi-VN')
                          : 'Vừa xong'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
