import axiosInstance from '@/config/axios.config';
import axios from 'axios';

/**
 * ==============================================================================
 * MODULE: Khung Ca Mẫu (Shift Master Template)
 * SERVICE: shiftTemplate.service.js
 * ==============================================================================
 * Hợp đồng API:
 * - GET /api/shift-templates?scope=&branchId=&type=&isActive=&q=&page=&pageSize=
 * - POST /api/shift-templates
 * - PUT /api/shift-templates/{id}?confirm=false|true
 * - PATCH /api/shift-templates/{id}/active?confirm=false|true
 * - GET /api/branches?shiftMode=&q=
 * - GET /api/branches/{id}/effective-shifts
 * - GET /api/branches/{id}/custom-shifts
 * - PATCH /api/branches/{id}/shift-mode { mode: "GLOBAL"|"CUSTOM", confirm }
 * - GET /api/shift-templates/stats
 * Kèm Mock Adapter chuẩn hóa fallback khi Backend chưa sẵn sàng.
 */

const apiClient = axiosInstance;

// ==============================================================================
// 1. CÁC HÀM TIỆN ÍCH TÍNH TOÁN (Live Preview)
// ==============================================================================

/**
 * Kiểm tra ca có qua đêm không (kết thúc < bắt đầu hoặc kết thúc = bắt đầu)
 */
export const checkIsOvernight = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  return endMin <= startMin;
};

/**
 * Tính số giờ công thực tế (paidHours = thời lượng - nghỉ)
 */
export const calculatePaidHours = (startTime, endTime, breakDuration = 0) => {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMin = startH * 60 + startM;
  let endMin = endH * 60 + endM;

  if (endMin <= startMin) {
    endMin += 24 * 60; // Cộng thêm 24 tiếng cho ca qua đêm
  }

  const durationMin = endMin - startMin - Number(breakDuration || 0);
  const hours = Math.max(0, durationMin / 60);
  return Number(hours.toFixed(2));
};

/**
 * Tính số giờ làm đêm giao với khung 22:00 - 06:00 hôm sau
 */
export const calculateNightHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  // Khoảng đêm gồm: [0, 360] (00:00 -> 06:00) và [1320, 1440] (22:00 -> 24:00)
  const intervals = [];
  if (endMin <= startMin) {
    intervals.push([startMin, 1440]);
    intervals.push([0, endMin]);
  } else {
    intervals.push([startMin, endMin]);
  }

  let totalNightMinutes = 0;
  for (const [s, e] of intervals) {
    const morningOverlap = Math.max(0, Math.min(e, 360) - Math.max(s, 0));
    const nightOverlap = Math.max(0, Math.min(e, 1440) - Math.max(s, 1320));
    totalNightMinutes += morningOverlap + nightOverlap;
  }

  const hours = totalNightMinutes / 60;
  return Number(hours.toFixed(2));
};

// ==============================================================================
// 2. MOCK DATA STORE VÀ CƠ CHẾ ADAPTER
// ==============================================================================

const STORAGE_KEY_SHIFTS = 'wfm_shifts_v3';
const STORAGE_KEY_BRANCHES = 'wfm_branches_v3';

const INITIAL_GLOBAL_SHIFTS = [
  {
    id: 1,
    templateCode: 'CA_SANG',
    name: 'Ca Sáng Tiêu Chuẩn',
    description: 'Ca sáng phục vụ khách mua hàng giờ cao điểm buổi sáng',
    shiftType: 'Morning',
    scope: 'GLOBAL',
    branchId: null,
    branchName: null,
    startTime: '06:00',
    endTime: '14:00',
    breakDuration: 30,
    isOvernight: false,
    isActive: true,
    paidHours: 7.5,
    nightHours: 0,
    usedByBranchCount: 14,
  },
  {
    id: 2,
    templateCode: 'CA_CHIEU',
    name: 'Ca Chiều Tiêu Chuẩn',
    description: 'Ca chiều hỗ trợ nhận hàng và phục vụ giờ tan tầm',
    shiftType: 'Afternoon',
    scope: 'GLOBAL',
    branchId: null,
    branchName: null,
    startTime: '14:00',
    endTime: '22:00',
    breakDuration: 30,
    isOvernight: false,
    isActive: true,
    paidHours: 7.5,
    nightHours: 0,
    usedByBranchCount: 14,
  },
  {
    id: 3,
    templateCode: 'CA_DEM',
    name: 'Ca Đêm Qua Ngày',
    description: 'Ca đêm trực cửa hàng 24/7, kiểm kê và nhập hàng tươi sống',
    shiftType: 'Night',
    scope: 'GLOBAL',
    branchId: null,
    branchName: null,
    startTime: '22:00',
    endTime: '06:00',
    breakDuration: 45,
    isOvernight: true,
    isActive: true,
    paidHours: 7.25,
    nightHours: 8.0,
    usedByBranchCount: 14,
  },
];

