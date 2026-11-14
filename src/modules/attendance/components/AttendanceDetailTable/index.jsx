import React from 'react';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '--:--';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const renderCheckInBadge = (row) => {
  if (!row.checkInTime) {
    return <span style={{ color: '#94A3B8', fontSize: 11.5, fontStyle: 'italic' }}>Chưa vào ca</span>;
  }
  const st = row.checkInStatus;
  if (st === 'LATE' || row.isLate) {
    return <Badge tone="warn">Đi Muộn</Badge>;
  }
  if (st === 'EARLY') {
    return <Badge tone="info">Đến Sớm</Badge>;
  }
  if (st === 'ON_TIME') {
    return <Badge tone="ok">Đúng Giờ</Badge>;
  }
  if (st === 'PENDING') {
    return <Badge tone="pending">Chờ Ảnh</Badge>;
  }
  return <Badge tone="ok">Đúng Giờ</Badge>;
};

const renderCheckOutBadge = (row) => {
  if (!row.checkOutTime) {
    return <span style={{ color: '#94A3B8', fontSize: 11.5, fontStyle: 'italic' }}>Chưa ra ca</span>;
  }
  const st = row.checkOutStatus;
  if (st === 'EARLY_LEAVE') {
    return <Badge tone="bad">Về Sớm</Badge>;
  }
  if (st === 'LATE_LEAVE') {
    return <Badge tone="purple">Ra Muộn</Badge>;
  }
  if (st === 'ON_TIME') {
    return <Badge tone="ok">Đúng Giờ</Badge>;
  }
  return <Badge tone="ok">Đã Ra Ca</Badge>;
};

const renderSessionStatusBadge = (status) => {
  switch (status) {
    case 'PRESENT':
      return <Badge tone="ok" dot>Có Mặt</Badge>;
    case 'COMPLETED':
      return <Badge tone="info" dot>Hoàn Thành</Badge>;
    case 'INCOMPLETE':
      return <Badge tone="warn" dot>Chưa Check-out</Badge>;
    case 'ABSENT':
      return <Badge tone="bad" dot>Vắng Mặt</Badge>;
    case 'CANCELLED':
      return <Badge tone="neutral" dot>Nghỉ Phép</Badge>;
    case 'NOT_YET':
    default:
      return <Badge tone="neutral" dot>Chưa Đến Giờ</Badge>;
  }
};

export const AttendanceDetailTable = ({ details = [] }) => {
  const columns = [
    {
      key: 'date',
      label: 'Ngày',
      w: '85px',
      render: (row) => {
        const [, mStr, dStr] = (row.date || '').split('-');
        return <span style={{ fontWeight: 700 }}>{dStr}/{mStr}</span>;
      },
    },
    { key: 'dayOfWeek', label: 'Thứ', w: '80px' },
    {
      key: 'shiftName',
      label: 'Ca Làm Việc',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.shiftName}</span>,
    },
    {
      key: 'shiftStart',
      label: 'Khung Giờ',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {row.shiftStart?.substring(0, 5)} - {row.shiftEnd?.substring(0, 5)}
        </span>
      ),
    },
    {
      key: 'branchName',
      label: 'Địa Điểm',
      render: (row) => (
        <div>
          <span>{row.branchName}</span>
          {row.isDispatched && (
            <span style={{ marginLeft: 6 }}>
              <Badge tone="info">Điều Động</Badge>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'checkInTime',
      label: 'Vào Ca',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>
            {formatTime(row.checkInTime)}
          </span>
          {renderCheckInBadge(row)}
        </div>
      ),
    },
    {
      key: 'checkOutTime',
      label: 'Ra Ca',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>
            {formatTime(row.checkOutTime)}
          </span>
          {renderCheckOutBadge(row)}
        </div>
      ),
    },
    {
      key: 'actualWorkMinutes',
      label: 'Giờ Thực Tế',
      render: (row) =>
        row.actualWorkMinutes != null
          ? `${(row.actualWorkMinutes / 60).toFixed(1)} giờ`
          : '-',
    },
    {
      key: 'status',
      label: 'Trạng Thái Ca',
      render: (row) => renderSessionStatusBadge(row.status),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={details}
      data={details}
      keyField="date"
      emptyText="Không có dữ liệu ca làm việc nào trong tháng này."
    />
  );
};

export default AttendanceDetailTable;
