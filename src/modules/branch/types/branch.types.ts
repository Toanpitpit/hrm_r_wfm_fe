import { ApiResponse } from '@/shared/types/api.types';

export type BranchStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE';
export type BranchTier = 1 | 2 | 3;
export type KioskStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'OFFLINE';

export type StaffHandlingMode = 'HOLD' | 'TRANSFER';
export type FutureShiftHandling = 'CANCEL' | 'TRANSFER' | 'SUSPEND';

/**
 * Item chi tiết trong blocker khóa chi nhánh
 */
export interface LockBlockerItem {
  id: string | number;
  name: string;
}

/**
 * Điều kiện chặn khóa chi nhánh (Blocker)
 */
export interface LockBlocker {
  code: string;
  message: string;
  count: number;
  items?: LockBlockerItem[];
}

/**
 * Phản hồi kiểm tra điều kiện khóa chi nhánh: GET /api/branches/{id}/lock-check
 */
export interface BranchLockCheckResponse {
  canLock: boolean;
  blockers: LockBlocker[];
  affectedEmployeeCount: number;
}

/**
 * Body yêu cầu khóa chi nhánh: POST /api/branches/{id}/lock
 */
export interface BranchLockDto {
  reason: string;
  confirmBranchCode: string;
  staffHandlingMode: StaffHandlingMode;
  transferToBranchId?: number | null;
  futureShiftHandling: FutureShiftHandling;
}

/**
 * Body yêu cầu mở khóa chi nhánh: POST /api/branches/{id}/unlock
 */
export interface BranchUnlockDto {
  reason?: string;
}

/**
 * Branch Entity Model
 */
export interface Branch {
  storeId: number;
  branchCode: string;
  name: string;
  address: string;
  phone?: string | null;
  status: BranchStatus;
  branchTier?: BranchTier;
  kioskAllowedIp?: string | null;
  kioskAllowedBrowser?: string | null;
  kioskCount: number;
  activeKiosks: number;
  lockReason?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO for creating a new Branch
 */
export interface CreateStoreDto {
  branchCode: string;
  name: string;
  address: string;
  phone?: string | null;
  branchTier?: BranchTier;
  kioskAllowedIp?: string | null;
  kioskAllowedBrowser?: string | null;
}

/**
 * DTO for updating an existing Branch
 */
export interface UpdateStoreDto {
  name: string;
  address: string;
  phone?: string | null;
  branchTier?: BranchTier;
  kioskAllowedIp?: string | null;
  kioskAllowedBrowser?: string | null;
  status?: BranchStatus;
}

/**
 * DTO for toggling Branch Status
 */
export interface UpdateStoreStatusDto {
  status: BranchStatus;
  reason?: string;
}

/**
 * Kiosk Machine Entity Model
 */
export interface Kiosk {
  kioskId: number;
  storeId: number;
  branchCode?: string;
  kioskCode: string;
  kioskName: string;
  deviceIp?: string | null;
  browserAgent?: string | null;
  status: KioskStatus;
  kioskToken?: string | null;
  activationCode?: string | null;
  lastPing?: string | null;
  firmwareVersion?: string | null;
  createdAt?: string;
}

/**
 * DTO for creating a new Kiosk
 */
export interface CreateKioskDto {
  storeId: number;
  kioskName: string;
  deviceIp?: string | null;
  browserAgent?: string | null;
}

/**
 * DTO for updating Kiosk Configuration
 */
export interface UpdateKioskConfigDto {
  kioskName?: string;
  deviceIp?: string | null;
  browserAgent?: string | null;
}

/**
 * Statistical Summary for Branch Dashboard
 */
export interface BranchStats {
  totalBranches: number;
  activeBranches: number;
  lockedBranches: number;
  totalKiosks: number;
  onlineKiosks: number;
}

export type BranchApiResponse<T> = ApiResponse<T>;
