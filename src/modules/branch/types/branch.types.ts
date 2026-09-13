import { ApiResponse } from '@/shared/types/api.types';

export type BranchStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE';
export type KioskStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'OFFLINE';

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
  kioskAllowedIp?: string | null;
  kioskAllowedBrowser?: string | null;
  kioskCount: number;
  activeKiosks: number;
  lockReason?: string | null;
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