const INITIAL_BRANCHES = [
  {
    id: 1,
    storeId: 1,
    name: 'Cửa hàng Q1 - Đồng Khởi',
    code: 'HCM_DK_01',
    shiftMode: 'GLOBAL',
    activeCustomShiftCount: 0,
    isLocked: false,
  },
  {
    id: 2,
    storeId: 2,
    name: 'Cửa hàng Q3 - Nguyễn Thị Minh Khai',
    code: 'HCM_NTMK_02',
    shiftMode: 'GLOBAL',
    activeCustomShiftCount: 0,
    isLocked: false,
  },
  {
    id: 3,
    storeId: 3,
    name: 'Cửa hàng Q7 - Phú Mỹ Hưng',
    code: 'HCM_PMH_03',
    shiftMode: 'CUSTOM',
    activeCustomShiftCount: 3,
    isLocked: false,
  },
  {
    id: 4,
    storeId: 4,
    name: 'Cửa hàng Bình Thạnh - Landmark',
    code: 'HCM_LM_04',
    shiftMode: 'GLOBAL',
    activeCustomShiftCount: 2,
    isLocked: false,
  },
  {
    id: 5,
    storeId: 5,
    name: 'Cửa hàng Tân Bình - Sân Bay (Khóa)',
    code: 'HCM_SB_05',
    shiftMode: 'CUSTOM',
    activeCustomShiftCount: 2,
    isLocked: true,
  },
];

const INITIAL_CUSTOM_SHIFTS = [
  {
    id: 101,
    templateCode: 'PMH_SANG',
    name: 'Ca Sáng Phú Mỹ Hưng',
    description: 'Khung ca sáng mở rộng cho khu vực cư dân cao cấp',
    shiftType: 'Morning',
    scope: 'BRANCH',
    branchId: 3,
    branchName: 'Cửa hàng Q7 - Phú Mỹ Hưng',
    startTime: '07:00',
    endTime: '15:00',
    breakDuration: 30,
    isOvernight: false,
    isActive: true,
    paidHours: 7.5,
    nightHours: 0,
  },
  {
    id: 102,
    templateCode: 'PMH_CHIEU',
    name: 'Ca Chiều Phú Mỹ Hưng',
    description: 'Ca chiều tăng cường giờ ăn tối và mua sắm',
    shiftType: 'Afternoon',
    scope: 'BRANCH',
    branchId: 3,
    branchName: 'Cửa hàng Q7 - Phú Mỹ Hưng',
    startTime: '15:00',
    endTime: '23:00',
    breakDuration: 30,
    isOvernight: false,
    isActive: true,
    paidHours: 7.5,
    nightHours: 1.0,
  },
  {
    id: 103,
    templateCode: 'PMH_DEM',
    name: 'Ca Đêm Phú Mỹ Hưng',
    description: 'Ca trực đêm phục vụ chuyên biệt',
    shiftType: 'Night',
    scope: 'BRANCH',
    branchId: 3,
    branchName: 'Cửa hàng Q7 - Phú Mỹ Hưng',
    startTime: '23:00',
    endTime: '07:00',
    breakDuration: 45,
    isOvernight: true,
    isActive: true,
    paidHours: 7.25,
    nightHours: 7.0,
  },
  {
    id: 104,
    templateCode: 'LM_SANG_SOM',
    name: 'Ca Sáng Sớm Landmark',
    description: 'Phục vụ cư dân tập thể dục buổi sáng',
    shiftType: 'Morning',
    scope: 'BRANCH',
    branchId: 4,
    branchName: 'Cửa hàng Bình Thạnh - Landmark',
    startTime: '05:30',
    endTime: '13:30',
    breakDuration: 30,
    isOvernight: false,
    isActive: true,
    paidHours: 7.5,
    nightHours: 0.5,
  },
  {
    id: 105,
    templateCode: 'LM_TOI_MUON',
    name: 'Ca Tối Muộn Landmark',
    description: 'Phục vụ cư dân và sự kiện tòa nhà',
    shiftType: 'Afternoon',
    scope: 'BRANCH',
    branchId: 4,
    branchName: 'Cửa hàng Bình Thạnh - Landmark',
    startTime: '16:00',
    endTime: '00:00',
    breakDuration: 30,
    isOvernight: true,
    isActive: true,
    paidHours: 7.5,
    nightHours: 2.0,
  },
];

