import { useState, useEffect, useCallback } from 'react';
import { myScheduleService } from '../services/mySchedule.service';

/**
 * Lấy ngày Thứ Hai của tuần chứa date
 */
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi Chủ Nhật (day = 0)
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
};

/**
 * Custom Hook quản lý dữ liệu Lịch làm việc tuần
 */
export const useMyCalendar = () => {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedule = useCallback(async (start) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await myScheduleService.getMyWeeklySchedule(start);
      if (res.success) {
        setScheduleData(res.data);
      } else {
        setError(res.message || 'Có lỗi xảy ra khi tải lịch làm việc.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(weekStart);
  }, [weekStart, fetchSchedule]);

  const goNextWeek = () => {
    const current = new Date(weekStart);
    current.setDate(current.getDate() + 7);
    setWeekStart(current.toISOString().split('T')[0]);
  };

  const goPrevWeek = () => {
    const current = new Date(weekStart);
    current.setDate(current.getDate() - 7);
    setWeekStart(current.toISOString().split('T')[0]);
  };

  const goToCurrentWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  return {
    weekStart,
    scheduleData,
    isLoading,
    error,
    goNextWeek,
    goPrevWeek,
    goToCurrentWeek,
    refetch: () => fetchSchedule(weekStart),
  };
};
