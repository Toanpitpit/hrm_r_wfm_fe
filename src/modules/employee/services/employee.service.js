import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';

/**
 * Service xử lý các nghiệp vụ:
 * - UC 1.4: Quản lý tài khoản & phân quyền Cửa hàng trưởng (Store Manager)
 * - UC 1.5: Quản lý Hồ sơ & Hợp đồng Nhân sự Toàn chuỗi
 * - UC 1.6: Cấp/Sinh lại mã PIN Kiosk điểm danh
 */

// ==================== UC 1.4: STORE MANAGERS ====================

export const getStoreManagers = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USERS.STORE_MANAGERS);
  return response.data;
};

export const createStoreManager = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USERS.STORE_MANAGERS, {
    employeeCode: payload.employeeCode?.trim(),
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim(),
    phone: payload.phone?.trim(),
    homeBranchId: Number(payload.homeBranchId),
    password: payload.password?.trim() || null,
  });
  return response.data;
};

export const toggleUserStatus = async (id, status) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.USERS.TOGGLE_STATUS(id), {
    status,
  });
  return response.data;
};

export const resetUserPassword = async (id, newPassword) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id), {
    newPassword: newPassword?.trim() || null,
  });
  return response.data;
};

// ==================== UC 1.5: EMPLOYEES ====================

export const getEmployees = async (filters = {}) => {
  const params = {};
  if (filters.branchId) params.branchId = filters.branchId;
  if (filters.roleId) params.roleId = filters.roleId;
  if (filters.employmentType) params.employmentType = filters.employmentType;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search.trim();

  const response = await axiosInstance.get(API_ENDPOINTS.USERS.EMPLOYEES, { params });
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await axiosInstance.get(API_ENDPOINTS.USERS.EMPLOYEE_BY_ID(id));
  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USERS.EMPLOYEES, {
    employeeCode: payload.employeeCode?.trim(),
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim(),
    phone: payload.phone?.trim(),
    roleId: Number(payload.roleId),
    employmentType: payload.employmentType || 'FULL_TIME',
    homeBranchId: payload.homeBranchId ? Number(payload.homeBranchId) : null,
    password: payload.password?.trim() || null,
    pinCode: payload.pinCode?.trim() || null,
  });
  return response.data;
};

export const updateEmployee = async (id, payload) => {
  const response = await axiosInstance.put(API_ENDPOINTS.USERS.EMPLOYEE_BY_ID(id), {
    fullName: payload.fullName?.trim(),
    phone: payload.phone?.trim(),
    roleId: Number(payload.roleId),
    employmentType: payload.employmentType || 'FULL_TIME',
    homeBranchId: payload.homeBranchId ? Number(payload.homeBranchId) : null,
    status: payload.status,
  });
  return response.data;
};

// ==================== UC 1.6: KIOSK PIN ====================

export const resetKioskPin = async (id, newPin = null) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USERS.RESET_PIN(id), {
    newPin: newPin ? newPin.trim() : null,
  });
  return response.data;
};

// ==================== METADATA: ROLES & STORES ====================

export const getRoles = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USERS.ROLES);
  return response.data;
};

export const getStores = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.STORES.GET_ALL);
  return response.data;
};

export default {
  getStoreManagers,
  createStoreManager,
  toggleUserStatus,
  resetUserPassword,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  resetKioskPin,
  getRoles,
  getStores,
};
