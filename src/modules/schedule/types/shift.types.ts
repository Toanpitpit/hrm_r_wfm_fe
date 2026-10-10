import { ApiResponse } from '@/shared/types/api.types';

export type ShiftType = 'Morning' | 'Afternoon' | 'Night' | 'Other' | 'PartTime' | 'FullTime';
export type ShiftScope = 'GLOBAL' | 'BRANCH';
export type BranchShiftMode = 'GLOBAL' | 'CUSTOM';

/**
 * ShiftTemplateDto theo hợp đồng API Backend
 */
export interface ShiftTemplateDto {
  id: number | string;
  templateCode: string;
  name: string;
  description?: string;
  shiftType: ShiftType;
  scope: ShiftScope;
  branchId?: number | string | null;
  branchName?: string | null;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDuration: number; // Phút nghỉ
  isOvernight: boolean;
  isActive: boolean;
  paidHours: number; // Số giờ công chuẩn
  nightHours: number; // Số giờ làm đêm giao với 22:00 - 06:00
  usedByBranchCount?: number; // Số chi nhánh đang áp dụng ca chung này
}

/**
 * BranchDto theo hợp đồng API GET /api/branches
 */
export interface BranchDto {
  id: number | string;
  name: string;
  code?: string;
  shiftMode: BranchShiftMode;
  activeCustomShiftCount: number;
  isLocked?: boolean;
}

/**
 * Phản hồi GET /api/branches/{id}/effective-shifts
 */
export interface EffectiveShiftsResponse {
  branchId: number | string;
  branchName: string;
  shiftMode: BranchShiftMode;
  source: 'GLOBAL' | 'CUSTOM';
  shifts: ShiftTemplateDto[];
}

/**
 * Thống kê khung ca GET /api/shift-templates/stats
 */
export interface ShiftStatsDto {
  totalGlobalShifts: number;
  branchesUsingGlobal: number;
  branchesUsingCustom: number;
  overnightShifts: number;
}

/**
 * Error Response từ Backend
 */
export interface ShiftApiError {
  code:
    | 'NO_ACTIVE_CUSTOM_SHIFT'
    | 'FUTURE_SCHEDULES_EXIST'
    | 'IMPACT_CONFIRM_REQUIRED'
    | 'BRANCH_LOCKED'
    | string;
  message: string;
  details?: {
    futureAssignmentCount?: number;
    affectedBranchCount?: number;
    [key: string]: any;
  };
}

export type ShiftApiResponse<T> = ApiResponse<T>;
