import { ApiResponse } from '@/shared/types/api.types';

export type ShiftType = 'Morning' | 'Afternoon' | 'Night' | 'PartTime' | 'FullTime';

/**
 * Shift Template Entity Model
 */
export interface ShiftTemplate {
  shiftId: number;
  shiftCode: string;
  shiftName: string;
  shiftType: ShiftType;
  startTime: string; // HH:mm or HH:mm:ss
  endTime: string; // HH:mm or HH:mm:ss
  breakMinutes: number;
  workHours: number;
  isOvernight: boolean;
  colorCode?: string;
  isSystemDefault: boolean;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO for creating a new Shift Template
 */
export interface CreateShiftTemplateDto {
  templateCode: string;
  name: string;
  shiftType?: ShiftType;
  description?: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  isOvernight: boolean;
  breakDurationMinutes: number;
}

/**
 * DTO for updating an existing Shift Template
 */
export interface UpdateShiftTemplateDto {
  name: string;
  shiftType?: ShiftType;
  description?: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  isOvernight: boolean;
  breakDurationMinutes: number;
  isActive: boolean;
}

/**
 * Statistical Summary for Shift Template Master
 */
export interface ShiftStats {
  total: number;
  active: number;
  overnight: number;
  systemDefault: number;
}

export type ShiftApiResponse<T> = ApiResponse<T>;
