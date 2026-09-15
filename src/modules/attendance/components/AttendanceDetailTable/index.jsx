import React from 'react';
import DataTable from '@/shared/components/ui/DataTable';
import Badge from '@/shared/components/ui/Badge';

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '--:--';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const renderStatusBadge = (status) => {
  switch (status) {
    case 'PRESENT':
      return <Badge tone="ok" dot>Có Mặt</Badge>;
    case 'INCOMPLETE':
      return <Badge tone="warn" dot>Chưa Check-out</Badge>;
    case 'ABSENT':
      return <Badge tone="bad" dot>Vắng Mặt</Badge>;
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
      w: '90px',
      render: (row) => {
        const [, mStr, dStr] = (row.date || '').split('-');
        return <span style={{ fontWeight: 700 }}>{dStr}/{mStr}</span>;
      },
    },
    { key: 'dayOfWeek', label: 'Thứ', w: '90px' },
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
      label: 'Check-In',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {formatTime(row.checkInTime)}
        </span>
      ),
    },
    {
      key: 'checkOutTime',
      label: 'Check-Out',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {formatTime(row.checkOutTime)}
        </span>
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
      label: 'Trạng Thái',
      render: (row) => renderStatusBadge(row.status),
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
