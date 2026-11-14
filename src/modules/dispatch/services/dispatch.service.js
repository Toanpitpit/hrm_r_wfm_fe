import axiosInstance from '@/config/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';

/**
 * ==============================================================================
 * PHÂN HỆ: Điều Động Nhân Sự Tạm Thời Liên Chi Nhánh (Cross-Branch Temporary Dispatch)
 * SERVICE: dispatch.service.js
 * ==============================================================================
 * Đồng bộ với DispatchController (.NET 8):
 * - POST   /api/dispatches/request         : Tạo phiếu đề nghị chi viện nhân sự liên chi nhánh
 * - PUT    /api/dispatches/request/:id     : Chỉnh sửa phiếu đề nghị chi viện
 * - POST   /api/dispatches/recall/:id      : Thu hồi đơn đề nghị chi viện
 * - DELETE /api/dispatches/request/:id     : Hủy và xóa đơn đề nghị chi viện
 * - POST   /api/dispatches/review          : Phê duyệt / từ chối đề nghị chi viện & chỉ định nhân sự
 * - GET    /api/dispatches/store/:storeId  : Danh sách lệnh điều động theo chi nhánh (2 chiều)
 * - GET    /api/dispatches/all             : Danh sách lệnh điều động toàn hệ thống (hỗ trợ lọc)
 * - GET    /api/dispatches/network-metrics : Báo cáo ma trận điều chuyển & tổng giờ công chi viện
 * - GET    /api/dispatches/branch-employees/:branchId : Danh sách nhân sự chi viện
 * - GET    /api/dispatches/branch-quota/:branchId     : Định biên an toàn 40%
 * ==============================================================================
 */

