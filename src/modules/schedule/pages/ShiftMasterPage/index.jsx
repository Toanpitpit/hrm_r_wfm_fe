import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

// UI Components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Select from '@/shared/components/ui/Select';
import Icon from '@/shared/components/ui/Icon';

// Subcomponents & Hook
import { useShiftTemplate } from '../../hooks/useShiftTemplate';
import Shift24hTimeline from '../../components/Shift24hTimeline';
import ShiftTemplateTable from '../../components/ShiftTemplateTable';
import ShiftTemplateFormModal from '../../components/ShiftTemplateFormModal';
import ShiftImpactModal from '../../components/ShiftImpactModal';
import ShiftDeleteModal from '../../components/ShiftDeleteModal';

/**
 * ==============================================================================
 * MODULE: Khung Ca Mẫu (Shift Master Template)
 * ACTOR: Operations Admin (Các role khác chỉ xem)
 * PAGE: ShiftMasterPage (index.jsx)
 * ==============================================================================
 */
export default function ShiftMasterPage() {
  const navigate = useNavigate();
  const { c } = useAdminTheme();

  const {
    isOperationsAdmin,
    // Tab
    activeTab,
    setActiveTab,
    // 4 Thẻ thống kê từ API GET /api/shift-templates/stats
    stats,
    statsLoading,
    // Tab "Khung ca chung"
    globalShifts,
    allGlobalShifts,
    globalLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    // Tab "Khung ca chi nhánh"
    branches,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    effectiveData,
    customShifts,
    customLoading,
    modeSwitching,
    handleToggleBranchMode,
    // Modals
    formModalOpen,
    setFormModalOpen,
    editingShift,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreateShift,
    handleUpdateShift,
    handleToggleStatus,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingShift,
    setDeletingShift,
    handleOpenDeleteModal,
    handleDeleteShift,
    impactModal,
    setImpactModal,
  } = useShiftTemplate();

  // Tìm kiếm chi nhánh trong Tab Chi nhánh
  const [branchSearchText, _setBranchSearchText] = useState('');
  const filteredBranches = branches.filter((b) => {
    if (!branchSearchText.trim()) return true;
    const q = branchSearchText.toLowerCase();
    return b.name?.toLowerCase().includes(q) || b.code?.toLowerCase().includes(q);
  });

  const handleNavigate = (id) => {
    if (id === 'dashboard') navigate('/dashboard');
    if (id === 'branches') navigate('/branches');
    if (id === 'shift-master') navigate('/shifts/templates');
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="shift-master"
          activePath="/shifts/templates"
          onNavigate={handleNavigate}
          consoleLabel="OPERATIONS CONSOLE"
          brandName="RWFM Enterprise"
          roleLabel={isOperationsAdmin ? 'Operations Admin' : 'Người xem'}
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Quản Trị Vận Hành', href: '/dashboard' },
            { label: 'Vận Hành & Hệ Thống', href: '/shifts/templates' },
            { label: 'Khung Ca Mẫu' },
          ]}
        />
      }
    >
      {/* 1. Tiêu đề và nút hành động chính */}
      <PageHeader
        index="Operations Admin · Khung Ca Chuẩn"
        title="Bộ Khung Ca Mẫu Toàn Hệ Thống"

        actions={
          isOperationsAdmin ? (
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Icon name="plus" size={16} />
              <span>Thêm Khung Ca Mới</span>
            </Button>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: c.fgSubtle,
                backgroundColor: c.bgElev,
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
              }}
            >
              <Icon name="lock" size={14} />
              <span>Chế độ chỉ xem</span>
            </div>
          )
        }
      />

      {/* 2. Thẻ thống kê 4 ô lấy từ GET /api/shift-templates/stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <StatCard
          label="TỔNG CA CHUNG"
          value={statsLoading ? '...' : stats.totalGlobalShifts}
          tone="neutral"
          icon="calendar"
          hint="Áp dụng mặc định toàn chuỗi"
        />
        <StatCard
          label="DÙNG CA CHUNG"
          value={statsLoading ? '...' : `${stats.branchesUsingGlobal} chi nhánh`}
          tone="good"
          icon="check"
          hint="Áp dụng đồng bộ bộ ca chuỗi"
        />
        <StatCard
          label="DÙNG CA RIÊNG"
          value={statsLoading ? '...' : `${stats.branchesUsingCustom} chi nhánh`}
          tone="accent"
          icon="building"
          hint="Thiết lập bộ ca độc lập riêng"
        />
        <StatCard
          label="CA QUA ĐÊM"
          value={statsLoading ? '...' : stats.overnightShifts}
          tone="accent"
          icon="lock"
          hint="Tính phụ cấp ca đêm tự động"
        />
      </div>

      {/* 4. Hai Tab điều hướng: "Khung ca chung" | "Khung ca chi nhánh" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
          borderBottom: `1px solid ${c.border}`,
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('GLOBAL')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'GLOBAL' ? `${c.accent}20` : 'transparent',
            color: activeTab === 'GLOBAL' ? c.accent : c.fgSubtle,
            border: activeTab === 'GLOBAL' ? `1px solid ${c.accent}50` : '1px solid transparent',
            transition: 'all 0.18s ease',
          }}
        >
          <Icon name="globe" size={16} />
          <span>Khung Ca Chung</span>
          <span
            style={{
              fontSize: '11px',
              padding: '1px 7px',
              borderRadius: '10px',
              backgroundColor: activeTab === 'GLOBAL' ? c.accent : c.bgElev,
              color: activeTab === 'GLOBAL' ? '#000000' : c.fgSubtle,
              fontWeight: 700,
            }}
          >
            {allGlobalShifts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BRANCH')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'BRANCH' ? `${c.accent}20` : 'transparent',
            color: activeTab === 'BRANCH' ? c.accent : c.fgSubtle,
            border: activeTab === 'BRANCH' ? `1px solid ${c.accent}50` : '1px solid transparent',
            transition: 'all 0.18s ease',
          }}
        >
          <Icon name="building" size={16} />
          <span>Khung Ca Chi Nhánh</span>
          <span
            style={{
              fontSize: '11px',
              padding: '1px 7px',
              borderRadius: '10px',
              backgroundColor: activeTab === 'BRANCH' ? (c.primary || '#0D9488') : c.bgElev,
              color: activeTab === 'BRANCH' ? '#ffffff' : c.fgSubtle,
              fontWeight: 700,
            }}
          >
            {branches.length}
          </span>
        </button>
      </div>

      {/* ============================================================================== */}
      {/* 5. NỘI DUNG TAB 1: KHUNG CA CHUNG (scope = GLOBAL) */}
      {/* ============================================================================== */}
      {activeTab === 'GLOBAL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Thông báo số chi nhánh đang dùng ca chung */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: c.bgElev,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              color: c.fgSubtle,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span>
                Hiện có <strong style={{ color: c.fg }}>{stats.branchesUsingGlobal} chi nhánh</strong> đang áp dụng bộ ca chung của chuỗi.
              </span>
            </div>
            <div style={{ fontSize: '12px' }}>
              Chỉ hiển thị các ca có phạm vi <strong>GLOBAL</strong>
            </div>
          </div>

          {/* Sơ đồ 24h Timeline ca chung */}
          <Shift24hTimeline
            shifts={allGlobalShifts}
            sourceLabel="Ca chung toàn chuỗi"
            title="Sơ Đồ Phân Bổ Ca Trực Chuỗi 24 Giờ"
            subtitle="Dòng thời gian hoạt động liên tục toàn chuỗi trong 24 giờ"
          />

          {/* Bảng dữ liệu Khung ca chung */}
          <Panel>
            {/* Bộ lọc tìm kiếm & nhóm ca */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ flex: '1', minWidth: '280px', maxWidth: '420px' }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Tìm theo tên ca, mã ca, mô tả..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: c.fgSubtle }}>Phân loại ca:</span>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  options={[
                    { value: 'ALL', label: 'Tất cả khung ca' },
                    { value: 'Morning', label: 'Ca Sáng' },
                    { value: 'Afternoon', label: 'Ca Chiều' },
                    { value: 'Night', label: 'Ca Đêm' },
                    { value: 'ACTIVE', label: 'Đang áp dụng' },
                    { value: 'OVERNIGHT', label: 'Ca trực qua đêm' },
                  ]}
                />
              </div>
            </div>

            {/* Bảng danh sách ca chung */}
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <ShiftTemplateTable shifts={globalShifts}
              loading={globalLoading}
              isOperationsAdmin={isOperationsAdmin}
              onEdit={handleOpenEditModal}
              onToggleStatus={handleToggleStatus}
              onDelete={handleOpenDeleteModal}
              emptyMessage="Chưa có khung ca chung nào phù hợp với bộ lọc."
            />
          </div>
          </Panel>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 6. NỘI DUNG TAB 2: KHUNG CA CHI NHÁNH */}
      {/* ============================================================================== */}
      {activeTab === 'BRANCH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bảng điều khiển Chọn Chi Nhánh & Chuyển đổi Chế Độ Ca */}
          <Panel style={{ padding: '16px 20px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              {/* Bộ chọn chi nhánh có tìm kiếm */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '300px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: `${c.accent}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: c.accent,
                    flexShrink: 0,
                  }}
                >
                  <Icon name="pin" size={18} />
                </div>

                <div style={{ flex: 1, maxWidth: '440px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: c.fgSubtle,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    Chọn Chi Nhánh Áp Dụng
                  </label>
                  <Select
                    value={String(selectedBranchId || '')}
                    onChange={(val) => setSelectedBranchId(val)}
                    options={filteredBranches.map((b) => ({
                      value: String(b.id),
                      label: `${b.name} • [${b.shiftMode === 'CUSTOM' ? 'Ca riêng' : 'Ca chung'}]${b.isLocked ? ' 🔒 (Đang khóa)' : ''}`,
                    }))}
                  />
                </div>
              </div>

              {/* Control đổi chế độ ca: "Dùng ca chung | Dùng ca riêng" */}
              {selectedBranch && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '11.5px', color: c.fgSubtle, fontWeight: 600, textTransform: 'uppercase' }}>
                    Chế Độ Khung Ca Hiện Tại
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedBranch.isLocked && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          color: '#f87171',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                        }}
                      >
                        <Icon name="lock" size={12} color="#f87171" />
                        <span>Chi nhánh bị khóa</span>
                      </span>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        borderRadius: '8px',
                        backgroundColor: c.bgElev,
                        border: `1px solid ${c.border}`,
                        padding: '3px',
                      }}
                      role="radiogroup"
                      aria-label="Chế độ ca của chi nhánh"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedBranch.shiftMode === 'GLOBAL'}
                        disabled={!isOperationsAdmin || selectedBranch.isLocked || modeSwitching}
                        onClick={() => {
                          if (selectedBranch.shiftMode !== 'GLOBAL') {
                            handleToggleBranchMode('GLOBAL');
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: !isOperationsAdmin || selectedBranch.isLocked ? 'not-allowed' : 'pointer',
                          backgroundColor:
                            selectedBranch.shiftMode === 'GLOBAL' ? (c.primary || '#0D9488') : 'transparent',
                          color:
                            selectedBranch.shiftMode === 'GLOBAL' ? '#ffffff' : c.fgSubtle,
                          border: 'none',
                          transition: 'all 0.18s ease',
                          opacity: !isOperationsAdmin || selectedBranch.isLocked ? 0.6 : 1,
                        }}
                      >
                        Dùng ca chung
                      </button>

                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedBranch.shiftMode === 'CUSTOM'}
                        disabled={!isOperationsAdmin || selectedBranch.isLocked || modeSwitching}
                        onClick={() => {
                          if (selectedBranch.shiftMode !== 'CUSTOM') {
                            handleToggleBranchMode('CUSTOM');
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: !isOperationsAdmin || selectedBranch.isLocked ? 'not-allowed' : 'pointer',
                          backgroundColor:
                            selectedBranch.shiftMode === 'CUSTOM' ? (c.primary || '#0D9488') : 'transparent',
                          color:
                            selectedBranch.shiftMode === 'CUSTOM' ? '#ffffff' : c.fgSubtle,
                          border: 'none',
                          transition: 'all 0.18s ease',
                          opacity: !isOperationsAdmin || selectedBranch.isLocked ? 0.6 : 1,
                        }}
                      >
                        Dùng ca riêng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          {/* Sơ đồ 24h Timeline của bộ ca ĐANG HIỆU LỰC (effective-shifts) */}
          <Shift24hTimeline
            shifts={effectiveData.shifts}
            sourceLabel={effectiveData.source === 'CUSTOM' ? 'Ca riêng chi nhánh' : 'Ca chung'}
            title={`Bộ Ca Đang Hiệu Lực • ${selectedBranch?.name || ''}`}
            subtitle={`Chi nhánh đang áp dụng ${
              effectiveData.source === 'CUSTOM'
                ? 'bộ ca riêng độc lập của chính mình'
                : 'bộ ca chuẩn chung của toàn hệ thống'
            }`}
            emptyMessage="Chi nhánh chưa có khung ca nào đang áp dụng."
          />

          {/* Danh sách ca riêng của chi nhánh */}
          <Panel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: c.fg }}>
                  Danh Sách Ca Riêng Của Chi Nhánh ({customShifts.length})
                </div>
                <div style={{ fontSize: '12px', color: c.fgSubtle, marginTop: '2px' }}>
                  {selectedBranch?.shiftMode === 'GLOBAL'
                    ? 'Chi nhánh đang ở chế độ "Dùng ca chung", danh sách ca riêng dưới đây tạm thời chưa kích hoạt.'
                    : 'Các ca riêng dưới đây đang được áp dụng trực tiếp cho việc xếp lịch làm việc tại chi nhánh.'}
                </div>
              </div>
            </div>

            {/* Trạng thái trống nếu chưa có ca riêng nào */}
            {customShifts.length === 0 && !customLoading ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                  borderRadius: '10px',
                  border: `1px dashed ${c.border}`,
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${c.accent}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: c.accent,
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon name="clock" size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: c.fg, marginBottom: '4px' }}>
                  Chưa có ca riêng
                </div>
                <div style={{ fontSize: '13px', color: c.fgSubtle, maxWidth: '420px', margin: '0 auto 16px' }}>
                  Thêm ca riêng để có thể chuyển sang chế độ ca riêng. Khi ở chế độ ca chung, cửa hàng sẽ dùng bộ ca mặc định của chuỗi.
                </div>
              </div>
            ) : (
              <ShiftTemplateTable
                shifts={customShifts}
                loading={customLoading}
                isOperationsAdmin={isOperationsAdmin && !selectedBranch?.isLocked}
                isBranchMuted={selectedBranch?.shiftMode === 'GLOBAL'}
                onEdit={handleOpenEditModal}
                onToggleStatus={handleToggleStatus}
                onDelete={handleOpenDeleteModal}
                emptyMessage="Chi nhánh chưa có ca riêng nào."
              />
            )}
          </Panel>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 7. MODAL THÊM / SỬA KHUNG CA */}
      {/* ============================================================================== */}
      <ShiftTemplateFormModal
        open={formModalOpen}
        initialData={editingShift}
        defaultScope={activeTab === 'BRANCH' ? 'BRANCH' : 'GLOBAL'}
        defaultBranchId={selectedBranchId}
        branches={branches}
        allGlobalShifts={allGlobalShifts}
        customShifts={customShifts}
        existingShifts={activeTab === 'BRANCH' ? customShifts : allGlobalShifts}
        onClose={() => {
          setFormModalOpen(false);
          setEditingShift(null);
        }}
        onDelete={handleOpenDeleteModal}
        onSubmit={async (formData) => {
          if (editingShift) {
            return await handleUpdateShift(editingShift.id || editingShift.shiftId, formData);
          } else {
            return await handleCreateShift(formData);
          }
        }}
      />

      {/* ============================================================================== */}
      {/* 8. MODAL XÁC NHẬN XUNG ĐỘT 409 (FUTURE_SCHEDULES_EXIST & IMPACT_CONFIRM_REQUIRED) */}
      {/* ============================================================================== */}
      <ShiftImpactModal
        open={impactModal.open}
        title={impactModal.title}
        message={impactModal.message}
        confirmLabel={impactModal.confirmLabel}
        loading={modeSwitching}
        onClose={() => setImpactModal((prev) => ({ ...prev, open: false }))}
        onConfirm={async () => {
          if (impactModal.onConfirm) {
            await impactModal.onConfirm();
          }
        }}
      />

      {/* ============================================================================== */}
      {/* 9. MODAL XÁC NHẬN XÓA KHUNG CA */}
      {/* ============================================================================== */}
      <ShiftDeleteModal
        open={deleteModalOpen}
        shift={deletingShift}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingShift(null);
        }}
        onConfirm={handleDeleteShift}
      />
    </DashboardShell>
  );
}
