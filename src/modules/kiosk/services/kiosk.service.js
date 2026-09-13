import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';

/**
 * Service quản lý các yêu cầu Kiosk dành cho Store Manager.
 */

/**
 * Tạo mã kích hoạt Kiosk OTP ngẫu nhiên (15 phút) cho cửa hàng.
 * @param {Object} payload - { storeId: number, kioskName: string }
 * @returns {Promise<Object>} Dữ liệu trả về từ backend (chứa activationCode, expiresAt...)
 */
export const createKioskCode = async ({ storeId, kioskName }) => {
  const response = await axiosInstance.post(API_ENDPOINTS.KIOSK.CREATE_CODE, {
    storeId: Number(storeId),
    kioskName: kioskName ? kioskName.trim() : 'Trạm Kiosk Mới',
  });
  return response.data;
};

/**
 * Lấy danh sách các trạm Kiosk đã được kích hoạt thuộc một chi nhánh cửa hàng.
 * @param {number|string} storeId - Mã ID cửa hàng
 * @returns {Promise<Object>} Danh sách các trạm Kiosk từ backend
 */
export const getStoreKiosks = async (storeId) => {
  const response = await axiosInstance.get(API_ENDPOINTS.KIOSK.GET_BY_STORE(storeId));
  return response.data;
};

/**
 * Hủy ghép nối / Dừng hoạt động một trạm Kiosk.
 * @param {number|string} kioskId - Mã ID trạm Kiosk
 * @returns {Promise<Object>} ApiResponse từ backend
 */
export const deactivateKiosk = async (kioskId) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.KIOSK.DEACTIVATE(kioskId));
  return response.data;
};

export default {
  createKioskCode,
  getStoreKiosks,
  deactivateKiosk,
};
