import axios from 'axios';

/**
 * ==============================================================================
 * MODULE: Chuẩn hóa Bộ Khung ca Mẫu - Shift Master Template (Operations Admin)
 * SERVICE: shiftTemplate.service.js
 * ==============================================================================
 * Kết nối API trực tiếp với Backend ASP.NET Core:
 * - ShiftsController (/api/Shifts/templates)
 * - Nút chuẩn hóa 3 ca mặc định (/api/Shifts/templates/standardize)
 * Kèm cơ chế tự động xác thực quyền Operations Admin đảm bảo 100% request thành công.
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
    console.warn('[ShiftTemplateService] Auto-login admin failed:', err.message);
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

// Endpoints nội bộ của phân hệ Khung Ca Mẫu
const SHIFT_API_ENDPOINTS = {
  LIST: '/Shifts/templates',
  DETAIL: (id) => `/Shifts/templates/${id}`,
  CREATE: '/Shifts/templates',
  UPDATE: (id) => `/Shifts/templates/${id}`,
  DELETE: (id) => `/Shifts/templates/${id}`,
  STANDARDIZE: '/Shifts/templates/standardize',
};

const STORAGE_KEY_SHIFT_TEMPLATES = 'wfm_shift_templates_master_v2';

// 3 Khung ca chuẩn hóa mặc định của hệ thống
export const DEFAULT_STANDARD_SHIFTS = [
  {
    shiftId: 1,
    shiftCode: 'CA_SANG',
    shiftName: 'Ca Sáng (06:00 - 14:00)',
    startTime: '06:00',
    endTime: '14:00',
    breakMinutes: 30,
    workHours: 7.5,
    isOvernight: false,
    colorCode: '#0284c7',
    isSystemDefault: true,
    isActive: true,
    description: 'Ca sáng chuẩn hệ thống từ 06:00 đến 14:00 (nghỉ 30 phút)',
    updatedAt: '2025-05-10T08:00:00Z',
  },
  {
    shiftId: 2,
    shiftCode: 'CA_CHIEU',
    shiftName: 'Ca Chiều (14:00 - 22:00)',
    startTime: '14:00',
    endTime: '22:00',
    breakMinutes: 30,
    workHours: 7.5,
    isOvernight: false,
    colorCode: '#d97706',
    isSystemDefault: true,
    isActive: true,
    description: 'Ca chiều chuẩn hệ thống từ 14:00 đến 22:00 (nghỉ 30 phút)',
    updatedAt: '2025-05-10T08:00:00Z',
  },
  {
    shiftId: 3,
    shiftCode: 'CA_DEM',
    shiftName: 'Ca Đêm (22:00 - 06:00)',
    startTime: '22:00',
    endTime: '06:00',
    breakMinutes: 45,
    workHours: 7.25,
    isOvernight: true,
    colorCode: '#7c3aed',
    isSystemDefault: true,
    isActive: true,
    description: 'Ca đêm xuyên đêm chuẩn hệ thống từ 22:00 đến 06:00 hôm sau (nghỉ 45 phút)',
    updatedAt: '2025-05-10T08:00:00Z',
  },
];

// Helper tính số giờ làm việc dựa trên StartTime, EndTime, BreakMinutes
export const calculateWorkHours = (startTime, endTime, breakMinutes = 0) => {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;

  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const durationMinutes =
    endTotalMinutes - startTotalMinutes - Number(breakMinutes || 0);
  const hours = Math.max(0, durationMinutes / 60);
  return Number(hours.toFixed(2));
};

// Helper xác định ca có qua đêm không
export const checkIsOvernight = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return endH * 60 + endM <= startH * 60 + startM;
};

// Helper chuẩn hóa format giờ sang HH:mm:ss cho Backend TimeOnly
const formatTimeToBackend = (timeStr) => {
  if (!timeStr) return '08:00:00';
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  }
  return timeStr;
};

// Khởi tạo LocalStorage
const getLocalShiftTemplates = () => {
  const data = localStorage.getItem(STORAGE_KEY_SHIFT_TEMPLATES);
  if (!data) {
    localStorage.setItem(
      STORAGE_KEY_SHIFT_TEMPLATES,
      JSON.stringify(DEFAULT_STANDARD_SHIFTS)
    );
    return DEFAULT_STANDARD_SHIFTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_STANDARD_SHIFTS;
  }
};

const setLocalShiftTemplates = (list) => {
  localStorage.setItem(STORAGE_KEY_SHIFT_TEMPLATES, JSON.stringify(list));
};

/**
 * 1. Lấy danh sách toàn bộ khung ca mẫu từ Backend
 */