const getMockShifts = () => {
  const data = localStorage.getItem(STORAGE_KEY_SHIFTS);
  if (!data) {
    const initial = [...INITIAL_GLOBAL_SHIFTS, ...INITIAL_CUSTOM_SHIFTS];
    localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [...INITIAL_GLOBAL_SHIFTS, ...INITIAL_CUSTOM_SHIFTS];
  }
};

const setMockShifts = (shifts) => {
  localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
};

const getMockBranches = () => {
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

const setMockBranches = (branches) => {
  localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
};

// ==============================================================================
// 3. API SERVICE METHODS THEO HỢP ĐỒNG
// ==============================================================================

/**
 * GET /api/shift-templates/stats
 * Lấy 4 chỉ số thống kê từ API (không tự đếm ở client)
 */
export const getShiftTemplateStats = async () => {
  try {
    const res = await apiClient.get('/shift-templates/stats');
    if (res.data) return res.data.data || res.data;
  } catch (err) {
    console.warn('[ShiftService] /api/shift-templates/stats fallback mock:', err.message);
  }

  // Fallback Mock data
  const shifts = getMockShifts();
  const branches = getMockBranches();
  const globalShifts = shifts.filter((s) => s.scope === 'GLOBAL');
  const overnightGlobal = globalShifts.filter((s) => s.isOvernight).length;
  const branchesUsingGlobal = branches.filter((b) => b.shiftMode === 'GLOBAL').length;
  const branchesUsingCustom = branches.filter((b) => b.shiftMode === 'CUSTOM').length;

  return {
    totalGlobalShifts: globalShifts.length,
    branchesUsingGlobal,
    branchesUsingCustom,
    overnightShifts: overnightGlobal,
  };
};

/**
 * GET /api/shift-templates?scope=&branchId=&type=&isActive=&q=&page=&pageSize=
 * Lấy danh sách khung ca theo bộ lọc
 */
export const getShiftTemplates = async (params = {}) => {
  try {
    let res;
    try {
      res = await apiClient.get('/shift-templates', { params });
    } catch (e) {
      if (e.response?.status === 404) {
        res = await apiClient.get('/shifts/templates', { params });
      } else {
        throw e;
      }
    }
    if (res && res.data) {
      const data = res.data.data || res.data;
      const list = Array.isArray(data) ? data : data.items || [];
      if (list.length > 0) return list;
    }
  } catch (err) {
    console.warn('[ShiftService] getShiftTemplates fallback mock:', err.message);
  }

  let shifts = getMockShifts();
  if (params.scope) {
    shifts = shifts.filter((s) => s.scope === params.scope);
  }
  if (params.branchId) {
    shifts = shifts.filter((s) => String(s.branchId) === String(params.branchId));
  }
  if (params.type && params.type !== 'ALL') {
    shifts = shifts.filter((s) => s.shiftType === params.type);
  }
  if (params.isActive !== undefined && params.isActive !== '') {
    const boolActive = params.isActive === true || params.isActive === 'true';
    shifts = shifts.filter((s) => s.isActive === boolActive);
  }
  if (params.q) {
    const q = params.q.toLowerCase().trim();
    shifts = shifts.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.templateCode?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }

  return shifts;
};

/**
 * POST /api/shift-templates
 * Tạo mới khung ca (Chung hoặc Riêng chi nhánh)
 */
export const createShiftTemplate = async (payload) => {
  const isOvernight = checkIsOvernight(payload.startTime, payload.endTime);
  const paidHours = calculatePaidHours(payload.startTime, payload.endTime, payload.breakDuration);
  const nightHours = calculateNightHours(payload.startTime, payload.endTime);
  const branchIdNum =
    payload.scope === 'BRANCH' && payload.branchId ? Number(payload.branchId) : null;

  const autoCode =
    payload.templateCode?.trim() ||
    (payload.scope === 'BRANCH'
      ? `CR_${branchIdNum || '01'}_${payload.startTime?.replace(':', '') || Date.now().toString().slice(-4)}`
      : `CA_${payload.startTime?.replace(':', '') || Date.now().toString().slice(-4)}`);

  const body = {
    scope: payload.scope || 'GLOBAL',
    branchId: branchIdNum,
    name: payload.name?.trim(),
    templateCode: autoCode.toUpperCase().trim(),
    description: payload.description || '',
    shiftType: payload.shiftType || (isOvernight ? 'Night' : 'Morning'),
    startTime: payload.startTime,
    endTime: payload.endTime,
    breakDuration: Number(payload.breakDuration || 0),
    breakDurationMinutes: Number(payload.breakDuration || 0),
    isOvernight,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  };

  let backendResult = null;
  try {
    let res;
    try {
      res = await apiClient.post('/shift-templates', body);
    } catch (e1) {
      if (e1.response?.status === 404) {
        res = await apiClient.post('/shifts/templates', body);
      } else {
        throw e1;
      }
    }
    if (res && res.data) {
      backendResult = res.data.data || res.data;
    }
  } catch (err) {
    // Nếu là lỗi nghiệp vụ xác thực từ server (ví dụ 400 trùng giờ, 409 xung đột)
    if (err.response?.status === 400 || err.response?.status === 409) {
      throw err;
    }
    console.warn('[ShiftService] POST shift-templates fallback to local storage:', err.message);
  }

  // Luôn lưu vào Mock Storage để đảm bảo ca riêng xuất hiện ngay lập tức
  const shifts = getMockShifts();
  const branches = getMockBranches();
  const branch = body.branchId
    ? branches.find((b) => String(b.id || b.storeId) === String(body.branchId))
    : null;

  const newShift = {
    id: backendResult?.id || backendResult?.shiftId || Date.now(),
    templateCode: body.templateCode,
    name: body.name,
    description: body.description,
    shiftType: body.shiftType,
    scope: body.scope,
    branchId: body.branchId,
    branchName: branch ? branch.name : null,
    startTime: body.startTime,
    endTime: body.endTime,
    breakDuration: body.breakDuration,
    isOvernight,
    isActive: body.isActive,
    paidHours,
    nightHours,
    usedByBranchCount: body.scope === 'GLOBAL' ? 14 : undefined,
  };

  shifts.push(newShift);
  setMockShifts(shifts);

  // Cập nhật số ca riêng của chi nhánh nếu là ca riêng
  if (body.scope === 'BRANCH' && body.branchId) {
    const branchIdx = branches.findIndex(
      (b) => String(b.id || b.storeId) === String(body.branchId)
    );
    if (branchIdx !== -1) {
      branches[branchIdx].activeCustomShiftCount = shifts.filter(
        (s) => String(s.branchId) === String(body.branchId) && s.isActive
      ).length;
      setMockBranches(branches);
    }
  }

  return newShift;
};

/**
 * PUT /api/shift-templates/{id}?confirm=false|true
 * Cập nhật khung ca
 */
export const updateShiftTemplate = async (id, payload, confirm = false) => {
  const isOvernight = checkIsOvernight(payload.startTime, payload.endTime);
  const paidHours = calculatePaidHours(payload.startTime, payload.endTime, payload.breakDuration);
  const nightHours = calculateNightHours(payload.startTime, payload.endTime);

  try {
    let res;
    try {
      res = await apiClient.put(`/shift-templates/${id}`, payload, {
        params: { confirm },
      });
    } catch (e) {
      if (e.response?.status === 404) {
        res = await apiClient.put(`/shifts/templates/${id}`, payload, {
          params: { confirm },
        });
      } else {
        throw e;
      }
    }
    if (res && res.data) return res.data.data || res.data;
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 409) {
      throw err;
    }
    console.warn('[ShiftService] PUT fallback mock:', err.message);
  }

  const shifts = getMockShifts();
  const idx = shifts.findIndex((s) => String(s.id) === String(id));
  if (idx === -1) {
    const err = new Error('Không tìm thấy khung ca');
    err.response = { status: 404, data: { message: 'Không tìm thấy khung ca' } };
    throw err;
  }

  const existing = shifts[idx];
  // Nếu là ca chung và có chi nhánh đang áp dụng mà chưa confirm
  if (existing.scope === 'GLOBAL' && (existing.usedByBranchCount || 0) > 0 && !confirm) {
    const err = new Error('Thay đổi này ảnh hưởng các chi nhánh đang dùng ca chung');
    err.response = {
      status: 409,
      data: {
        code: 'IMPACT_CONFIRM_REQUIRED',
        message: `Thay đổi này ảnh hưởng ${existing.usedByBranchCount} chi nhánh đang dùng ca chung`,
        details: { affectedBranchCount: existing.usedByBranchCount },
      },
    };
    throw err;
  }

  shifts[idx] = {
    ...existing,
    name: payload.name ?? existing.name,
    description: payload.description ?? existing.description,
    shiftType: payload.shiftType ?? existing.shiftType,
    startTime: payload.startTime ?? existing.startTime,
    endTime: payload.endTime ?? existing.endTime,
    breakDuration: Number(payload.breakDuration ?? existing.breakDuration),
    isOvernight,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : existing.isActive,
    paidHours,
    nightHours,
  };
  setMockShifts(shifts);
  return shifts[idx];
};

