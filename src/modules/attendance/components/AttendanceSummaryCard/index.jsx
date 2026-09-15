import React from 'react';
import StatCard from '@/shared/components/ui/StatCard';

export const AttendanceSummaryCard = ({ data }) => {
  if (!data) return null;

  const {
    totalAssignedShifts = 0,
    totalWorkedShifts = 0,
    totalAbsentShifts = 0,
    totalWorkHours = 0,
    absentPercentage = 0,
    attendanceRate = 0,
  } = data;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {/* Card 1: Số buổi làm việc */}
      <StatCard
        title="SỐ BUỔI LÀM VIỆC"
        value={`${totalWorkedShifts} / ${totalAssignedShifts}`}
        subtext="Đã đi làm trên tổng buổi phân công"
        icon="check"
        tone="ok"
      />

      {/* Card 2: Tổng giờ công */}
      <StatCard
        title="TỔNG GIỜ CÔNG"
        value={`${totalWorkHours} Giờ`}
        subtext="Thời gian làm việc thực tế trong tháng"
        icon="clock"
        tone="info"
      />

      {/* Card 3: % Đi làm */}
      <StatCard
        title="TỶ LỆ ĐỊ LÀM"
        value={`${attendanceRate}%`}
        subtext="Dựa trên số ca đã phân công"
        icon="pulse"
        tone="warn"
      />

      {/* Card 4: % Nghỉ */}
      <StatCard
        title="TỶ LỆ VẮNG MẶT (% NGHỈ)"
        value={`${absentPercentage}%`}
        subtext={`${totalAbsentShifts} buổi vắng mặt`}
        icon="close"
        tone={totalAbsentShifts > 0 ? "bad" : "neutral"}
      />
    </div>
  );
};

export default AttendanceSummaryCard;
