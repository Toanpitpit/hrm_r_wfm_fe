import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { ATTENDANCE_MESSAGES } from '@/shared/constants/message.constants';

export const useLiveRoster = (initialStoreId = null) => {
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const storeId = initialStoreId || storedUser?.storeId || storedUser?.homeBranchId || storedUser?.branchId || 1;

  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal xem ảnh chụp xác thực tại Kiosk
  const [selectedPhoto, setSelectedPhoto] = useState(null); // { url, title, name }

  const fetchRoster = async () => {
    if (!storeId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await attendanceService.getLiveRoster(storeId);
      if (res.success && Array.isArray(res.data)) {
        setRoster(res.data);
      } else {
        setErrorMsg(res.message || ATTENDANCE_MESSAGES.FETCH_ROSTER_FAILED);
      }
    } catch (err) {
      setErrorMsg(ATTENDANCE_MESSAGES.FETCH_ROSTER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    const interval = setInterval(fetchRoster, 15000); // Tự động làm mới mỗi 15 giây
    return () => clearInterval(interval);
  }, [storeId]);

  return {
    roster,
    loading,
    errorMsg,
    selectedPhoto,
    setSelectedPhoto,
    fetchRoster,
  };
};

export default useLiveRoster;
