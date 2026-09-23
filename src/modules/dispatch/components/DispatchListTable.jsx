import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import { Badge, Button, Pagination } from '@/shared/components/ui';

/**
 * Bảng hiển thị danh sách các lệnh điều động nhân sự liên chi nhánh.
 */
export default function DispatchListTable({
  dispatches = [],
  loading = false,
  currentStoreId,
  onReview,
  onEdit,
  onDelete,
  onViewDetail,
  emptyText = 'Chưa có lệnh điều động nhân sự nào.',
}) {
  const { c, fonts } = useAdminTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [dispatches.length]);

  const displayDispatches = dispatches.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="active" dot>Đã phê duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="bad" dot>Đã từ chối</Badge>;
      case 'PENDING':
      default:
        return <Badge tone="warn" dot>Chờ xét duyệt</Badge>;
    }
  };

  const formatDate = (dStr) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: c.fgFaint }}>
        <div
          style={{
            display: 'inline-block',
            width: 24,
            height: 24,
            border: `2px solid ${c.border}`,
            borderTopColor: c.accent,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 8,
          }}
        />
        <div style={{ fontSize: 13 }}>Đang tải dữ liệu điều động nhân sự...</div>
      </div>
    );
  }

  if (!dispatches || dispatches.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: c.fgFaint,
          background: c.bgRaised,
          borderRadius: 8,
          border: `1px dashed ${c.border}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500 }}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${c.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body }}>
        <thead>
          <tr style={{ background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>
            <th style={thStyle(c, 'left')}>Mã Phiếu</th>
            <th style={thStyle(c, 'left')}>Nhân Sự Điều Động</th>
            <th style={thStyle(c, 'left')}>Tuyến Hỗ Trợ</th>
            <th style={thStyle(c, 'left')}>Thời Gian Chi Viện</th>
            <th style={thStyle(c, 'left')}>Trạng Thái</th>
            <th style={thStyle(c, 'left')}>Người Lập / Duyệt</th>
            <th style={thStyle(c, 'right')}>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {displayDispatches.map((item) => {
            const isSource = currentStoreId && Number(item.fromStoreId) === Number(currentStoreId);
            const isTarget = currentStoreId && Number(item.toStoreId) === Number(currentStoreId);
            const canReview = isSource && item.status === 'PENDING';
            const canModify = isTarget && item.status === 'PENDING';

            return (
              <tr
                key={item.dispatchId}
                style={{
                  borderBottom: `1px solid ${c.borderSub}`,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.bgElev)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Mã phiếu */}
                <td style={tdStyle(c)}>
                  <span style={{ fontWeight: 700, color: c.accent, fontSize: 13 }}>
                    #{item.dispatchId}
                  </span>
                </td>

                {/* Nhân sự */}
                <td style={tdStyle(c)}>
                  <div style={{ fontWeight: 600, color: c.fg, fontSize: 13.5 }}>
                    {item.employeeName}
                  </div>
                  <div style={{ fontSize: 11.5, color: c.fgFaint, marginTop: 2 }}>
                    {item.employeeCode} {item.positionName ? `• ${item.positionName}` : ''}
                  </div>
                </td>

                {/* Tuyến chi viện */}
                <td style={tdStyle(c)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                    <span style={{ color: isSource ? c.tones.bad : c.fgMuted, fontWeight: isSource ? 700 : 400 }}>
                      {item.fromStoreName}
                    </span>
                    <span style={{ color: c.fgFaint }}>&rarr;</span>
                    <span style={{ color: isTarget ? c.tones.good : c.fgMuted, fontWeight: isTarget ? 700 : 400 }}>
                      {item.toStoreName}
                    </span>
                  </div>
                  {currentStoreId && (
                    <div style={{ marginTop: 3 }}>
                      {isSource && (
                        <span style={{ fontSize: 10.5, color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: 3 }}>
                          Cơ sở mình cử đi
                        </span>
                      )}
                      {isTarget && (
                        <span style={{ fontSize: 10.5, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: 3 }}>
                          Cơ sở mình nhận về
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Thời gian */}
                <td style={tdStyle(c)}>
                  <div style={{ fontSize: 13, color: c.fg, fontWeight: 500 }}>
                    {formatDate(item.startDate)} &rarr; {formatDate(item.endDate)}
                  </div>
                  {item.reason && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: c.fgFaint,
                        marginTop: 2,
                        maxWidth: 220,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={item.reason}
                    >
                      {item.reason}
                    </div>
                  )}
                </td>

                {/* Trạng thái */}
                <td style={tdStyle(c)}>
                  {getStatusBadge(item.status)}
                </td>

                {/* Người lập / duyệt */}
                <td style={tdStyle(c)}>
                  <div style={{ fontSize: 12, color: c.fgMuted }}>
                    Đề nghị: <span style={{ color: c.fg, fontWeight: 500 }}>{item.requestedByName || '--'}</span>
                  </div>
                  {item.approvedByName && (
                    <div style={{ fontSize: 11.5, color: c.fgFaint, marginTop: 2 }}>
                      Duyệt: <span style={{ color: c.fgMuted }}>{item.approvedByName}</span>
                    </div>
                  )}
                </td>

                {/* Thao tác */}
                <td style={{ ...tdStyle(c), textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    {canReview && onReview && (
                      <Button
                        size="sm"
                        kind="primary"
                        onClick={() => onReview(item)}
                      >
                        Xét Duyệt
                      </Button>
                    )}
                    {canModify && onEdit && (
                      <Button
                        size="sm"
                        kind="ghost"
                        onClick={() => onEdit(item)}
                      >
                        Sửa
                      </Button>
                    )}
                    {canModify && onDelete && (
                      <Button
                        size="sm"
                        kind="danger"
                        onClick={() => onDelete(item)}
                      >
                        Hủy
                      </Button>
                    )}
                    {onViewDetail && (
                      <Button
                        size="sm"
                        kind="soft"
                        onClick={() => onViewDetail(item)}
                      >
                        Chi Tiết
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {dispatches.length > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={dispatches.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
}

function thStyle(c, align = 'left') {
  return {
    textAlign: align,
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.fgFaint,
    whiteSpace: 'nowrap',
  };
}

function tdStyle(c) {
  return {
    padding: '12px 16px',
    verticalAlign: 'middle',
    fontSize: 13,
    color: c.fg,
  };
}