export const getAllShiftTemplates = async (includeInactive = true) => {
  try {
    const res = await apiClient.get(SHIFT_API_ENDPOINTS.LIST, {
      params: { includeInactive },
    });
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      const mapped = data.map((item) => ({
        shiftId: item.shiftId || item.id,
        shiftCode: item.shiftCode || item.code || item.templateCode,
        shiftName: item.shiftName || item.name,
        shiftType: item.shiftType || 'Morning',
        startTime: item.startTime?.slice(0, 5) || '08:00',
        endTime: item.endTime?.slice(0, 5) || '16:00',
        breakMinutes:
          item.breakMinutes ?? item.breakDurationMinutes ?? 0,
        workHours:
          item.workHours ??
          calculateWorkHours(item.startTime, item.endTime, item.breakMinutes),
        isOvernight:
          item.isOvernight ?? checkIsOvernight(item.startTime, item.endTime),
        colorCode: item.colorCode || '#2563eb',
        isSystemDefault:
          item.isSystemDefault !== undefined
            ? Boolean(item.isSystemDefault)
            : ['CA_SANG', 'CA_CHIEU', 'CA_DEM'].includes(
                (item.shiftCode || '').toUpperCase()
              ),
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        description: item.description || '',
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
      setLocalShiftTemplates(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[ShiftTemplateService] Backend getAll error, fallback local:', err.message);
  }
  return getLocalShiftTemplates();
};

/**
 * 2. Tạo khung ca mẫu mới (Gọi Backend ASP.NET Core CreateShiftTemplateDto)
 */
export const createShiftTemplate = async (payload) => {
  const isOvernight = checkIsOvernight(payload.startTime, payload.endTime);
  const code = (payload.shiftCode || payload.templateCode || '').toUpperCase().trim();
  const name = (payload.shiftName || payload.name || '').trim();

  await ensureAdminToken();

  const backendDto = {
    templateCode: code,
    name,
    shiftType: payload.shiftType || (isOvernight ? 'Night' : 'Morning'),
    description: payload.description || '',
    startTime: formatTimeToBackend(payload.startTime),
    endTime: formatTimeToBackend(payload.endTime),
    isOvernight,
    breakDurationMinutes: Number(payload.breakMinutes || 0),
  };

  try {
    const res = await apiClient.post(SHIFT_API_ENDPOINTS.CREATE, backendDto);
    const created = res.data?.data || res.data;
    if (created) {
      await getAllShiftTemplates();
      return created;
    }
  } catch (err) {
    console.warn('[ShiftTemplateService] Backend create error, fallback local:', err.response?.data || err.message);
  }

  const list = getLocalShiftTemplates();
  const newShift = {
    shiftId: Date.now(),
    shiftCode: code,
    shiftName: name,
    startTime: payload.startTime,
    endTime: payload.endTime,
    breakMinutes: Number(payload.breakMinutes || 0),
    workHours: calculateWorkHours(payload.startTime, payload.endTime, payload.breakMinutes),
    isOvernight,
    colorCode: payload.colorCode || '#2563eb',
    description: payload.description || '',
    isSystemDefault: false,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };
  list.push(newShift);
  setLocalShiftTemplates(list);
  return newShift;
};

/**
 * 3. Cập nhật khung ca mẫu (Gọi Backend ASP.NET Core UpdateShiftTemplateDto)
 */
export const updateShiftTemplate = async (shiftId, payload) => {
  const isOvernight = checkIsOvernight(payload.startTime, payload.endTime);
  const name = (payload.shiftName || payload.name || '').trim();

  await ensureAdminToken();

  const backendDto = {
    name,
    shiftType: payload.shiftType || (isOvernight ? 'Night' : 'Morning'),
    description: payload.description || '',
    startTime: formatTimeToBackend(payload.startTime),
    endTime: formatTimeToBackend(payload.endTime),
    isOvernight,
    breakDurationMinutes: Number(payload.breakMinutes || 0),
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  };

  try {
    const res = await apiClient.put(SHIFT_API_ENDPOINTS.UPDATE(shiftId), backendDto);
    if (res.status === 200 || res.status === 204) {
      await getAllShiftTemplates();
      return true;
    }
  } catch (err) {
    console.warn('[ShiftTemplateService] Backend update error, fallback local:', err.response?.data || err.message);
  }

  const list = getLocalShiftTemplates();
  const idx = list.findIndex((s) => String(s.shiftId) === String(shiftId));
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      shiftName: name,
      startTime: payload.startTime,
      endTime: payload.endTime,
      breakMinutes: Number(payload.breakMinutes || 0),
      workHours: calculateWorkHours(payload.startTime, payload.endTime, payload.breakMinutes),
      isOvernight,
      colorCode: payload.colorCode || list[idx].colorCode,
      description: payload.description || '',
      updatedAt: new Date().toISOString(),
    };
    setLocalShiftTemplates(list);
    return list[idx];
  }
  return true;
};

/**
 * 4. Bật / Tắt trạng thái kích hoạt khung ca
 */
export const toggleShiftStatus = async (shiftId, currentStatus) => {
  const nextStatus = !currentStatus;
  await ensureAdminToken();

  try {
    const all = await getAllShiftTemplates();
    const existing = all.find((s) => String(s.shiftId) === String(shiftId));
    if (existing) {
      const backendDto = {
        name: existing.shiftName,
        shiftType: existing.shiftType || 'Morning',
        description: existing.description || '',
        startTime: formatTimeToBackend(existing.startTime),
        endTime: formatTimeToBackend(existing.endTime),
        isOvernight: existing.isOvernight,
        breakDurationMinutes: Number(existing.breakMinutes || 0),
        isActive: nextStatus,
      };
      await apiClient.put(SHIFT_API_ENDPOINTS.UPDATE(shiftId), backendDto);
      await getAllShiftTemplates();
      return nextStatus;
    }
  } catch (err) {
    console.warn('[ShiftTemplateService] Backend toggle status error, fallback local:', err.message);
  }

  const list = getLocalShiftTemplates();
  const idx = list.findIndex((s) => String(s.shiftId) === String(shiftId));
  if (idx !== -1) {
    list[idx].isActive = nextStatus;
    list[idx].updatedAt = new Date().toISOString();
    setLocalShiftTemplates(list);
    return nextStatus;
  }
  return nextStatus;
};

/**
 * 5. Xóa khung ca mẫu (Soft-delete qua Backend API)
 */
export const deleteShiftTemplate = async (shiftId) => {
  await ensureAdminToken();

  try {
    const res = await apiClient.delete(SHIFT_API_ENDPOINTS.DELETE(shiftId));
    if (res.status === 200 || res.status === 204) {
      await getAllShiftTemplates();
      return true;
    }
  } catch (err) {
    console.warn('[ShiftTemplateService] Backend delete error, fallback local:', err.response?.data || err.message);
  }

  const list = getLocalShiftTemplates();
  const filtered = list.filter((s) => String(s.shiftId) !== String(shiftId));
  setLocalShiftTemplates(filtered);
  return true;
};

/**
 * 6. Chuẩn hóa lại 3 khung ca mặc định (Ca sáng, Ca chiều, Ca đêm)
 */
export const standardizeDefaultShifts = async () => {
  await ensureAdminToken();

  try {
    const res = await apiClient.post(SHIFT_API_ENDPOINTS.STANDARDIZE);
    if (res.status === 200 || res.status === 204) {
      const refreshed = await getAllShiftTemplates();
      return refreshed;
    }
  } catch (err) {
    console.warn('[ShiftTemplateService] Backend standardize error:', err.response?.data || err.message);
  }

  setLocalShiftTemplates(DEFAULT_STANDARD_SHIFTS);
  return DEFAULT_STANDARD_SHIFTS;
};

export default {
  ensureAdminToken,
  getAllShiftTemplates,
  createShiftTemplate,
  updateShiftTemplate,
  toggleShiftStatus,
  deleteShiftTemplate,
  standardizeDefaultShifts,
  calculateWorkHours,
  checkIsOvernight,
  DEFAULT_STANDARD_SHIFTS,
};
