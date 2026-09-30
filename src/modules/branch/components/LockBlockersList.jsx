import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';

/**
 * COMPONENT: LockBlockersList.jsx
 * Hiển thị danh sách các điều kiện ràng buộc ngăn không cho khóa chi nhánh (Blockers).
 * Hỗ trợ mở rộng xem chi tiết từng mục và nút "Kiểm tra lại".
 */
export default function LockBlockersList({
  blockers = [],
  onRecheck,
  rechecking = false,
}) {
  const { c } = useAdminTheme();
  // State quản lý mục nào đang được expand
  const [expandedKeys, setExpandedKeys] = useState({});

  const toggleExpand = (code) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Banner thông báo trạng thái không thể khóa */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#ef4444',
        }}
      >
        <div style={{ marginTop: '2px', flexShrink: 0 }}>
          <Icon name="alert-triangle" size={18} color="#ef4444" />
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
          <strong style={{ display: 'block', marginBottom: '2px', color: '#f87171' }}>
            Không thể khóa chi nhánh lúc này
          </strong>
          <span>
            Hệ thống phát hiện các ràng buộc nghiệp vụ đang tồn đọng. Vui lòng giải quyết các điều kiện sau trước khi thực hiện khóa.
          </span>
        </div>
      </div>

      {/* Danh sách các Blockers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {blockers.map((blocker) => {
          const isExpanded = Boolean(expandedKeys[blocker.code]);
          const hasItems = Array.isArray(blocker.items) && blocker.items.length > 0;

          return (
            <div
              key={blocker.code}
              style={{
                backgroundColor: c.bgElev,
                border: `1px solid ${c.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'border-color .15s ease',
              }}
            >
              {/* Header của Blocker item */}
              <div
                onClick={() => hasItems && toggleExpand(blocker.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  cursor: hasItems ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="alert-triangle" size={15} color="#f59e0b" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: c.fg }}>
                      {blocker.message}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  {/* Badge số lượng */}
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {blocker.count} {blocker.count > 1 ? 'mục' : 'mục'}
                  </span>

                  {hasItems && (
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: c.fgSubtle,
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'grid',
                        placeItems: 'center',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform .18s ease',
                      }}
                      aria-label={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                    >
                      <Icon name="chevron-down" size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Chi tiết từng item trong Blocker (Expandable) */}
              {hasItems && isExpanded && (
                <div
                  style={{
                    borderTop: `1px solid ${c.border}`,
                    backgroundColor: c.bgRaised,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: c.fgSubtle, marginBottom: '2px' }}>
                    Danh sách chi tiết cần xử lý:
                  </div>
                  {blocker.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: c.bgElev,
                        fontSize: '12.5px',
                        color: c.fg,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      {item.id && (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: c.accent,
                            backgroundColor: `${c.accent}15`,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          #{item.id}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hành động kiểm tra lại */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          paddingTop: '10px',
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <span style={{ fontSize: '12px', color: c.fgSubtle }}>
          Sau khi đã chốt ca hoặc duyệt biên bản, nhấn Kiểm tra lại.
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onRecheck}
          loading={rechecking}
          style={{
            borderColor: c.accent,
            color: c.accent,
          }}
        >
          <Icon name="refresh" size={14} />
          <span>Kiểm Tra Lại</span>
        </Button>
      </div>
    </div>
  );
}
