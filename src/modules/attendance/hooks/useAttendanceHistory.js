import { useState, useEffect, useCallback } from 'react';
import { myScheduleService } from '../services/mySchedule.service';

/**
 * Custom Hook quản lý dữ liệu Lịch sử chấm công theo tháng
 */
export const useAttendanceHistory = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (m, y) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await myScheduleService.getMyAttendanceHistory(m, y);
      if (res.success) {
        setHistoryData(res.data);
      } else {
        setError(res.message || 'Có lỗi xảy ra khi tải lịch sử chấm công.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(month, year);
  }, [month, year, fetchHistory]);

  const changeMonthYear = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  return {
    month,
    year,
    historyData,
    isLoading,
    error,
    changeMonthYear,
    refetch: () => fetchHistory(month, year),
  };
};
