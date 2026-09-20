import axiosInstance from '@/config/axios.config';

/**
 * ==============================================================================
 * PHÂN HỆ: Điều Động Nhân Sự Tạm Thời Liên Chi Nhánh (Cross-Branch Temporary Dispatch)
 * SERVICE: dispatch.service.js
 * ==============================================================================
 * Đồng bộ với DispatchController (.NET 8):
 * - POST /Dispatch/request         : Tạo phiếu đề nghị chi viện nhân sự liên chi nhánh
 * - POST /Dispatch/review          : Phê duyệt / từ chối đề nghị chi viện & chỉ định nhân sự
 * - GET  /Dispatch/store/:storeId  : Danh sách lệnh điều động theo chi nhánh (2 chiều)
 * - GET  /Dispatch/all             : Danh sách lệnh điều động toàn hệ thống (hỗ trợ lọc)
 * - GET  /Dispatch/network-metrics : Báo cáo ma trận điều chuyển & tổng giờ công chi viện
 * ==============================================================================
 */

const dispatchService = {
  /**
   * Tạo phiếu đề nghị chi viện nhân sự liên chi nhánh
   * @param {Object} data - { employeeId, fromStoreId, toStoreId, startDate, endDate, reason }
   * @returns {Promise<Object>} ApiResponse<DispatchRecordDto>
   */
  createDispatchRequest: async (data) => {
    const response = await axiosInstance.post('/Dispatch/request', data);
    return response.data;
  },

  /**
   * Chỉnh sửa phiếu đề nghị chi viện nhân sự khi còn chờ duyệt (PENDING)
   * @param {number|string} id - DispatchId
   * @param {Object} data - { employeeId, fromStoreId, toStoreId, startDate, endDate, reason }
   * @returns {Promise<Object>} ApiResponse<DispatchRecordDto>
   */
  updateDispatchRequest: async (id, data) => {
    const response = await axiosInstance.put(`/Dispatch/request/${id}`, data);
    return response.data;
  },

  /**
   * Hủy và xóa phiếu đề nghị chi viện nhân sự khi còn chờ duyệt (PENDING)
   * @param {number|string} id - DispatchId
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  deleteDispatchRequest: async (id) => {
    const response = await axiosInstance.delete(`/Dispatch/request/${id}`);
    return response.data;
  },

  /**
   * Phê duyệt hoặc từ chối phiếu điều động nhân sự
   * @param {Object} data - { dispatchId, isApproved, assignedEmployeeId, approvalNotes }
   * @returns {Promise<Object>} ApiResponse<bool>
   */
  reviewDispatchRequest: async (data) => {
    const response = await axiosInstance.post('/Dispatch/review', data);
    return response.data;
  },

  /**
   * Lấy danh sách lệnh điều động liên quan đến cửa hàng (cả chiều gửi đi và nhận về)
   * @param {number|string} storeId
   * @returns {Promise<Object>} ApiResponse<List<DispatchRecordDto>>
   */
  getStoreDispatches: async (storeId) => {
    const response = await axiosInstance.get(`/Dispatch/store/${storeId}`);
    return response.data;
  },

  /**
   * Lấy danh sách tất cả các lệnh điều động toàn hệ thống
   * @param {Object} params - { status, storeId }
   * @returns {Promise<Object>} ApiResponse<List<DispatchRecordDto>>
   */
  getAllDispatches: async (params = {}) => {
    const response = await axiosInstance.get('/Dispatch/all', { params });
    return response.data;
  },

  /**
   * Lấy số liệu ma trận điều động và giám sát mạng lưới toàn chuỗi
   * @param {Object} params - { fromDate, toDate }
   * @returns {Promise<Object>} ApiResponse<DispatchNetworkMetricsDto>
   */
  getNetworkMetrics: async (params = {}) => {
    const response = await axiosInstance.get('/Dispatch/network-metrics', { params });
    return response.data;
  },

  /**
   * Lấy danh mục chi nhánh đang hoạt động để chọn đơn vị chi viện/tiếp nhận
   * @returns {Promise<Array>} Danh sách chi nhánh
   */
  getActiveBranches: async () => {
    try {
      const response = await axiosInstance.get('/Users/branches');
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
    // Tiêu chí kiểm tra để loại trừ Cửa hàng trưởng khỏi diện điều động
    const isStoreManager = (emp) => {
      const pos = String(emp.positionName || emp.roleName || '').toLowerCase();
      const code = String(emp.employeeCode || '').toUpperCase();
      const role = String(emp.role || '').toUpperCase();
      return (
        code.startsWith('MGR') ||
        role === 'STORE_MANAGER' ||
        pos.includes('quản lý cửa hàng') ||
        pos.includes('store manager')
      );
    };

    try {
      // Sử dụng endpoint tra cứu nhân sự theo chi nhánh hỗ trợ cross-branch
      const response = await axiosInstance.get('/kiosk/attendance/search-employees', {
        params: { storeId: Number(branchId) }
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((emp) => ({
          id: emp.employeeId,
          userId: emp.employeeId,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          roleName: emp.positionName || 'Nhân viên',
          positionName: emp.positionName || 'Nhân viên',
        }));
        return mapped.filter((emp) => !isStoreManager(emp));
      }
      return [];
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên chi nhánh qua search-employees, thử fallback:', err);
      try {
        const fbRes = await axiosInstance.get('/Users/employees', {
          params: { branchId: Number(branchId), status: 'ACTIVE' }
        });
        if (fbRes.data?.success && Array.isArray(fbRes.data.data)) {
          return fbRes.data.data.filter((emp) => !isStoreManager(emp));
        }
      } catch (e) {
        console.error('Lỗi fallback lấy danh sách nhân viên:', e);
      }
      return [];
    }
  },
};

export default dispatchService;
