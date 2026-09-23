import axios from 'axios';
import { getAllBranches, updateBranch, ensureAdminToken } from './branch.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

/**
 * Metadata chính thức của 3 cấp phân loại Chi nhánh trong hệ thống RWFM Enterprise
 */
export const TIER_DEFINITIONS = [
  {
    tier: 1,
    tierName: 'Tier 1 - Đại Siêu Thị / Flagship',
    shortName: 'Cấp 1 - Flagship',
    code: 'TIER_1',
    minStaff: 20,
    maxStaff: 35,
    standardQuota: 30,
    defaultGeofence: 200,
    color: '#f59e0b',
    badgeBg: 'rgba(234, 179, 8, 0.15)',
    badgeBorder: 'rgba(234, 179, 8, 0.4)',
    accentGlow: '0 0 20px rgba(245, 158, 11, 0.15)',
    description:
      'Cửa hàng quy mô lớn, lưu lượng khách cao tại trung tâm thương mại hoặc ngã tư lớn. Trang bị hệ thống Kiosk đa luồng và định biên nhân sự tối đa.',
    conditions:
      'Diện tích sàn > 250m², doanh thu mục tiêu > 500tr/tháng, tối thiểu 20 nhân sự trực ca.',
    benefits:
      'Được trang bị 2-4 máy Kiosk iPad, ưu tiên tiếp nhận nhân sự điều động tăng cường vào ca cao điểm, định biên trần 35 nhân sự, phê duyệt nhanh các đề xuất tăng ca.',
  },
  {
    tier: 2,
    tierName: 'Tier 2 - Siêu Thị Tiêu Chuẩn / Standard',
    shortName: 'Cấp 2 - Tiêu Chuẩn',
    code: 'TIER_2',
    minStaff: 10,
    maxStaff: 19,
    standardQuota: 15,
    defaultGeofence: 150,
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeBorder: 'rgba(59, 130, 246, 0.35)',
    accentGlow: '0 0 20px rgba(59, 130, 246, 0.15)',
    description:
      'Cửa hàng mô hình chuẩn trên các tuyến phố đông dân cư. Hoạt động 2-3 ca linh hoạt với 1-2 trạm điểm danh Kiosk.',
    conditions:
      'Diện tích sàn 100m² - 250m², doanh thu mục tiêu 200tr - 500tr/tháng, nhân sự từ 10 - 19 người.',
    benefits:
      'Được cấp 1-2 máy Kiosk, định biên 15-19 nhân sự, tự động lập lịch phân ca tối ưu công chuẩn 8 tiếng/ngày.',
  },
  {
    tier: 3,
    tierName: 'Tier 3 - Cửa Hàng Tiện Lợi Mini / Compact',
    shortName: 'Cấp 3 - Mini',
    code: 'TIER_3',
    minStaff: 4,
    maxStaff: 9,
    standardQuota: 8,
    defaultGeofence: 80,
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    accentGlow: '0 0 20px rgba(16, 185, 129, 0.15)',
    description:
      'Cửa hàng tiện lợi quy mô nhỏ, ngõ phố hoặc khu văn phòng. Vận hành tinh gọn với 1 máy Kiosk di động hoặc máy tính bảng.',
    conditions:
      'Diện tích sàn < 100m², nhân sự từ 4 - 9 người, trực ca theo mô hình kiêm nhiệm thu ngân & bán hàng.',
    benefits:
      'Cấu hình Kiosk siêu tốc, quản lý linh hoạt ca gãy và chấm công mã OTP cá nhân linh động.',
  },
];

/**
 * 1. Lấy thống kê tổng hợp phân cấp chi nhánh từ Backend
 * Endpoint: GET /api/v1/branches/tier-summary hoặc /api/Stores/tier-summary
 */
