import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import DashboardShell from '@/shared/components/layout/DashboardShell';
import DashboardSidebar from '@/shared/components/layout/DashboardSidebar';
import DashboardTopbar from '@/shared/components/layout/DashboardTopbar';

// UI components
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import Panel from '@/shared/components/ui/Panel';
import Button from '@/shared/components/ui/Button';
import SearchInput from '@/shared/components/ui/SearchInput';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import DataTable from '@/shared/components/ui/DataTable';

// Hook & Subcomponents
import { useBranchTier } from '../../hooks/useBranchTier';
import ChangeTierModal from '../../components/ChangeTierModal';
import { TierTable } from '../../components/TierTable';
import { TierFormModal } from '../../components/TierFormModal';
import { TierDeleteModal } from '../../components/TierDeleteModal';

const TIER_COLOR_PALETTE = [
  { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' },
  { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)' },
  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)' },
  { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.35)' },
  { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.35)' },
];

const getTierStyle = (tierObj, index = 0) => {
  const tName = (tierObj?.tierName || tierObj?.name || '').toLowerCase();
  if (tName.includes('flagship') || tName.includes('cấp 1') || tName.includes('tier 1')) {
    return TIER_COLOR_PALETTE[0];
  }
  if (tName.includes('tiêu chuẩn') || tName.includes('cấp 2') || tName.includes('tier 2')) {
    return TIER_COLOR_PALETTE[1];
  }
  if (tName.includes('mini') || tName.includes('cấp 3') || tName.includes('tier 3')) {
    return TIER_COLOR_PALETTE[2];
  }
  if (tName.includes('tier 4') || tName.includes('cấp 4')) {
    return TIER_COLOR_PALETTE[3];
  }
  if (tName.includes('tier 5') || tName.includes('cấp 5')) {
    return TIER_COLOR_PALETTE[4];
  }
  return TIER_COLOR_PALETTE[index % TIER_COLOR_PALETTE.length];
};

/**
 * ==============================================================================
 * MODULE: Quản lý Phân Cấp Chi Nhánh (Branch Tier Management)
 * ACTOR: Operations Admin / Business Owner
 * ROUTE: /branch-tiers
 * ==============================================================================
 * Cung cấp đầy đủ Thêm - Sửa - Xóa cho cả Chi Nhánh Phân Cấp & Danh Mục Tier.
 */
