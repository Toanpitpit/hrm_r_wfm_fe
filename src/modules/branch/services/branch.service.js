import axios from 'axios';

/**
 * ==============================================================================
 * MODULE: Quản lý Danh mục Chi nhánh & Cấu hình Kiosk (Operations Admin)
 * SERVICE: branch.service.js
 * ==============================================================================
 * Cung cấp các hàm API kết nối trực tiếp với Backend ASP.NET Core:
 * - BranchesController (/api/v1/branches hoặc /api/Stores)
 * - KiosksController (/api/v1/kiosks hoặc /api/Kiosk)
 * Đi kèm cơ chế tự động chứng thực tài khoản Operations Admin khi thao tác dữ liệu.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Tự động đảm bảo có Bearer Token của Operations Admin khi gọi Backend
 */
export const ensureAdminToken = async () => {
  let token = localStorage.getItem('accessToken');
  if (token) return token;

  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        username: 'ops.admin@rwfm.vn',
        password: 'Password@123',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      }
    );
    const data = res.data?.data || res.data;
    token = data?.token || data?.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return token;
    }
  } catch (err) {
    console.warn('[BranchService] Auto-login admin failed:', err.message);
  }
  return null;
};

apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken');
  if (!token) {
    token = await ensureAdminToken();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('accessToken');
      const newToken = await ensureAdminToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// Endpoints nội bộ của phân hệ Branch & Kiosk
const STORE_ENDPOINTS = {
  LIST: '/Stores',
  DETAIL: (id) => `/Stores/${id}`,
  CREATE: '/Stores',
  UPDATE: (id) => `/Stores/${id}`,
  UPDATE_STATUS: (id) => `/Stores/${id}/status`,
  DELETE: (id) => `/Stores/${id}`,
};

const KIOSK_ADMIN_ENDPOINTS = {
  LIST_ALL: '/Kiosk',
  CREATE: '/Kiosk',
  UPDATE_CONFIG: (id) => `/Kiosk/${id}/config`,
  UPDATE_STATUS: (id) => `/Kiosk/${id}/status`,
  DELETE: (id) => `/v1/kiosks/${id}`,
};

const STORAGE_KEY_BRANCHES = 'wfm_branch_master_data_v3';
const STORAGE_KEY_KIOSKS = 'wfm_kiosk_master_data_v3';

// Dữ liệu mẫu ban đầu dự phòng
const INITIAL_BRANCHES = [
  {
    storeId: 1,
    branchCode: 'CH01',
    name: 'Cửa hàng Tiện lợi Chi nhánh Cầu Giấy',
    address: '123 Cầu Giấy, Q. Cầu Giấy, Hà Nội',
    phone: '024 3833 2211',
    status: 'ACTIVE',
    kioskAllowedIp: '192.168.1.0/24; 14.161.25.10',
    kioskAllowedBrowser: 'Chrome Enterprise Kiosk v120+',
    kioskCount: 1,
    activeKiosks: 1,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-05-12T14:30:00Z',
    lockReason: null,
  },
  {
    storeId: 2,
    branchCode: 'CH02',
    name: 'Cửa hàng Tiện lợi Chi nhánh Lê Văn Việt',
    address: '456 Lê Văn Việt, TP. Thủ Đức, TP. Hồ Chí Minh',
    phone: '028 3930 2288',
    status: 'ACTIVE',
    kioskAllowedIp: '192.168.2.0/24; 113.161.12.8',
    kioskAllowedBrowser: 'Chrome Enterprise Kiosk',
    kioskCount: 0,
    activeKiosks: 0,
    createdAt: '2025-02-15T09:15:00Z',
    updatedAt: '2025-05-18T10:00:00Z',
    lockReason: null,
  },
];

const INITIAL_KIOSKS = [
  {
    kioskId: 1,
    storeId: 1,
    branchCode: 'CH01',
    kioskCode: 'CH01-POS01',
    kioskName: 'Máy Kiosk Cầu Giấy 01',
    deviceIp: '192.168.1.15',
    browserAgent: 'Chrome Kiosk Mode v124 (Windows 11 IoT)',
    status: 'ACTIVE',
    lastPing: '2025-05-20T17:35:00Z',
    firmwareVersion: 'v2.4.1',
  },
];

const getLocalBranches = () => {
  const data = localStorage.getItem(STORAGE_KEY_BRANCHES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    return INITIAL_BRANCHES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_BRANCHES;
  }
};

const setLocalBranches = (list) => {
  localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(list));
};

