import React from 'react';
import { useAdminTheme } from '@/shared/context/ThemeContext';
import Icon from '@/shared/components/ui/Icon';
import Select from '@/shared/components/ui/Select';
import Button from '@/shared/components/ui/Button';
import { CONTRACT_TYPES } from '../../services/employee.service';

export default function EmployeeFilter({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  branchFilter,
  onBranchFilterChange,
  statusFilter,
  onStatusFilterChange,
  contractTypeFilter,
  onContractTypeFilterChange,
  onResetFilters,
  roles = [],
  branches = [],
  isStoreManager = false,
}) {
  const { c } = useAdminTheme();

  const roleOptions = [
    { value: '', label: 'Tất cả vai trò' },
    ...roles.map((r) => ({
      value: r.roleCode || String(r.id),
      label: `${r.roleName} (${r.roleCode})`,
    })),
  ];

  const branchOptions = [
    { value: '', label: 'Tất cả chi nhánh' },
    ...branches.map((b) => ({
      value: String(b.storeId || b.id),
      label: b.name || `Chi nhánh #${b.storeId || b.id}`,
    })),
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Tạm khóa / Vô hiệu' },
  ];

  const contractOptions = [
    { value: '', label: 'Tất cả hình thức HĐ' },
    ...CONTRACT_TYPES,
  ];

  const hasActiveFilters = Boolean(
    search || roleFilter || branchFilter || statusFilter || contractTypeFilter
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        padding: '14px 16px',
        background: c.bgRaised,
        border: `1px solid ${c.border}`,
        borderRadius: '10px',
      }}
    >
      {/* Ô tìm kiếm từ khóa */}
      <div
        style={{
          flex: '1 1 220px',
          minWidth: '200px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: c.fgSubtle,
            pointerEvents: 'none',
          }}
        >
          <Icon name="search" size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo Tên, Mã NV, Email, SĐT..."
          style={{
            width: '100%',
            padding: '9px 12px 9px 36px',
            background: c.bgCard,
            border: `1.5px solid ${c.border}`,
            borderRadius: '10px',
            color: c.fg,
            fontSize: '13.5px',
            outline: 'none',
            transition: 'border-color .15s ease, box-shadow .15s ease',
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: c.fgSubtle,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {/* Lọc theo Vai Trò */}
      <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
        <Select
          value={roleFilter}
          onChange={onRoleFilterChange}
          options={roleOptions}
          placeholder="Lọc vai trò..."
        />
      </div>

      {/* Lọc theo Chi Nhánh (Chỉ hiển thị cho Admin/Owner, Store Manager bị khóa cứng) */}
      {!isStoreManager && (
        <div style={{ flex: '0 1 200px', minWidth: '160px' }}>
          <Select
            value={branchFilter}
            onChange={onBranchFilterChange}
            options={branchOptions}
            placeholder="Lọc chi nhánh..."
          />
        </div>
      )}

      {/* Lọc theo Hình thức HĐ */}
      <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
        <Select
          value={contractTypeFilter}
          onChange={onContractTypeFilterChange}
          options={contractOptions}
          placeholder="Hình thức HĐ..."
        />
      </div>

      {/* Lọc theo Trạng Thái */}
      <div style={{ flex: '0 1 150px', minWidth: '130px' }}>
        <Select
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusOptions}
          placeholder="Trạng thái..."
        />
      </div>

      {/* Nút Xóa Lọc */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          title="Xóa bộ lọc"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Icon name="refresh" size={14} />
          <span>Đặt lại</span>
        </Button>
      )}
    </div>
  );
}