const dispatchService = {
  /**
   * Tạo phiếu đề nghị chi viện nhân sự liên chi nhánh
   * @param {Object} data - { employeeId, fromStoreId, toStoreId, startDate, endDate, reason }
   * @returns {Promise<Object>} ApiResponse<DispatchRecordDto>
   */
  createDispatchRequest: async (data) => {
    const empIds = Array.isArray(data.employeeIds)
      ? data.employeeIds.map(Number)
      : data.employeeId ? [Number(data.employeeId)] : [];
    const payload = {
      ...data,
      employeeIds: empIds,
      employeeId: empIds.length > 0 ? empIds[0] : (data.employeeId ? Number(data.employeeId) : undefined),
    };
    const response = await axiosInstance.post(API_ENDPOINTS.DISPATCH.REQUEST, payload);
    return response.data;
  },

  /**
   * Chỉnh sửa phiếu đề nghị chi viện nhân sự khi còn chờ duyệt (PENDING)
   * @param {number|string} id - DispatchId
   * @param {Object} data - { employeeIds, employeeId, fromStoreId, toStoreId, startDate, endDate, reason }
   * @returns {Promise<Object>} ApiResponse<DispatchRecordDto>
   */
  updateDispatchRequest: async (id, data) => {
    const empIds = Array.isArray(data.employeeIds)
      ? data.employeeIds.map(Number)
      : data.employeeId ? [Number(data.employeeId)] : [];
    const payload = {
      ...data,
      employeeIds: empIds,
      employeeId: empIds.length > 0 ? empIds[0] : (data.employeeId ? Number(data.employeeId) : undefined),
    };
    const response = await axiosInstance.put(API_ENDPOINTS.DISPATCH.UPDATE(id), payload);
    return response.data;
  },

  /**
   * Thu hồi phiếu đề nghị chi viện nhân sự khi còn chờ duyệt để chỉnh sửa (RECALLED)
   * @param {number|string} id - DispatchId
   * @param {string} [reason] - Lý do thu hồi
   * @returns {Promise<Object>} ApiResponse<DispatchRecordDto>
   */
  recallDispatchRequest: async (id, reason) => {
    const response = await axiosInstance.post(API_ENDPOINTS.DISPATCH.RECALL(id), { reason });
    return response.data;
  },

  /**
   * Hủy và xóa phiếu đề nghị chi viện nhân sự khi còn chờ duyệt (PENDING) hoặc đã thu hồi (RECALLED)
   * @param {number|string} id - DispatchId
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  deleteDispatchRequest: async (id) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.DISPATCH.DELETE(id));
    return response.data;
  },

  /**
   * Phê duyệt hoặc từ chối phiếu điều động nhân sự
   * @param {Object} data - { dispatchId, isApproved, assignedEmployeeId, approvalNotes }
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  reviewDispatchRequest: async (data) => {
    const response = await axiosInstance.post(API_ENDPOINTS.DISPATCH.REVIEW, data);
    return response.data;
  },

  /**
   * Lấy danh sách lệnh điều động liên quan đến cửa hàng (cả chiều gửi đi và nhận về)
   * @param {number|string} storeId
   * @returns {Promise<Object>} ApiResponse<List<DispatchRecordDto>>
   */
  getStoreDispatches: async (storeId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.DISPATCH.STORE_DISPATCHES(storeId));
    return response.data;
  },

  /**
   * Lấy danh sách tất cả các lệnh điều động toàn hệ thống
   * @param {Object} params - { status, storeId }
   * @returns {Promise<Object>} ApiResponse<List<DispatchRecordDto>>
   */
  getAllDispatches: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.DISPATCH.ALL, { params });
    return response.data;
  },

  /**
   * Lấy số liệu ma trận điều động và giám sát mạng lưới toàn chuỗi
   * @param {Object} params - { fromDate, toDate }
   * @returns {Promise<Object>} ApiResponse<DispatchNetworkMetricsDto>
   */
  getNetworkMetrics: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.DISPATCH.NETWORK_METRICS, { params });
    return response.data;
  },

  /**
   * Lấy danh mục chi nhánh đang hoạt động để chọn đơn vị chi viện/tiếp nhận
   * @returns {Promise<Array>} Danh sách chi nhánh
   */
  getActiveBranches: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BRANCHES.LIST);
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Lỗi khi lấy danh sách chi nhánh:', err);
      return [];
    }
  },

  /**
   * Lấy danh sách nhân viên đang hoạt động của một chi nhánh cụ thể (hỗ trợ liên chi nhánh)
   * @param {number|string} branchId
   * @returns {Promise<Array>} Danh sách nhân viên
   */
  getEmployeesByBranch: async (branchId) => {
    if (!branchId) return [];

    const isStoreManager = (emp) => {
      const pos = String(emp.positionName || emp.roleName || '').toLowerCase();
      const code = String(emp.employeeCode || '').toUpperCase();
      const role = String(emp.role || emp.roleCode || '').toUpperCase();
      return (
        code.startsWith('MGR') ||
        role === 'STORE_MANAGER' ||
        pos.includes('quản lý cửa hàng') ||
        pos.includes('store manager')
      );
    };

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.DISPATCH.BRANCH_EMPLOYEES(branchId));
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.filter((emp) => !isStoreManager(emp));
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân sự chi nhánh chi viện:', err.message);
    }
    return [];
  },

  /**
   * Tra cứu định biên an toàn và số lượng nhân sự khả dụng cho điều động của chi nhánh cho mượn (SourceBranch).
   * @param {number|string} branchId
   * @param {string} [startDate]
   * @param {string} [endDate]
   * @param {number|string} [excludeDispatchId]
   * @returns {Promise<Object>} ApiResponse<BranchDispatchQuotaStatusDto>
   */
  getBranchDispatchQuota: async (branchId, startDate, endDate, excludeDispatchId) => {
    if (!branchId) return null;
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (excludeDispatchId) params.excludeDispatchId = excludeDispatchId;
    const response = await axiosInstance.get(API_ENDPOINTS.DISPATCH.BRANCH_QUOTA(branchId), { params });
    return response.data;
  },
};

export default dispatchService;
