import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';

export default function AttendanceOtpCard({
  loading,
  otpData,
  countdown,
  errorMsg,
  activeType,
  onRequestOtp,
  messages,
  onCopyOtp,
}) {
  const { c, fonts } = useAdminTheme();

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        background: `linear-gradient(180deg, ${c.bgCard}, ${c.bgElev})`,
        border: `1px solid ${c.border}`,
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        color: c.fg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Icon & Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingBottom: 16,
          marginBottom: 20,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: c.accentDim,
            border: `1px solid ${c.accent}`,
            color: c.accent,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="screen" size={24} />
        </div>
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: c.fg }}>
            {messages.CARD_TITLE}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: c.fgFaint }}>
            {messages.CARD_SUBTITLE}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => onRequestOtp('CHECK_IN')}
          disabled={loading}
          style={{
            height: 52,
            padding: '0 16px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: activeType === 'CHECK_IN' && otpData ? `1px solid ${c.tones.ok}` : `1px solid ${c.accent}`,
            background: activeType === 'CHECK_IN' && otpData ? c.tones.okDim : `linear-gradient(135deg, ${c.accent}, ${c.accentDim})`,
            color: activeType === 'CHECK_IN' && otpData ? c.tones.ok : c.ink,
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
          }}
        >
          <Icon name="pin" size={16} />
          <span>{messages.BTN_CHECKIN}</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestOtp('CHECK_OUT')}
          disabled={loading}
          style={{
            height: 52,
            padding: '0 16px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: `1px solid ${c.border}`,
            background: activeType === 'CHECK_OUT' && otpData ? c.accentDim : c.track,
            color: activeType === 'CHECK_OUT' && otpData ? c.accent : c.fgSubtle,
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
          }}
        >
          <Icon name="clock" size={16} />
          <span>{messages.BTN_CHECKOUT}</span>
        </button>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div style={{ padding: 16, borderRadius: 12, background: c.track, border: `1px solid ${c.border}`, textAlign: 'center', color: c.accent, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          {messages.STATUS_GENERATING}
        </div>
      )}



      {/* OTP Display Card */}
      {otpData && countdown > 0 && !loading && (
        <div
          style={{
            background: c.bgRaised,
            border: `1px solid ${c.accent}`,
            borderRadius: 16,
            padding: 20,
            textAlign: 'center',
            position: 'relative',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: c.tones.ok,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              letterSpacing: 0.5,
            }}
          >
            <Icon name="check" size={15} />
            <span>
              {messages.GPS_VALID_PREFIX} {otpData.distanceMeters} {messages.GPS_VALID_SUFFIX}
            </span>
          </div>

          <p style={{ fontSize: 12, color: c.fgFaint, marginBottom: 12 }}>
            {messages.OTP_INSTRUCTION_PREFIX} ({activeType === 'CHECK_IN' ? messages.CHECK_IN_LABEL : messages.CHECK_OUT_LABEL}) {messages.OTP_INSTRUCTION_SUFFIX}
          </p>

          {/* Large OTP Code Box */}
          <div
            style={{
              fontSize: 36,
              fontFamily: fonts.display,
              fontWeight: 900,
              letterSpacing: 10,
              color: c.accent,
              background: c.bgCard,
              padding: '14px 0',
              borderRadius: 12,
              border: `1px dashed ${c.accent}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              marginBottom: 16,
              userSelect: 'all',
            }}
          >
            {otpData.otpCode}
          </div>

          {/* Copy Button */}
          {onCopyOtp && (
            <button
              type="button"
              onClick={() => onCopyOtp(otpData.otpCode)}
              style={{
                background: c.track,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: '6px 14px',
                color: c.fgSubtle,
                fontSize: 11,
                fontWeight: 750,
                cursor: 'pointer',
                marginBottom: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="copy" size={13} />
              <span>{messages.BTN_COPY}</span>
            </button>
          )}

          {/* Progress Bar & Countdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, color: c.fgFaint, marginBottom: 6 }}>
              <span>{messages.EXPIRATION_TEXT}</span>
              <span style={{ color: c.accent, fontFamily: fonts.display, fontSize: 13 }}>{countdown}s</span>
            </div>
            <div style={{ width: '100%', height: 6, background: c.track, borderRadius: 10, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(countdown / 60) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${c.accent}, ${c.tones.ok})`,
                  borderRadius: 10,
                  transition: 'width 1s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Expired State */}
      {otpData && countdown === 0 && !loading && (
        <div style={{ padding: 14, borderRadius: 12, background: c.track, border: `1px solid ${c.border}`, textAlign: 'center', color: c.fgFaint, fontSize: 12, fontWeight: 650, marginBottom: 20 }}>
          {messages.EXPIRED_TEXT}
        </div>
      )}

      {/* Usage Guide Box */}
      <div
        style={{
          background: c.bgElev,
          border: `1px solid ${c.border}`,
          borderRadius: 14,
          padding: 16,
          fontSize: 11.5,
          color: c.fgFaint,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 800, color: c.fg, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="pulse" size={14} />
          <span>{messages.GUIDE_TITLE}</span>
        </div>
        <div>{messages.GUIDE_STEP_1}</div>
        <div>{messages.GUIDE_STEP_2}</div>
        <div>{messages.GUIDE_STEP_3}</div>
      </div>
    </div>
  );
}