export const getTierSummary = async () => {
  try {
    const endpoints = [
      '/v1/branches/tier-summary',
      '/Stores/tier-summary',
      '/v1/branches/summary',
      '/Stores/summary',
    ];

    for (const ep of endpoints) {
      try {
        const res = await apiClient.get(ep);
        const data = res.data?.data || res.data;
        if (data && typeof data.tier1Count === 'number') {
          return {
            tier1Count: data.tier1Count || 0,
            tier2Count: data.tier2Count || 0,
            tier3Count: data.tier3Count || 0,
            totalCount: data.totalCount || (data.tier1Count + data.tier2Count + data.tier3Count),
          };
        }
      } catch (e) {
        // Continue fallback
      }
    }
  } catch (err) {
    console.warn('[TierService] Backend tier summary failed, calculating from branch list:', err.message);
  }

  // Fallback: tính toán trực tiếp từ danh sách chi nhánh
  const branches = await getAllBranches();
  const tier1Count = branches.filter((b) => Number(b.branchTier || b.tier || 2) === 1).length;
  const tier2Count = branches.filter((b) => Number(b.branchTier || b.tier || 2) === 2).length;
  const tier3Count = branches.filter((b) => Number(b.branchTier || b.tier || 2) === 3).length;

  return {
    tier1Count,
    tier2Count,
    tier3Count,
    totalCount: branches.length,
  };
};

const STORAGE_KEY_CUSTOM_QUOTAS = 'wfm_branch_custom_quotas_v1';

export const getCustomQuotasMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUOTAS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    1: 30, // CH01: Flagship 30
    2: 15, // CH02: Standard 15
    3: 8,  // CH03: Mini 8
    4: 30, // C001: Flagship 30
  };
};

export const setCustomQuotasMap = (map) => {
  localStorage.setItem(STORAGE_KEY_CUSTOM_QUOTAS, JSON.stringify(map));
};

export const getBranchQuota = (storeId, tier) => {
  const map = getCustomQuotasMap();
  const id = Number(storeId);
  if (map[id] !== undefined) return Number(map[id]);
  const t = Number(tier || 2);
  const def = TIER_DEFINITIONS.find((td) => td.tier === t);
  return def ? def.standardQuota : 15;
};

/**
 * 2. Cập nhật cấp chi nhánh & chỉ tiêu nhân sự định biên (Lưu trực tiếp vào Backend)
 */
export const updateBranchTierAndQuota = async (storeId, newTier, quota, note = '') => {
  const currentBranches = await getAllBranches();
  const id = Number(storeId);
  const branch = currentBranches.find(
    (b) => String(b.storeId || b.id) === String(storeId)
  );

  const finalTier = Number(newTier ?? branch?.branchTier ?? 2);
  const finalQuota = Number(quota ?? getBranchQuota(id, finalTier));

  // Lưu quota tùy chỉnh
  const quotasMap = getCustomQuotasMap();
  quotasMap[id] = finalQuota;
  setCustomQuotasMap(quotasMap);

  const payload = {
    ...(branch || {}),
    storeId: id,
    id: id,
    branchTier: finalTier,
    tier: finalTier,
    targetStaffCount: finalQuota,
    headcountQuota: finalQuota,
    tierNote: note,
  };

  return await updateBranch(storeId, payload);
};

export const updateBranchTier = async (storeId, newTier, note = '') => {
  return await updateBranchTierAndQuota(storeId, newTier, undefined, note);
};

/**
 * 3. Tăng/Giảm nhanh chỉ tiêu nhân sự của chi nhánh (+1 hoặc -1)
 */
export const quickAdjustHeadcount = async (storeId, delta) => {
  const id = Number(storeId);
  const currentBranches = await getAllBranches();
  const branch = currentBranches.find((b) => Number(b.storeId || b.id) === id);
  const tier = Number(branch?.branchTier || branch?.tier || 2);
  const currentQuota = getBranchQuota(id, tier);
  const newQuota = Math.max(1, currentQuota + delta);

  return await updateBranchTierAndQuota(id, tier, newQuota, `Điều chỉnh nhanh ${delta > 0 ? '+' : ''}${delta} định biên nhân sự`);
};

export default {
  TIER_DEFINITIONS,
  getTierSummary,
  getAllBranches,
  getCustomQuotasMap,
  getBranchQuota,
  updateBranchTier,
  updateBranchTierAndQuota,
  quickAdjustHeadcount,
};