export default function BranchTierManagementPage() {
  const navigate = useNavigate();
  const { c, fonts } = useAdminTheme();

  const {
    branches,
    rawBranches,
    tiers,
    tierSummary,
    tierDefinitions,
    loading,
    tiersLoading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedTierFilter,
    setSelectedTierFilter,
    statusFilter,
    setStatusFilter,
    // Change Tier Modal
    changeTierModalOpen,
    setChangeTierModalOpen,
    selectedBranch,
    setSelectedBranch,
    updating,
    // Branch CRUD
    branchFormModalOpen,
    setBranchFormModalOpen,
    editingBranch,
    setEditingBranch,
    // Tier CRUD
    tierFormModalOpen,
    setTierFormModalOpen,
    editingTier,
    setEditingTier,
    tierDeleteModalOpen,
    setTierDeleteModalOpen,
    deletingTier,
    setDeletingTier,
    tierActionLoading,
    // Handlers
    handleUpdateTierAndQuota,
    handleCreateBranch,
    handleUpdateBranch,
    handleCreateTier,
    handleUpdateTierDefinition,
    handleDeleteTier,
  } = useBranchTier();

  const totalBranches = rawBranches.length || 1;

  const handleNavigate = (id) => {
    if (id === 'dashboard') navigate('/dashboard');
    if (id === 'branches') navigate('/branches');
    if (id === 'branch-tiers' || id === 'tiers') navigate('/branch-tiers');
    if (id === 'shift-master') navigate('/shifts/templates');
    if (id === 'employees') navigate('/employees');
  };

  const columns = [
    {
      key: 'branchCode',
      label: 'MÃ CHI NHÁNH',
      width: '130px',
      render: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '13px',
            color: c.accent,
            backgroundColor: `${c.accent}15`,
            padding: '4px 8px',
            borderRadius: '6px',
            letterSpacing: '0.5px',
          }}
        >
          {row.branchCode || row.code || `CH0${row.storeId || row.id}`}
        </span>
      ),
    },
    {
      key: 'branchTier',
      label: 'CẤP CHI NHÁNH',
      width: '180px',
      render: (row) => {
        const matchedTier =
          row.matchedTier ||
          (tiers || []).find((t) => Number(t.id || t.tier_id) === Number(row.tierId || row.tier?.id)) ||
          row.tierObj ||
          row.tier;

        const displayName =
          matchedTier?.tierName ||
          matchedTier?.name ||
          row.branchTierName ||
          (row.branchTier ? `Cấp ${row.branchTier}` : 'Chưa phân cấp');

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '160px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: c.bgElev,
              border: `1px solid ${c.border}`,
              color: c.fg,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </span>
        );
      },
    },
    {
      key: 'name',
      label: 'TÊN CHI NHÁNH & ĐỊA CHỈ',
      render: (row) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: c.fg,
              marginBottom: '2px',
            }}
          >
            {row.name || row.storeName || row.branchName}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: c.fgSubtle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Icon name="pin" size={12} />
            <span>{row.address || 'Chưa cập nhật địa chỉ'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'quota',
      label: 'QUÂN SỐ & ĐỊNH BIÊN NHÂN SỰ',
      width: '240px',
      render: (row) => {
        const matchedTier =
          row.matchedTier ||
          (tiers || []).find((t) => Number(t.id || t.tier_id) === Number(row.tierId || row.tier?.id)) ||
          row.tierObj ||
          row.tier;

        const style = getTierStyle(matchedTier);
        const quota = Number(row.customQuota || row.staffCount || row.targetStaffCount || matchedTier?.maxStaffCount || 20);
        const currentStaff = Number(row.currentStaffCount || 0);
        const fillPercent = Math.min(100, Math.round((currentStaff / quota) * 100));
        const isOver = currentStaff > quota;

        const minStaff = matchedTier?.minStaffCount ?? matchedTier?.minStaff ?? 0;
        const maxStaff = matchedTier?.maxStaffCount ?? matchedTier?.maxStaff ?? 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: style.color,
                  backgroundColor: c.bgRaised,
                  border: `1px solid ${c.border}`,
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                }}
              >
                {quota} nv
              </span>

              <span style={{ fontSize: '12px', color: c.fgSubtle }}>
                Thực tế: <strong style={{ color: isOver ? '#ef4444' : c.fg }}>{currentStaff}</strong>/{quota}
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: c.bgRaised,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${fillPercent}%`,
                  backgroundColor: isOver ? '#ef4444' : style.color,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ fontSize: '11px', color: c.fgFaint }}>
              {maxStaff > 0 ? `Chuẩn Tier: ${minStaff}-${maxStaff} nv • ` : ''}
              {row.availableSlots > 0
                ? `Còn trống ${row.availableSlots} slot`
                : isOver
                  ? `Vượt ${currentStaff - quota} nv`
                  : 'Đã đủ định biên'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'geofence',
      label: 'GEOFENCE GPS',
      width: '130px',
      render: (row) => {
        const radius = row.geofenceRadiusMeters ?? row.radiusMeters ?? 100;
        return (
          <div style={{ fontSize: '12px', color: c.fgSubtle, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon name="map" size={13} color={c.accent} />
            <span>Bán kính: <strong style={{ color: c.fg }}>{radius}m</strong></span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      width: '110px',
      render: (row) => {
        const isActive = (row.status || '').toUpperCase() === 'ACTIVE';
        return (
          <Badge tone={isActive ? 'good' : 'bad'}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#10b981' : '#ef4444',
                marginRight: '5px',
              }}
            />
            {isActive ? 'Hoạt động' : 'Tạm khóa'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '140px',
      render: (row) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedBranch(row);
                setChangeTierModalOpen(true);
              }}
              title="Chỉnh sửa phân cấp chi nhánh"
            >
              <Icon name="settings" size={13} />
              <span>Đổi Phân Cấp</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="branch-tiers"
          activePath="/branch-tiers"
          onNavigate={handleNavigate}
          consoleLabel="OPERATIONS CONSOLE"
          brandName="RWFM Enterprise"
          roleLabel="Operations Admin"
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={[
            { label: 'Quản Trị Vận Hành', href: '/dashboard' },
            { label: 'Vận Hành & Hệ Thống', href: '/branches' },
            { label: 'Phân Cấp Chi Nhánh' },
          ]}
        />
      }
    >
      {/* Tiêu đề trang & Nút Thêm Mới */}
      <PageHeader
        title="Quản Lý Phân Cấp Chi Nhánh"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={() => {
                setEditingTier(null);
                setTierFormModalOpen(true);
              }}
            >
              <Icon name="plus" size={14} />
              <span>Thêm Cấp (Tier) Mới</span>
            </Button>

            <Button variant="outline" onClick={() => navigate('/branches')}>
              <Icon name="pin" size={14} />
              <span>Quản Lý Chi Nhánh & Kiosk</span>
            </Button>
          </div>
        }
      />

      {/* Thẻ Thống Kê Tổng Quan Lấy Động Từ Database */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <StatCard
          label="TỔNG SỐ CHI NHÁNH"
          value={loading ? '...' : `${rawBranches.length} Chi nhánh`}
          sub="Toàn hệ thống chuỗi"
          icon="store"
        />
        {tiers && tiers.length > 0 ? (
          tiers.map((t, idx) => {
            const count = t.branchCount || t.branch_count || 0;
            const tName = (t.tierName || t.name || `Cấp ${t.id}`).toUpperCase();
            const minS = t.minStaffCount ?? t.minStaff ?? 0;
            const maxS = t.maxStaffCount ?? t.maxStaff ?? 0;
            return (
              <StatCard
                key={t.id || t.tier_id || idx}
                label={tName}
                value={loading ? '...' : `${count} chi nhánh`}
                sub={`Định mức: ${minS} - ${maxS} nhân sự`}
                icon="layers"
              />
            );
          })
        ) : (
          <StatCard
            label="PHÂN CẤP CHI NHÁNH"
            value={`${tiers.length} Cấp`}
            sub="Cấu hình danh mục Tier chuẩn"
            icon="layers"
          />
        )}
      </div>

      {/* Tabs chuyển đổi giữa 2 chế độ: "Danh sách Chi nhánh phân cấp" vs "Cấu hình Danh mục Tier" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
          borderBottom: `1px solid ${c.border}`,
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'branches' ? (c.primary || '#0D9488') : 'transparent',
            color: activeTab === 'branches' ? '#ffffff' : c.fgSubtle,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="store" size={14} />
          <span>Danh Sách Chi Nhánh Theo Cấp ({branches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tiers')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'tiers' ? (c.primary || '#0D9488') : 'transparent',
            color: activeTab === 'tiers' ? '#ffffff' : c.fgSubtle,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="layers" size={14} />
          <span>Cấu Hình & Tiêu Chuẩn Phân Cấp ({tiers.length || tierDefinitions.length} Cấp)</span>
        </button>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: DANH SÁCH CHI NHÁNH THEO PHÂN CẤP                                       */}
      {/* ============================================================================== */}
      {activeTab === 'branches' ? (
        <Panel title="Danh Sách Phân Cấp Chi Nhánh Toàn Hệ Thống">
          {/* Bộ Lọc & Tìm Kiếm */}
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
                placeholder="Tìm theo mã CN, tên chi nhánh, địa chỉ..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Quick Tier Filter Tabs Lấy Động Từ Database */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <Button
                  variant={selectedTierFilter === 'ALL' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTierFilter('ALL')}
                >
                  Tất cả ({rawBranches.length})
                </Button>
                {tiers.map((t, idx) => {
                  const style = getTierStyle(t, idx);
                  const isSelected = selectedTierFilter === t.id || selectedTierFilter === t.tier_id;
                  const tName = t.tierName || t.name || `Cấp ${t.id}`;
                  const count = t.branchCount || t.branch_count || 0;
                  return (
                    <Button
                      key={t.id || t.tier_id || idx}
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedTierFilter(isSelected ? 'ALL' : (t.id || t.tier_id))}
                      style={{
                        color: isSelected ? style.color : undefined,
                        border: isSelected ? `1px solid ${style.border}` : undefined,
                        backgroundColor: isSelected ? style.bg : undefined,
                      }}
                    >
                      {tName} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bảng Dữ Liệu Chi Nhánh */}
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <DataTable columns={columns}
            data={branches}
            loading={loading}
            emptyMessage="Không tìm thấy chi nhánh nào phù hợp với bộ lọc."
            />
          </div>
        </Panel>
      ) : (
        /* ============================================================================== */
        /* TAB 2: QUẢN LÝ TIÊU CHUẨN & DANH MỤC TIER                                      */
        /* ============================================================================== */
        <Panel
          title="Quản Lý Danh Mục Phân Cấp (Tier Definitions)"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTier(null);
                setTierFormModalOpen(true);
              }}
            >
              <Icon name="plus" size={13} />
              <span>Thêm Phân Cấp Mới</span>
            </Button>
          }
        >
          <div style={{ marginBottom: '16px', fontSize: '13px', color: c.fgSubtle }}>
            Thiết lập tiêu chuẩn quân số nhân sự tối thiểu - tối đa, điều kiện cơ sở hạ tầng và quyền lợi vận hành theo từng cấp chi nhánh trong hệ thống.
          </div>

          <TierTable
            tiers={tiers}
            isLoading={tiersLoading}
            onEdit={(tier) => {
              setEditingTier(tier);
              setTierFormModalOpen(true);
            }}
            onDelete={(tier) => {
              setDeletingTier(tier);
              setTierDeleteModalOpen(true);
            }}
          />
        </Panel>
      )}

      {/* ============================================================================== */}
      {/* CÁC MODAL HỆ THỐNG                                                             */}
      {/* ============================================================================== */}

      {/* 1. Modal Đổi Phân Cấp & Định Biên */}
      <ChangeTierModal
        isOpen={changeTierModalOpen}
        open={changeTierModalOpen}
        branch={selectedBranch}
        tiers={tiers}
        tierDefinitions={tierDefinitions}
        loading={updating}
        onClose={() => {
          setChangeTierModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={handleUpdateTierAndQuota}
        onConfirm={handleUpdateTierAndQuota}
      />

      {/* 2. Modal Thêm / Chỉnh Sửa Phân Cấp Tier */}
      <TierFormModal
        isOpen={tierFormModalOpen}
        tier={editingTier}
        isLoading={tierActionLoading}
        onClose={() => {
          setTierFormModalOpen(false);
          setEditingTier(null);
        }}
        onSubmit={async (payload) => {
          if (editingTier) {
            return await handleUpdateTierDefinition(editingTier.id || editingTier.tier_id, payload);
          } else {
            return await handleCreateTier(payload);
          }
        }}
      />

      {/* 5. Modal Xác Nhận Xóa Phân Cấp Tier */}
      <TierDeleteModal
        isOpen={tierDeleteModalOpen}
        tier={deletingTier}
        isLoading={tierActionLoading}
        onClose={() => {
          setTierDeleteModalOpen(false);
          setDeletingTier(null);
        }}
        onConfirm={handleDeleteTier}
      />
    </DashboardShell>
  );
}
