import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { ATTENDANCE_MESSAGES } from '@/shared/constants/message.constants';
import { useToast } from '@/components/ui/toast/ToastProvider';

export const useCheckInMobile = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeType, setActiveType] = useState('CHECK_IN');
  const [otpHistory, setOtpHistory] = useState([]);

  useEffect(() => {
    let timer = null;
    if (otpData && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setOtpData(null);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpData, countdown]);

  const handleRequestOtp = (type = 'CHECK_IN') => {
    setActiveType(type);
    setLoading(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      const msg = ATTENDANCE_MESSAGES.GPS_NOT_SUPPORTED;
      setErrorMsg(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await attendanceService.requestOtp(latitude, longitude, type);
          setLoading(false);

          if (res.success && res.data) {
            setOtpData(res.data);
            const secs = res.data.expiresInSeconds || 60;
            setCountdown(secs);

            const newHistoryItem = {
              id: Date.now(),
              otpCode: res.data.otpCode,
              type: type,
              distanceMeters: res.data.distanceMeters,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + secs * 1000),
            };
            setOtpHistory((prev) => [newHistoryItem, ...prev]);

            toast.success(res.message || `Đã cấp mã OTP ${type === 'CHECK_IN' ? 'Check-In' : 'Check-Out'} thành công!`);
          } else {
            const msg = res.message || ATTENDANCE_MESSAGES.OTP_REQUEST_FAILED;
            setErrorMsg(msg);
            toast.error(msg);
          }
        } catch (err) {
          setLoading(false);
          const msg = err?.response?.data?.message || err?.message || ATTENDANCE_MESSAGES.OTP_REQUEST_FAILED;
          setErrorMsg(msg);
          toast.error(msg);
        }
      },
      (err) => {
        setLoading(false);
        const msg = err.code === err.PERMISSION_DENIED
          ? ATTENDANCE_MESSAGES.GPS_PERMISSION_DENIED
          : ATTENDANCE_MESSAGES.GPS_FAILED;
        setErrorMsg(msg);
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return {
    loading,
    otpData,
    countdown,
    errorMsg,
    activeType,
    otpHistory,
    handleRequestOtp,
  };
};

export default useCheckInMobile;
