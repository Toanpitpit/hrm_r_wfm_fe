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
import Select from '@/shared/components/ui/Select';
import Badge from '@/shared/components/ui/Badge';
import Icon from '@/shared/components/ui/Icon';
import DataTable from '@/shared/components/ui/DataTable';

// Hook & Subcomponents
import { useBranchTier } from '../../hooks/useBranchTier';
import ChangeTierModal from '../../components/ChangeTierModal';

/**
 * ==============================================================================
 * MODULE: Quản lý Phân Cấp Chi Nhánh (Branch Tier Management)
 * ACTOR: Operations Admin / Business Owner
 * ROUTE: /branch-tiers
 * ==============================================================================
 */
export default function BranchTierManagementPage() {
  const navigate = useNavigate();
  const { c, fonts } = useAdminTheme();

  const {
    branches,
    rawBranches,
    tierSummary,
    tierDefinitions,
    loading,
    searchTerm,
    setSearchTerm,
    selectedTierFilter,
    setSelectedTierFilter,
    statusFilter,
    setStatusFilter,
    changeTierModalOpen,
    setChangeTierModalOpen,
    selectedBranch,
    setSelectedBranch,
    updating,
    handleUpdateTierAndQuota,
    handleQuickAdjust,
    refreshData,
  } = useBranchTier();

  const totalBranches = tierSummary.totalCount || rawBranches.length || 1;
  const t1Percent = Math.round(((tierSummary.tier1Count || 0) / totalBranches) * 100) || 0;
  const t2Percent = Math.round(((tierSummary.tier2Count || 0) / totalBranches) * 100) || 0;
  const t3Percent = Math.round(((tierSummary.tier3Count || 0) / totalBranches) * 100) || 0;

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
      label: 'MÃ CN',
      width: '105px',
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
      label: 'PHÂN CẤP (TIER)',
      width: '150px',
      render: (row) => {
        const tier = Number(row.branchTier ?? row.tier ?? 2);
        const tDef = tierDefinitions.find((td) => td.tier === tier) || tierDefinitions[1];

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: tDef.badgeBg,
                border: `1px solid ${tDef.badgeBorder}`,
                color: tDef.color,
                letterSpacing: '0.3px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: tDef.color,
                }}
              />
              {tDef.shortName}
            </span>
          </div>
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
        const tier = Number(row.branchTier ?? row.tier ?? 2);
        const tDef = tierDefinitions.find((td) => td.tier === tier) || tierDefinitions[1];
        const quota = Number(row.customQuota || row.targetStaffCount || tDef.standardQuota);
        const currentStaff = Number(row.currentStaffCount || 0);
        const fillPercent = Math.min(100, Math.round((currentStaff / quota) * 100));
        const isOver = currentStaff > quota;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Inline stepper & quota badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: c.bgRaised,
                  border: `1px solid ${c.border}`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(row.storeId || row.id, -1)}
                  style={{
                    padding: '2px 7px',
                    border: 'none',
                    background: 'transparent',
                    color: c.fg,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: '18px',
                  }}
                  title="Bớt 1 định biên nhân sự"
                >
                  −
                </button>
                <span
                  style={{
                    padding: '2px 8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: tDef.color,
                    borderLeft: `1px solid ${c.border}`,
                    borderRight: `1px solid ${c.border}`,
                    fontFamily: 'monospace',
                  }}
                >
                  {quota} nv
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(row.storeId || row.id, 1)}
                  style={{
                    padding: '2px 7px',
                    border: 'none',
                    background: 'transparent',
                    color: c.fg,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: '18px',
                  }}
                  title="Thêm 1 định biên nhân sự"
                >
                  +
                </button>
              </div>

              <span style={{ fontSize: '12px', color: c.fgSubtle }}>
                Thực tế: <strong style={{ color: isOver ? '#ef4444' : c.fg }}>{currentStaff}</strong>/{quota}
              </span>
            </div>

            {/* Mini Progress bar */}
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
                  backgroundColor: isOver ? '#ef4444' : tDef.color,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ fontSize: '11px', color: c.fgFaint }}>
              Chuẩn Tier: {tDef.minStaff}-{tDef.maxStaff} nv • {row.availableSlots > 0 ? `Còn trống ${row.availableSlots} slot` : isOver ? `Vượt ${currentStaff - quota} nv` : 'Đã đủ định biên'}
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
      width: '160px',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedBranch(row);
            setChangeTierModalOpen(true);
          }}
          title="Chỉnh sửa cấp phân loại & chỉ tiêu định biên nhân sự"
        >
          <Icon name="settings" size={13} />
          <span>Đổi Cấp / Định Biên</span>
        </Button>
      ),
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
      {/* Tiêu đề trang & Nút tải lại */}
      <PageHeader
        title="Quản Lý Phân Cấp Chi Nhánh"
        subtitle="Chuẩn hóa mô hình quy mô cửa hàng (Tier 1 Flagship, Tier 2 Tiêu Chuẩn, Tier 3 Mini), định biên nhân sự và cấu hình thiết bị trạm Kiosk."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button variant="secondary" onClick={refreshData} disabled={loading}>
              <Icon name="refresh" size={14} />
              <span>Đồng Bộ Dữ Liệu BE</span>
            </Button>
            <Button variant="primary" onClick={() => navigate('/branches')}>
              <Icon name="pin" size={14} />
              <span>Quản Lý Chi Nhánh & Kiosk</span>
            </Button>
          </div>
        }
      />

      {/* 4 Thẻ Thống Kê Tổng Quan lấy từ Backend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          label="TỔNG SỐ CHI NHÁNH"
          value={loading ? '...' : tierSummary.totalCount || rawBranches.length}
          sub="Toàn hệ thống chuỗi"
          icon="store"
        />
        <StatCard
          label="CẤP 1 - FLAGSHIP"
          value={loading ? '...' : `${tierSummary.tier1Count || 0} CN`}
          sub={`Chiếm ${t1Percent}% • Quota 20-35 nv`}
          icon="award"
          color="#f59e0b"
        />
        <StatCard
          label="CẤP 2 - TIÊU CHUẨN"
          value={loading ? '...' : `${tierSummary.tier2Count || 0} CN`}
          sub={`Chiếm ${t2Percent}% • Quota 10-19 nv`}
          icon="layers"
          color="#3b82f6"
        />
        <StatCard
          label="CẤP 3 - MINI STORE"
          value={loading ? '...' : `${tierSummary.tier3Count || 0} CN`}
          sub={`Chiếm ${t3Percent}% • Quota 4-9 nv`}
          icon="pin"
          color="#10b981"
        />
      </div>

      {/* 3 Thẻ Tiêu Chuẩn & Chính Sách Phân Cấp Chi Nhánh */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: c.fg,
            margin: '0 0 14px 0',
            fontFamily: fonts?.heading || 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="layers" size={18} color={c.accent} />
          <span>Tiêu Chuẩn & Đặc Quyền Vận Hành Theo Từng Phân Cấp</span>
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {tierDefinitions.map((td) => {
            const count =
              td.tier === 1
                ? tierSummary.tier1Count
                : td.tier === 2
                ? tierSummary.tier2Count
                : tierSummary.tier3Count;
            const percent = totalBranches > 0 ? Math.round(((count || 0) / totalBranches) * 100) : 0;
            const isFilterActive = selectedTierFilter === td.tier;

            return (
              <div
                key={td.tier}
                style={{
                  backgroundColor: c.bgCard,
                  border: `1px solid ${isFilterActive ? td.color : c.border}`,
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: isFilterActive ? td.accentGlow : '0 2px 10px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Top Tier Badge & Ratio */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 700,
                        backgroundColor: td.badgeBg,
                        border: `1px solid ${td.badgeBorder}`,
                        color: td.color,
                      }}
                    >
                      {td.tierName}
                    </span>

                    <span style={{ fontSize: '13px', fontWeight: 700, color: td.color }}>
                      {count} CN ({percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: c.bgRaised,
                      overflow: 'hidden',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor: td.color,
                        borderRadius: '3px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Description */}
                  <p style={{ margin: '0 0 14px', fontSize: '13px', color: c.fgSubtle, lineHeight: 1.5 }}>
                    {td.description}
                  </p>

                  {/* Criteria specs */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: c.bgRaised,
                      border: `1px solid ${c.border}`,
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      🎯 <strong>Điều kiện:</strong> {td.conditions}
                    </div>
                    <div>
                      🎁 <strong>Quyền lợi:</strong> {td.benefits}
                    </div>
                  </div>
                </div>

                {/* Filter shortcut button */}
                <Button
                  variant={isFilterActive ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (isFilterActive) {
                      setSelectedTierFilter('ALL');
                    } else {
                      setSelectedTierFilter(td.tier);
                    }
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Icon name={isFilterActive ? 'check' : 'search'} size={13} />
                  <span>{isFilterActive ? 'Đang lọc cấp này (Bấm để hủy)' : `Xem ${count} chi nhánh ${td.shortName}`}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danh Sách Chi Nhánh Theo Phân Cấp */}
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
            {/* Quick Tier Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                variant={selectedTierFilter === 'ALL' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTierFilter('ALL')}
              >
                Tất cả ({tierSummary.totalCount || rawBranches.length})
              </Button>
              <Button
                variant={selectedTierFilter === 1 ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTierFilter(1)}
                style={{ color: selectedTierFilter === 1 ? '#f59e0b' : undefined }}
              >
                Cấp 1 ({tierSummary.tier1Count || 0})
              </Button>
              <Button
                variant={selectedTierFilter === 2 ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTierFilter(2)}
                style={{ color: selectedTierFilter === 2 ? '#3b82f6' : undefined }}
              >
                Cấp 2 ({tierSummary.tier2Count || 0})
              </Button>
              <Button
                variant={selectedTierFilter === 3 ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTierFilter(3)}
                style={{ color: selectedTierFilter === 3 ? '#10b981' : undefined }}
              >
                Cấp 3 ({tierSummary.tier3Count || 0})
              </Button>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: c.fgSubtle }}>Trạng thái:</span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'LOCKED', label: 'Tạm khóa' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={branches}
          loading={loading}
          pageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
          emptyMessage="Không tìm thấy chi nhánh nào phù hợp với bộ lọc phân cấp."
        />
      </Panel>

      {/* Modal Cập Nhật Phân Cấp */}
      <ChangeTierModal
        isOpen={changeTierModalOpen}
        branch={selectedBranch}
        onClose={() => {
          setChangeTierModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={handleUpdateTierAndQuota}
        loading={updating}
      />
    </DashboardShell>
  );
}
