import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { ATTENDANCE_MESSAGES } from '@/shared/constants/message.constants';

export const useCheckInMobile = () => {
  const [loading, setLoading] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeType, setActiveType] = useState('CHECK_IN');

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

  const handleRequestOtp = (type) => {
    setActiveType(type);
    setLoading(true);
    setErrorMsg('');
    setOtpData(null);

    if (!navigator.geolocation) {
      setErrorMsg(ATTENDANCE_MESSAGES.GPS_NOT_SUPPORTED);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await attendanceService.requestOtp(latitude, longitude, type);
        setLoading(false);

        if (res.success && res.data) {
          setOtpData(res.data);
          setCountdown(res.data.expiresInSeconds || 60);
        } else {
          setErrorMsg(res.message || ATTENDANCE_MESSAGES.OTP_REQUEST_FAILED);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg(ATTENDANCE_MESSAGES.GPS_PERMISSION_DENIED);
        } else {
          setErrorMsg(ATTENDANCE_MESSAGES.GPS_FAILED);
        }
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
    handleRequestOtp,
  };
};

export default useCheckInMobile;
