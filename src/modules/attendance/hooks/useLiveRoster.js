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

  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState(null); // { url, title, name }
  const [flagModal, setFlagModal] = useState(null); // { attendanceId, name }
  const [fraudReason, setFraudReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
    const interval = setInterval(fetchRoster, 15000); // Autorefresh every 15s
    return () => clearInterval(interval);
  }, [storeId]);

  const handleFlagFraudSubmit = async (e) => {
    e.preventDefault();
    if (!flagModal || !fraudReason.trim()) return;

    setActionLoading(true);
    const res = await attendanceService.flagFraud(flagModal.attendanceId, fraudReason.trim());
    setActionLoading(false);

    if (res.success) {
      setFlagModal(null);
      setFraudReason('');
      fetchRoster();
    } else {
      alert(res.message || ATTENDANCE_MESSAGES.FLAG_FRAUD_FAILED);
    }
  };

  const handleResolveFraud = async (attendanceId, isApproved) => {
    if (
      !window.confirm(
        isApproved
          ? ATTENDANCE_MESSAGES.CONFIRM_RESTORE_SHIFT
          : ATTENDANCE_MESSAGES.CONFIRM_REJECT_CLAIM
      )
    ) {
      return;
    }

    setActionLoading(true);
    const res = await attendanceService.resolveFraud(attendanceId, isApproved);
    setActionLoading(false);

    if (res.success) {
      fetchRoster();
    } else {
      alert(res.message || ATTENDANCE_MESSAGES.RESOLVE_FRAUD_FAILED);
    }
  };

  return {
    roster,
    loading,
    errorMsg,
    selectedPhoto,
    setSelectedPhoto,
    flagModal,
    setFlagModal,
    fraudReason,
    setFraudReason,
    actionLoading,
    fetchRoster,
    handleFlagFraudSubmit,
    handleResolveFraud,
  };
};

export default useLiveRoster;
