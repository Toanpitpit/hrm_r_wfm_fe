import React from 'react';
import { useCheckInMobile } from '../../hooks/useCheckInMobile';
import Icon from '@/shared/components/ui/Icon';

export const CheckInMobileWidget = () => {
  const {
    loading,
    otpData,
    countdown,
    errorMsg,
    activeType,
    handleRequestOtp,
  } = useCheckInMobile();

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
          <Icon name="screen" size={24} color="#38bdf8" />
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight">MÃ OTP ĐIỂM DANH TẠI QUẦY</h2>
          <p className="text-xs text-slate-400">Bật GPS di động trong phạm vi cửa hàng (&le;50m)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => handleRequestOtp('CHECK_IN')}
          disabled={loading}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeType === 'CHECK_IN' && otpData
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
          } disabled:opacity-50`}
        >
          <Icon name="map-pin" size={16} color="#ffffff" />
          <span>LẤY MÃ CHECK-IN</span>
        </button>

        <button
          onClick={() => handleRequestOtp('CHECK_OUT')}
          disabled={loading}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeType === 'CHECK_OUT' && otpData
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          } disabled:opacity-50`}
        >
          <Icon name="clock" size={16} color="#ffffff" />
          <span>LẤY MÃ CHECK-OUT</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 mb-4">
          <Icon name="alert-triangle" size={20} color="#f87171" />
          <div className="leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* OTP Display Card */}
      {otpData && countdown > 0 && (
        <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-6 text-center relative overflow-hidden shadow-inner">
          <div className="text-xs text-blue-400 font-medium mb-1 flex items-center justify-center gap-1.5">
            <Icon name="check" size={16} color="#4ade80" />
            <span>GPS HỢP LỆ • CÁCH CỬA HÀNG {otpData.distanceMeters}M</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Mã OTP {activeType === 'CHECK_IN' ? 'Check-in' : 'Check-out'} của bạn (Nhập tại iPad Kiosk quầy):
          </p>

          {/* Large OTP Digits */}
          <div className="text-4xl font-black tracking-[0.3em] font-mono text-white bg-slate-900/90 py-4 rounded-xl border border-slate-800 shadow-xl my-2">
            {otpData.otpCode}
          </div>

          {/* Progress Bar & Countdown */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-[11px] font-semibold mb-1.5 text-slate-400">
              <span>Mã có hiệu lực trong:</span>
              <span className="text-amber-400 font-mono text-xs">{countdown}s</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdown / 60) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInMobileWidget;
