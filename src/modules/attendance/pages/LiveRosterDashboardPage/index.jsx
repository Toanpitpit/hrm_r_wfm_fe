import React from 'react';
import { useLiveRoster } from '../../hooks/useLiveRoster';
import Icon from '@/shared/components/ui/Icon';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

export const LiveRosterDashboardPage = ({ storeId = 1 }) => {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 w-fit">
            <Icon name="check" size={14} color="#34d399" />
            <span>ĐÃ CÓ MẶT</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1.5 w-fit">
            <Icon name="clock" size={14} color="#60a5fa" />
            <span>ĐÃ HOÀN THÀNH CA</span>
          </span>
        );
      case 'FRAUD_FLAGGED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 w-fit">
            <Icon name="alert-triangle" size={14} color="#f87171" />
            <span>GẮN CỜ VI PHẠM</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 w-fit">
            <Icon name="x" size={14} color="#94a3b8" />
            <span>CHƯA CÓ MẶT</span>
          </span>
        );
    }
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="live-roster"
          activePath="/store-manager/live-roster"
        />
      }
      topbar={
        <DashboardTopbar
          page="live-roster"
          fallbackTitle="Bảng Quân Số Trực Ca Live"
          pageTitles={{ 'live-roster': 'Bảng Quân Số Trực Ca Live' }}
        />
      }
    >
      <div className="p-2 sm:p-4 text-white">
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
                      <td className="py-4 px-5">{getStatusBadge(item.status)}</td>
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

      {/* Flag Fraud Modal */}
      {flagModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleFlagFraudSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Icon name="alert-triangle" size={20} color="#f87171" />
              <span>GẮN CỜ NGHI NGỜ GIAN LẬN / VẮNG MẶT</span>
            </h3>
            <p className="text-xs text-slate-400">
              Nhân viên: <strong className="text-white">{flagModal.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Lý do gắn cờ vi phạm:</label>
              <textarea
                required
                rows="3"
                value={fraudReason}
                onChange={(e) => setFraudReason(e.target.value)}
                placeholder="VD: Đã check-in trên hệ thống nhưng thực tế vắng mặt tại quầy..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
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
    </DashboardShell>
  );
};

export default LiveRosterDashboardPage;