/**
 * PATCH /api/shift-templates/{id}/active?confirm=false|true
 * Bật / tắt áp dụng khung ca
 */
export const toggleShiftActive = async (id, isActive, confirm = false) => {
  try {
    const res = await apiClient.patch(
      `/shift-templates/${id}/active`,
      { isActive },
      { params: { confirm } }
    );
    if (res.data) return res.data.data || res.data;
  } catch (err) {
    if (err.response?.status === 409) throw err;
    console.warn('[ShiftService] toggleShiftActive fallback mock:', err.message);
  }

  const shifts = getMockShifts();
  const idx = shifts.findIndex((s) => String(s.id) === String(id));
  if (idx !== -1) {
    const existing = shifts[idx];
    if (!isActive && existing.scope === 'GLOBAL' && (existing.usedByBranchCount || 0) > 0 && !confirm) {
      const err = new Error('Ngừng ca chung ảnh hưởng các chi nhánh');
      err.response = {
        status: 409,
        data: {
          code: 'IMPACT_CONFIRM_REQUIRED',
          message: `Ngừng áp dụng khung ca này sẽ ảnh hưởng ${existing.usedByBranchCount} chi nhánh đang dùng ca chung.`,
          details: { affectedBranchCount: existing.usedByBranchCount },
        },
      };
      throw err;
    }

    shifts[idx].isActive = isActive;
    setMockShifts(shifts);

    // Cập nhật lại số ca riêng của chi nhánh
    if (existing.scope === 'BRANCH' && existing.branchId) {
      const branches = getMockBranches();
      const bIdx = branches.findIndex(
        (b) => String(b.id || b.storeId) === String(existing.branchId)
      );
      if (bIdx !== -1) {
        branches[bIdx].activeCustomShiftCount = shifts.filter(
          (s) => String(s.branchId) === String(existing.branchId) && s.isActive
        ).length;
        setMockBranches(branches);
      }
    }

    return shifts[idx];
  }
  return true;
};