const getLocalKiosks = () => {
  const data = localStorage.getItem(STORAGE_KEY_KIOSKS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_KIOSKS, JSON.stringify(INITIAL_KIOSKS));
    return INITIAL_KIOSKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_KIOSKS;
  }
};

const setLocalKiosks = (list) => {
  localStorage.setItem(STORAGE_KEY_KIOSKS, JSON.stringify(list));
};

/**
 * 1. Lấy danh sách tất cả chi nhánh từ Backend
 */
export const getAllBranches = async () => {
  try {
    const res = await apiClient.get(STORE_ENDPOINTS.LIST);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      const mapped = data.map((item) => ({
        storeId: item.storeId || item.id,
        branchCode:
          item.storeCode ||
          item.branchCode ||
          item.code ||
          `CH0${item.storeId || item.id}`,
        name:
          item.storeName ||
          item.name ||
          `Chi nhánh ${item.storeCode || item.storeId}`,
        address: item.address || '',
        phone: item.phone || '',
        status: item.status || (item.isActive ? 'ACTIVE' : 'LOCKED'),
        kioskAllowedIp: item.kioskAllowedIp || item.allowedIp || '',
        kioskAllowedBrowser:
          item.kioskAllowedBrowser || item.allowedBrowser || '',
        kioskCount: item.totalKiosks ?? item.kiosks?.length ?? 0,
        activeKiosks:
          item.activeKiosks ??
          item.kiosks?.filter((k) => k.status === 'ACTIVE' || k.isOnline).length ??
          0,
        lockReason: item.lockReason || null,
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
      setLocalBranches(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[BranchService] Backend getAllBranches error, using cache:', err.message);
  }
  return getLocalBranches();
};

/**
 * 2. Lấy chi tiết chi nhánh
 */
export const getBranchDetail = async (storeId) => {
  try {
    const res = await apiClient.get(STORE_ENDPOINTS.DETAIL(storeId));
    const item = res.data?.data || res.data;
    if (item) {
      return {
        storeId: item.storeId || item.id,
        branchCode:
          item.storeCode ||
          item.branchCode ||
          item.code ||
          `CH0${item.storeId}`,
        name: item.storeName || item.name || '',
        address: item.address || '',
        phone: item.phone || '',
        status: item.status || 'ACTIVE',
        kioskAllowedIp: item.kioskAllowedIp || item.allowedIp || '',
        kioskAllowedBrowser:
          item.kioskAllowedBrowser || item.allowedBrowser || '',
        kioskCount: item.totalKiosks ?? item.kiosks?.length ?? 0,
        activeKiosks: item.activeKiosks ?? 0,
        kiosks: item.kiosks || [],
      };
    }
  } catch (err) {
    console.warn('[BranchService] Backend getBranchDetail error, fallback local:', err.message);
  }
  const list = getLocalBranches();
  return list.find((b) => String(b.storeId) === String(storeId)) || null;
};

/**
 * 3. Tạo chi nhánh mới
 */
export const createBranch = async (payload) => {
  const code = (payload.branchCode || payload.storeCode || payload.code || '').toUpperCase().trim();
  const name = (payload.name || payload.storeName || '').trim();
  const address = (payload.address || '').trim();

  await ensureAdminToken();

  try {
    const res = await apiClient.post(STORE_ENDPOINTS.CREATE, {
      code,
      branchCode: code,
      name,
      address,
      phone: payload.phone || null,
      kioskAllowedIp: payload.kioskAllowedIp?.trim() || null,
      kioskAllowedBrowser: payload.kioskAllowedBrowser?.trim() || null,
    });
    const created = res.data?.data || res.data;
    if (created && (created.storeId || created.id)) {
      await getAllBranches();
      return created;
    }
  } catch (err) {
    console.warn('[BranchService] Backend create error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message || 'Không thể tạo chi nhánh trên máy chủ');
  }

  const list = getLocalBranches();
  const newBranch = {
    storeId: Date.now(),
    code,
    branchCode: code,
    name,
    address,
    phone: payload.phone || '',
    status: 'ACTIVE',
    kioskAllowedIp: payload.kioskAllowedIp?.trim() || '192.168.1.0/24',
    kioskAllowedBrowser:
      payload.kioskAllowedBrowser?.trim() || 'Chrome Enterprise Kiosk v120+',
    kioskCount: 0,
    activeKiosks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lockReason: null,
  };
  list.unshift(newBranch);
  setLocalBranches(list);
  return newBranch;
};

/**
 * 4. Cập nhật thông tin chi nhánh & cấu hình Kiosk Network
 */
export const updateBranch = async (storeId, payload) => {
  const name = (payload.name || payload.storeName || '').trim();
  const address = (payload.address || '').trim();

  await ensureAdminToken();

  try {
    const res = await apiClient.put(STORE_ENDPOINTS.UPDATE(storeId), {
      name,
      address,
      phone: payload.phone || null,
      kioskAllowedIp: payload.kioskAllowedIp?.trim() || null,
      kioskAllowedBrowser: payload.kioskAllowedBrowser?.trim() || null,
      status: payload.status || 'ACTIVE',
    });
    if (res.status === 200 || res.status === 204) {
      await getAllBranches();
      return true;
    }
  } catch (err) {
    console.warn('[BranchService] Backend update error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message || 'Không thể cập nhật chi nhánh trên máy chủ');
  }

  const list = getLocalBranches();
  const index = list.findIndex((b) => String(b.storeId) === String(storeId));
  if (index !== -1) {
    list[index] = {
      ...list[index],
      name: name || list[index].name,
      address: address || list[index].address,
      phone: payload.phone !== undefined ? payload.phone : list[index].phone,
      kioskAllowedIp:
        payload.kioskAllowedIp !== undefined
          ? payload.kioskAllowedIp
          : list[index].kioskAllowedIp,
      kioskAllowedBrowser:
        payload.kioskAllowedBrowser !== undefined
          ? payload.kioskAllowedBrowser
          : list[index].kioskAllowedBrowser,
      updatedAt: new Date().toISOString(),
    };
    setLocalBranches(list);
    return list[index];
  }
  return true;
};

/**
 * 5. Khóa / Mở khóa chi nhánh (kèm lý do Audit Log)
 */
export const updateBranchStatus = async (storeId, status, reason = '') => {
  await ensureAdminToken();

  try {
    const res = await apiClient.patch(STORE_ENDPOINTS.UPDATE_STATUS(storeId), {
      status,
      reason: reason || (status === 'LOCKED' ? 'Khóa bởi quản trị viên' : 'Mở khóa hoạt động'),
    });
    if (res.status === 200 || res.status === 204) {
      await getAllBranches();
      return true;
    }
  } catch (err) {
    console.warn('[BranchService] Backend status update error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message || 'Không thể đổi trạng thái chi nhánh');
  }

  const list = getLocalBranches();
  const index = list.findIndex((b) => String(b.storeId) === String(storeId));
  if (index !== -1) {
    list[index].status = status;
    list[index].lockReason =
      status === 'LOCKED' ? reason || 'Khóa bởi quản trị viên' : null;
    list[index].updatedAt = new Date().toISOString();
    setLocalBranches(list);
    return list[index];
  }
  return true;
};

/**
 * 6. Xóa chi nhánh khỏi hệ thống
 */
export const deleteBranch = async (storeId) => {
  await ensureAdminToken();
  try {
    const res = await apiClient.delete(STORE_ENDPOINTS.DELETE(storeId));
    if (res.status === 200 || res.status === 204) {
      await getAllBranches();
      return true;
    }
  } catch (err) {
    console.warn('[BranchService] Backend delete error, fallback local:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message || 'Không thể xóa chi nhánh trên máy chủ');
  }

  const list = getLocalBranches();
  const filtered = list.filter((b) => String(b.storeId) !== String(storeId));
  setLocalBranches(filtered);
  return true;
};

/**
 * 7. Lấy danh sách Kiosk toàn chuỗi (giám sát)
 */
export const getAllKiosks = async () => {
  await ensureAdminToken();
  try {
    const res = await apiClient.get(KIOSK_ADMIN_ENDPOINTS.LIST_ALL);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      setLocalKiosks(data);
      return data;
    }
  } catch (err) {
    console.warn('[BranchService] Backend Kiosk fetch error, fallback local:', err.message);
  }
  return getLocalKiosks();
};

/**
 * 8. Thêm mới máy Kiosk cho chi nhánh
 */
export const createKiosk = async (storeId, kioskData) => {
  await ensureAdminToken();
  try {
    const res = await apiClient.post(KIOSK_ADMIN_ENDPOINTS.CREATE, {
      storeId,
      kioskName: kioskData.kioskName,
      deviceIp: kioskData.deviceIp || null,
      browserAgent: kioskData.browserAgent || null,
    });
    const created = res.data?.data || res.data;
    if (created) {
      await getAllKiosks();
      return created;
    }
  } catch (err) {
    console.warn('[BranchService] Backend create kiosk error, fallback local:', err.message);
  }

  const kiosks = getLocalKiosks();
  const newKiosk = {
    kioskId: Date.now(),
    storeId,
    kioskCode: `KSK-${Date.now().toString().slice(-4)}`,
    kioskName: kioskData.kioskName,
    deviceIp: kioskData.deviceIp || '192.168.1.50',
    browserAgent: kioskData.browserAgent || 'Chrome Enterprise Kiosk',
    status: 'ACTIVE',
    kioskToken: `KSK-TOKEN-${Date.now().toString().slice(-6)}`,
    lastPing: new Date().toISOString(),
  };
  kiosks.push(newKiosk);
  setLocalKiosks(kiosks);
  return newKiosk;
};

/**
 * 9. Cập nhật cấu hình trạm Kiosk cụ thể
 */
export const updateKioskConfig = async (kioskId, config) => {
  await ensureAdminToken();
  try {
    const res = await apiClient.put(
      KIOSK_ADMIN_ENDPOINTS.UPDATE_CONFIG(kioskId),
      config
    );
    if (res.status === 200 || res.status === 204) return true;
  } catch (err) {
    console.warn('[BranchService] Backend update kiosk config error:', err.message);
  }

  const kiosks = getLocalKiosks();
  const idx = kiosks.findIndex((k) => String(k.kioskId) === String(kioskId));
  if (idx !== -1) {
    kiosks[idx] = { ...kiosks[idx], ...config };
    setLocalKiosks(kiosks);
    return kiosks[idx];
  }
  return false;
};

/**
 * 10. Khóa / Mở khóa trạm Kiosk
 */
export const toggleKioskLock = async (kioskId, currentStatus) => {
  const nextStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
  await ensureAdminToken();
  try {
    const res = await apiClient.patch(
      KIOSK_ADMIN_ENDPOINTS.UPDATE_STATUS(kioskId),
      { status: nextStatus }
    );
    if (res.status === 200 || res.status === 204) return nextStatus;
  } catch (err) {
    console.warn('[BranchService] Backend toggle kiosk lock error:', err.message);
  }

  const kiosks = getLocalKiosks();
  const idx = kiosks.findIndex((k) => String(k.kioskId) === String(kioskId));
  if (idx !== -1) {
    kiosks[idx].status = nextStatus;
    setLocalKiosks(kiosks);
    return nextStatus;
  }
  return nextStatus;
};

export default {
  ensureAdminToken,
  getAllBranches,
  getBranchDetail,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
  getAllKiosks,
  createKiosk,
  updateKioskConfig,
  toggleKioskLock,
};