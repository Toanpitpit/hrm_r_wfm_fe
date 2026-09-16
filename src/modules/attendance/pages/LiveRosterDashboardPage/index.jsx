import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';
import PageHeader from '@/shared/components/ui/PageHeader';
import Panel from '@/shared/components/ui/Panel';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Icon from '@/shared/components/ui/Icon';
import DataTable from '@/shared/components/ui/DataTable';
import { getNavItemsForRole } from '@/shared/constants/navigation.config';
import { useLiveRoster } from '../../hooks/useLiveRoster';

export const LiveRosterDashboardPage = ({ storeId = 1 }) => {
  const { c, fonts } = useAdminTheme();
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (storedUser?.role || storedUser?.Role || 'SHIFT_LEADER').toUpperCase();
  const roleName = storedUser?.roleName || 'Trưởng Ca Trực';
  const navItems = getNavItemsForRole(userRole);

  const handleSidebarNavigate = (id) => {
    if (id === 'my-calendar') navigate('/employee/my-calendar');
    else if (id === 'employee-attendance') navigate('/employee/attendance-history');
    else if (id === 'attendance-otp') navigate('/employee/attendance-otp');
    else if (id === 'live-roster') navigate('/store-manager/live-roster');
  };

  const {
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
  } = useLiveRoster(storeId);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge tone="ok" dot>ĐÃ CÓ MẶT</Badge>;
      case 'COMPLETED':
        return <Badge tone="info" dot>ĐÃ HOÀN THÀNH CA</Badge>;
      case 'FRAUD_FLAGGED':
        return <Badge tone="bad" dot>GẮN CỜ VI PHẠM</Badge>;
      default:
        return <Badge tone="neutral" dot>CHƯA CÓ MẶT</Badge>;
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Icon name="users" size={26} color="#60a5fa" />
            <span>BẢNG QUÂN SỐ TRỰC TIẾP (LIVE ROSTER)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi nhân sự thực tế có mặt theo thời gian thực và đối soát ảnh chụp Kiosk S3
          </p>
        </div>

        <button
          onClick={fetchRoster}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Icon name="refresh" size={16} color="#60a5fa" />
          <span>LÀM MỚI (AUTOREFRESH 15S)</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-5">Nhân Viên</th>
                <th className="py-4 px-5">Chức Vụ</th>
                <th className="py-4 px-5">Ca Trực</th>
                <th className="py-4 px-5">Giờ Check-in / Check-out</th>
                <th className="py-4 px-5">Ảnh Chụp S3 (Kiosk)</th>
                <th className="py-4 px-5">Trạng Thái</th>
                <th className="py-4 px-5 text-right">Thao Tác Giám Sát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
              {roster.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Không có phân công ca trực nào cho cửa hàng hôm nay.
                  </td>
                </tr>
              ) : (
                roster.map((item) => (
                  <tr key={item.assignmentId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{item.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.employeeCode}</div>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-300">{item.positionName}</td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-blue-300">{item.shiftName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.startTime} - {item.endTime}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {item.checkInTime ? (
                        <div className="text-emerald-400 font-mono font-bold">
                          In: {new Date(item.checkInTime).toLocaleTimeString('vi-VN')}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">Chưa vào ca</div>
                      )}
                      {item.checkOutTime && (
                        <div className="text-blue-400 font-mono font-bold mt-0.5">
                          Out: {new Date(item.checkOutTime).toLocaleTimeString('vi-VN')}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2">
                        {item.checkInPhotoPresignedUrl ? (
                          <button
                            onClick={() =>
                              setSelectedPhoto({
                                url: item.checkInPhotoPresignedUrl,
                                title: 'Ảnh chụp Kiosk lúc Check-in',
                                name: item.fullName,
                              })
                            }
                            className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1"
                          >
                            <Icon name="eye" size={14} color="#60a5fa" />
                            <span>Check-in</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">Không có ảnh</span>
                        )}

                        {item.checkOutPhotoPresignedUrl && (
                          <button
                            onClick={() =>
                              setSelectedPhoto({
                                url: item.checkOutPhotoPresignedUrl,
                                title: 'Ảnh chụp Kiosk lúc Check-out',
                                name: item.fullName,
                              })
                            }
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1"
                          >
                            <Icon name="eye" size={14} color="#818cf8" />
                            <span>Check-out</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">{renderStatusBadge(item.status)}</td>
                    <td className="py-4 px-5 text-right">
                      {item.attendanceId && !item.isFraudFlagged && (
                        <button
                          onClick={() => setFlagModal({ attendanceId: item.attendanceId, name: item.fullName })}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto transition-all"
                        >
                          <Icon name="alert-triangle" size={14} color="#f87171" />
                          <span>Gắn Cờ Vi Phạm</span>
                        </button>
                      )}

                      {item.isFraudFlagged && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResolveFraud(item.attendanceId, true)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Khôi Phục Công
                          </button>
                          <button
                            onClick={() => handleResolveFraud(item.attendanceId, false)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold transition-all"
                          >
                            Bác Bỏ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* S3 Presigned Temporary Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white mb-1">{selectedPhoto.title}</h3>
            <p className="text-xs text-slate-400 mb-4">Nhân viên: {selectedPhoto.name} (Link ảnh tạm thời S3)</p>

            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center max-h-96">
              <img src={selectedPhoto.url} alt="Kiosk Portrait" className="w-full object-cover" />
            </div>
          </div>
        </div>
      )}

        {/* Modal Gắn Cờ Gian Lận */}
        {flagModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'grid',
              placeItems: 'center',
              padding: 16,
            }}
          >
            <form
              onSubmit={handleFlagFraudSubmit}
              style={{
                backgroundColor: c.bgCard,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 24,
                maxWidth: 440,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: c.tones.bad, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Icon name="close" size={20} color={c.tones.bad} />
                <span>GẮN CỜ NGHI NGỜ GIAN LẬN / VẮNG MẶT</span>
              </h3>
              <p style={{ fontSize: 12.5, color: c.fgSubtle, margin: 0 }}>
                Nhân viên: <strong style={{ color: c.fg }}>{flagModal.name}</strong>
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: c.fgSubtle, textTransform: 'uppercase', marginBottom: 6 }}>
                  Lý do gắn cờ vi phạm:
                </label>
                <textarea
                  required
                  rows="3"
                  value={fraudReason}
                  onChange={(e) => setFraudReason(e.target.value)}
                  placeholder="VD: Đã check-in trên hệ thống nhưng thực tế vắng mặt tại quầy..."
                  style={{
                    width: '100%',
                    padding: 10,
                    backgroundColor: c.bgElev,
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    color: c.fg,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setFlagModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                HỦY
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30"
              >
                XÁC NHẬN GẮN CỜ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveRosterDashboardPage;
