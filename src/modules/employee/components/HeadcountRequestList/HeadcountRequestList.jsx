import React, { useState } from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Button from '@/shared/components/ui/Button';
import headcountService, { HEADCOUNT_STATUS_META } from '../../services/headcount.service';

export default function HeadcountRequestList({
  requests = [],
  loading = false,
  canManageSystem = false,
  isStoreManager = false,
  onReviewRequest,
  onCloseRequest,
  onUploadNew,
}) {
  const { c, fonts } = useAdminTheme();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchBranch = r.branchName?.toLowerCase().includes(s);
      const matchRequester = r.requestedBy?.toLowerCase().includes(s);
      const matchReason = r.reason?.toLowerCase().includes(s);
      const matchId = String(r.id).includes(s);
      return matchBranch || matchRequester || matchReason || matchId;
    }
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const meta = HEADCOUNT_STATUS_META[status] || {
      label: status,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      border: 'rgba(148, 163, 184, 0.2)',
    };

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 9px',
          borderRadius: '9999px',
          fontSize: '11.5px',
          fontWeight: 600,
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          color: meta.color,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: meta.color }} />
        {meta.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: c.bgRaised,
          borderRadius: '8px',
          border: `1px solid ${c.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
          {/* Input Tìm kiếm */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <span
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: c.fgSubtle,
                display: 'flex',
              }}
            >
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, chi nhánh, lý do..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                background: c.bgCard,
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                color: c.fg,
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Lọc Trạng Thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: c.bgCard,
              border: `1px solid ${c.border}`,
              borderRadius: '6px',
              color: c.fg,
              fontSize: '12.5px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thẩm định</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="EXHAUSTED">Đã dùng hết</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="CLOSED">Đã đóng/hủy</option>
          </select>
        </div>

        {isStoreManager && (
          <Button
            variant="primary"
            size="sm"
            onClick={onUploadNew}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="upload" size={14} />
            <span>Gửi Đề Xuất Mới (.xlsx)</span>
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: c.fgSubtle }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
            <Icon name="refresh" size={20} color={c.accent} />
          </div>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>Đang tải danh sách đề xuất định biên...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            background: c.bgRaised,
            borderRadius: '8px',
            border: `1px dashed ${c.border}`,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.accent,
              marginBottom: '10px',
            }}
          >
            <Icon name="document" size={20} />
          </div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: c.fg, marginBottom: '4px' }}>
            Không có đơn đề xuất nào
          </h4>
          <p style={{ fontSize: '12.5px', color: c.fgSubtle, maxWidth: '400px', margin: '0 auto' }}>
            {statusFilter !== 'ALL'
              ? 'Không tìm thấy đơn nào theo trạng thái đã lọc.'
              : 'Chưa có đề xuất mở rộng định biên nào được gửi lên cho chi nhánh này.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            borderRadius: '8px',
            border: `1px solid ${c.border}`,
            background: c.bgRaised,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: c.bgElev, borderBottom: `1px solid ${c.border}` }}>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted }}>Mã Đơn</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted }}>Chi Nhánh & Người Gửi</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted }}>File Kèm / Lý Do</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted, textAlign: 'center' }}>
                  Chỉ Tiêu (Xin / Duyệt / Còn)
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted }}>Thời Hạn Hiệu Lực</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted }}>Trạng Thái</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: c.fgMuted, textAlign: 'right' }}>
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';

                return (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: `1px solid ${c.borderSub}`,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Mã Đơn */}
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: c.accent, fontFamily: fonts.mono }}>
                      #{req.id}
                    </td>

                    {/* Chi Nhánh & Người Gửi */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: c.fg }}>{req.branchName || `Chi nhánh #${req.branchId}`}</div>
                      <div style={{ fontSize: '11.5px', color: c.fgSubtle, marginTop: '2px' }}>
                        {req.requestedBy || 'Store Manager'} • {formatDate(req.createdAt)}
                      </div>
                    </td>

                    {/* File Kèm & Lý Do */}
                    <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          headcountService.downloadRequestFile(req);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: c.accent,
                          textAlign: 'left',
                        }}
                        title="Bấm để tải về và mở file đính kèm từ Cửa Hàng Trưởng"
                      >
                        <Icon name="download" size={13} color={c.accent} />
                        <span style={{ fontSize: '12px', fontWeight: 600, textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.fileName || 'Danh_sach.xlsx'}
                        </span>
                      </button>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: c.fgSubtle,
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={req.reason}
                      >
                        {req.reason}
                      </div>
                    </td>

                    {/* Chỉ tiêu (Xin / Duyệt / Còn) */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <span style={{ color: '#f59e0b' }} title="Số lượng đề xuất">{req.totalRequested}</span>
                        <span style={{ color: c.fgSubtle }}>/</span>
                        <span style={{ color: '#22c55e' }} title="Số lượng đã phê duyệt">{req.approvedQuantity || 0}</span>
                        <span style={{ color: c.fgSubtle }}>/</span>
                        <span
                          style={{
                            color: req.additionalQuantity > 0 ? '#38bdf8' : c.fgSubtle,
                            background: req.additionalQuantity > 0 ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                          title="Chỉ tiêu còn lại để tạo nhân sự"
                        >
                          {req.additionalQuantity || 0} còn
                        </span>
                      </div>
                    </td>

                    {/* Thời hạn hiệu lực */}
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: c.fgMuted }}>
                      {req.expiresAt ? (
                        <div>
                          <div>Đến: {formatDate(req.expiresAt)}</div>
                          {new Date(req.expiresAt) < new Date() && (
                            <span style={{ color: '#ef4444', fontSize: '10.5px' }}>(Đã hết hạn)</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: c.fgSubtle }}>Chưa duyệt</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td style={{ padding: '12px 14px' }}>
                      {getStatusBadge(req.status)}
                      {req.adminNotes && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: c.fgSubtle,
                            marginTop: '4px',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={`Ghi chú: ${req.adminNotes}`}
                        >
                          Ghi chú: {req.adminNotes}
                        </div>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* Admin thẩm định đơn */}
                        {canManageSystem && isPending && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onReviewRequest(req)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Icon name="check" size={13} />
                            <span>Thẩm Định</span>
                          </Button>
                        )}

                        {/* SM hủy đơn pending */}
                        {isStoreManager && isPending && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCloseRequest(req.id)}
                            title="Hủy đề xuất này"
                            style={{ color: '#ef4444' }}
                          >
                            <Icon name="close" size={13} />
                            <span>Hủy Đơn</span>
                          </Button>
                        )}

                        {/* Admin xem chi tiết lại đơn đã duyệt */}
                        {canManageSystem && !isPending && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReviewRequest(req)}
                            title="Xem lại thẩm định"
                          >
                            <Icon name="eye" size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