/**
 * GET /api/branches?shiftMode=&q=
 * Lấy danh sách chi nhánh kèm chế độ ca
 */
export const getBranches = async (params = {}) => {
  try {
    let res;
    try {
      res = await apiClient.get('/branches', { params });
    } catch (e) {
      if (e.response?.status === 404) {
        res = await apiClient.get('/Stores', { params });
      } else {
        throw e;
      }
    }

    if (res && res.data) {
      const data = res.data.data || res.data;
      const rawList = Array.isArray(data) ? data : data.items || [];
      if (rawList.length > 0) {
        const shifts = getMockShifts();
        return rawList.map((b) => {
          const bId = b.id ?? b.storeId;
          const activeCustomCount = shifts.filter(
            (s) => String(s.branchId) === String(bId) && s.isActive
          ).length;
          return {
            ...b,
            id: bId,
            storeId: bId,
            name: b.name || b.branchName || `Chi nhánh ${bId}`,
            code: b.code || b.branchCode || `CN_${bId}`,
            shiftMode: b.shiftMode || 'GLOBAL',
            activeCustomShiftCount: b.activeCustomShiftCount ?? activeCustomCount,
            isLocked: Boolean(b.isLocked || b.status === 'LOCKED'),
          };
        });
      }
    }
  } catch (err) {
    console.warn('[ShiftService] getBranches fallback mock:', err.message);
  }

  let branches = getMockBranches();
  const shifts = getMockShifts();

  // Đồng bộ lại activeCustomShiftCount thực tế
  branches = branches.map((b) => {
    const bId = b.id ?? b.storeId;
    return {
      ...b,
      id: bId,
      storeId: bId,
      activeCustomShiftCount: shifts.filter(
        (s) => String(s.branchId) === String(bId) && s.isActive
      ).length,
    };
  });

  if (params.shiftMode) {
    branches = branches.filter((b) => b.shiftMode === params.shiftMode);
  }
  if (params.q) {
    const q = params.q.toLowerCase().trim();
    branches = branches.filter(
      (b) => b.name?.toLowerCase().includes(q) || b.code?.toLowerCase().includes(q)
    );
  }
  return branches;
};

/**
 * GET /api/branches/{id}/effective-shifts
 * Lấy bộ ca đang hiệu lực của chi nhánh (Ca chung hoặc Ca riêng)
 */
export const getBranchEffectiveShifts = async (branchId, signal) => {
  try {
    const res = await apiClient.get(`/branches/${branchId}/effective-shifts`, { signal });
    if (res.data) return res.data.data || res.data;
  } catch (err) {
    if (axios.isCancel(err) || err.name === 'CanceledError') throw err;
    console.warn('[ShiftService] getBranchEffectiveShifts fallback mock:', err.message);
  }

  const branches = getMockBranches();
  const shifts = getMockShifts();
  const branch =
    branches.find((b) => String(b.id || b.storeId) === String(branchId)) || branches[0];

  if (!branch) {
    return { branchId, branchName: '', shiftMode: 'GLOBAL', source: 'GLOBAL', shifts: [] };
  }

  if (branch.shiftMode === 'CUSTOM') {
    const customShifts = shifts.filter(
      (s) => String(s.branchId) === String(branchId) && s.isActive
    );
    return {
      branchId: branch.id || branch.storeId,
      branchName: branch.name,
      shiftMode: 'CUSTOM',
      source: 'CUSTOM',
      shifts: customShifts,
    };
  }

  // Dùng ca chung
  const globalShifts = shifts.filter((s) => s.scope === 'GLOBAL' && s.isActive);
  return {
    branchId: branch.id || branch.storeId,
    branchName: branch.name,
    shiftMode: 'GLOBAL',
    source: 'GLOBAL',
    shifts: globalShifts,
  };
};

/**
 * GET /api/branches/{id}/custom-shifts
 * Lấy danh sách toàn bộ ca riêng của chi nhánh
 */
export const getBranchCustomShifts = async (branchId, signal) => {
  try {
    const res = await apiClient.get(`/branches/${branchId}/custom-shifts`, { signal });
    if (res.data) {
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : data.items || [];
    }
  } catch (err) {
    if (axios.isCancel(err) || err.name === 'CanceledError') throw err;
    console.warn('[ShiftService] getBranchCustomShifts fallback mock:', err.message);
  }

  const shifts = getMockShifts();
  return shifts.filter((s) => String(s.branchId) === String(branchId));
};

/**
 * PATCH /api/branches/{id}/shift-mode { mode: "GLOBAL"|"CUSTOM", confirm }
 */
export const updateBranchShiftMode = async (branchId, mode, confirm = false) => {
  try {
    const res = await apiClient.patch(`/branches/${branchId}/shift-mode`, { mode, confirm });
    if (res.data) return res.data.data || res.data;
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 409 || err.response?.status === 423) {
      throw err;
    }
    console.warn('[ShiftService] updateBranchShiftMode fallback mock:', err.message);
  }

  const branches = getMockBranches();
  const shifts = getMockShifts();
  const branchIdx = branches.findIndex(
    (b) => String(b.id || b.storeId) === String(branchId)
  );

  if (branchIdx === -1) {
    const error = new Error('Chi nhánh không tồn tại');
    error.response = { status: 404, data: { message: 'Chi nhánh không tồn tại' } };
    throw error;
  }

  const branch = branches[branchIdx];

  // 1. Kiểm tra 423 BRANCH_LOCKED
  if (branch.isLocked) {
    const error = new Error('Chi nhánh đang bị khóa');
    error.response = {
      status: 423,
      data: {
        code: 'BRANCH_LOCKED',
        message: 'Chi nhánh đang bị khóa, không thể thay đổi thiết lập khung ca.',
      },
    };
    throw error;
  }

  // 2. Chuyển sang CUSTOM: Kiểm tra 400 NO_ACTIVE_CUSTOM_SHIFT
  if (mode === 'CUSTOM') {
    const activeCustomCount = shifts.filter(
      (s) => String(s.branchId) === String(branchId) && s.isActive
    ).length;

    if (activeCustomCount === 0) {
      const error = new Error('Chi nhánh chưa có ca riêng nào đang áp dụng');
      error.response = {
        status: 400,
        data: {
          code: 'NO_ACTIVE_CUSTOM_SHIFT',
          message: 'Chi nhánh chưa có ca riêng nào đang áp dụng, hãy thêm ca riêng trước.',
        },
      };
      throw error;
    }
  }

  // 3. Kiểm tra 409 FUTURE_SCHEDULES_EXIST nếu chưa confirm
  if (String(branchId) === '4' && !confirm) {
    const error = new Error('Có lịch ca trong tương lai thuộc bộ ca hiện tại');
    error.response = {
      status: 409,
      data: {
        code: 'FUTURE_SCHEDULES_EXIST',
        message:
          'Có 14 ca đã xếp trong tương lai thuộc bộ ca hiện tại. Lịch đã xếp giữ nguyên, chỉ áp dụng cho lịch xếp mới.',
        details: { futureAssignmentCount: 14 },
      },
    };
    throw error;
  }

  branches[branchIdx].shiftMode = mode;
  setMockBranches(branches);

  return {
    branchId: branch.id || branch.storeId,
    branchName: branch.name,
    shiftMode: mode,
  };
};

export default {
  checkIsOvernight,
  calculatePaidHours,
  calculateNightHours,
  getShiftTemplateStats,
  getShiftTemplates,
  createShiftTemplate,
  updateShiftTemplate,
  toggleShiftActive,
  getBranches,
  getBranchEffectiveShifts,
  getBranchCustomShifts,
  updateBranchShiftMode,
};
