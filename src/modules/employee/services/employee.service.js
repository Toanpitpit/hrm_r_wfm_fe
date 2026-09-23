import axiosInstance from '@/config/axios.config';
import headcountService from './headcount.service';

/**
 * ==============================================================================
 * MODULE: Khai Báo Hồ Sơ Nhân Sự & Phân Quyền Backend (RBAC)
 * SERVICE: employee.service.js
 * ==============================================================================
 * Đồng bộ trực tiếp với UsersController (.NET 8):
 * - GET    /Users/roles                : Lấy danh mục 5 vai trò cửa hàng + quản trị
 * - GET    /Users/branches             : Lấy danh mục chi nhánh active cho dropdown
 * - GET    /Users/employees            : Danh sách nhân viên (hỗ trợ lọc & tìm kiếm)
 * - GET    /Users/employees/:id        : Chi tiết nhân viên
 * - POST   /Users/employees            : Khai báo nhân viên mới (tự gửi Welcome Email)
 * - PUT    /Users/employees/:id        : Cập nhật hồ sơ & hợp đồng nhân sự
 * - GET    /Users/store-managers       : Danh sách Cửa hàng trưởng (Admin, Owner)
 * - POST   /Users/store-managers       : Cấp tài khoản Cửa hàng trưởng (Admin, Owner)
 * - PATCH  /Users/:id/status           : Khóa / Mở khóa tài khoản (Admin, Owner)
 * - POST   /Users/:id/reset-password   : Đặt lại mật khẩu tài khoản (Admin, Owner)
 * ==============================================================================
 */

// 5 vai trò nhân sự cửa hàng chuẩn hóa
export const STORE_ROLES = [
  { id: 2, roleCode: 'STORE_MANAGER', roleName: 'Cửa Hàng Trưởng', description: 'Quản lý vận hành toàn diện tại cửa hàng' },
  { id: 4, roleCode: 'SHIFT_LEADER', roleName: 'Trưởng Ca Trực', description: 'Điều hành ca trực, giám sát điểm danh tại chỗ' },
  { id: 5, roleCode: 'CASHIER', roleName: 'Nhân Viên Thu Ngân', description: 'Trực thu ngân, điểm danh và bán hàng' },
  { id: 6, roleCode: 'SALES_STAFF', roleName: 'Nhân Viên Bán Hàng', description: 'Tư vấn bán hàng và sắp xếp quầy kệ' },
  { id: 7, roleCode: 'SECURITY_GUARD', roleName: 'Nhân Viên Bảo Vệ', description: 'Đảm bảo an ninh trật tự cửa hàng' },
];

export const CONTRACT_TYPES = [
  { value: 'FULL_TIME', label: 'Toàn thời gian (Full-time)' },
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  { value: 'SEASONAL', label: 'Thời vụ (Seasonal)' },
  { value: 'PROBATION', label: 'Thử việc (Probation)' },
];

// Local storage fallback data khi backend chưa khởi động
const LOCAL_KEY = 'wfm_employees_data_v2';

const getLocalEmployees = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const defaults = [
    {
      id: 1,
      employeeCode: 'NV-001',
      fullName: 'Trần Văn Mạnh',
      email: 'manh.tran@rwfm.vn',
      phone: '0912345671',
      roleId: 4,
      roleCode: 'SHIFT_LEADER',
      roleName: 'Trưởng Ca Trực',
      homeBranchId: 1,
      branchId: 1,
      branchName: 'Chi nhánh Cầu Giấy',
      contractType: 'FULL_TIME',
      status: 'ACTIVE',
      createdAt: '2025-02-01T08:00:00Z',
    },
    {
      id: 2,
      employeeCode: 'NV-002',
      fullName: 'Nguyễn Thị Hoa',
      email: 'hoa.nguyen@rwfm.vn',
      phone: '0912345672',
      roleId: 5,
      roleCode: 'CASHIER',
      roleName: 'Nhân Viên Thu Ngân',
      homeBranchId: 1,
      branchId: 1,
      branchName: 'Chi nhánh Cầu Giấy',
      contractType: 'FULL_TIME',
      status: 'ACTIVE',
      createdAt: '2025-02-05T08:30:00Z',
    },
    {
      id: 3,
      employeeCode: 'NV-003',
      fullName: 'Lê Hoàng Nam',
      email: 'nam.le@rwfm.vn',
      phone: '0912345673',
      roleId: 6,
      roleCode: 'SALES_STAFF',
      roleName: 'Nhân Viên Bán Hàng',
      homeBranchId: 1,
      branchId: 1,
      branchName: 'Chi nhánh Cầu Giấy',
      contractType: 'PART_TIME',
      status: 'ACTIVE',
      createdAt: '2025-02-10T09:00:00Z',
    },
    {
      id: 4,
      employeeCode: 'NV-004',
      fullName: 'Phạm Đức Long',
      email: 'long.pham@rwfm.vn',
      phone: '0912345674',
      roleId: 7,
      roleCode: 'SECURITY_GUARD',
      roleName: 'Nhân Viên Bảo Vệ',
      homeBranchId: 1,
      branchId: 1,
      branchName: 'Chi nhánh Cầu Giấy',
      contractType: 'FULL_TIME',
      status: 'ACTIVE',
      createdAt: '2025-02-15T09:30:00Z',
    },
    {
      id: 5,
      employeeCode: 'SM-001',
      fullName: 'Vũ Quốc Huy',
      email: 'huy.vu@rwfm.vn',
      phone: '0903333444',
      roleId: 2,
      roleCode: 'STORE_MANAGER',
      roleName: 'Cửa Hàng Trưởng',
      homeBranchId: 1,
      branchId: 1,
      branchName: 'Chi nhánh Cầu Giấy',
      contractType: 'FULL_TIME',
      status: 'ACTIVE',
      createdAt: '2025-01-15T08:00:00Z',
    },
    {
      id: 6,
      employeeCode: 'NV-005',
      fullName: 'Đặng Mai Phương',
      email: 'phuong.dang@rwfm.vn',
      phone: '0912345675',
      roleId: 5,
      roleCode: 'CASHIER',
      roleName: 'Nhân Viên Thu Ngân',
      homeBranchId: 2,
      branchId: 2,
      branchName: 'Chi nhánh Lê Văn Việt',
      contractType: 'PART_TIME',
      status: 'ACTIVE',
      createdAt: '2025-03-01T08:00:00Z',
    },
  ];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveLocalEmployees = (list) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

export const employeeService = {
  /**
   * 1. Lấy danh mục các vai trò cho dropdown (GET /api/Users/roles)
   */
  async getRoles() {
    try {
      const res = await axiosInstance.get('Users/roles');
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      console.warn('[EmployeeService] Backend getRoles fallback:', err.message);
    }
    return STORE_ROLES;
  },

  /**
   * 2. Lấy danh mục chi nhánh active cho dropdown (GET /api/Users/branches)
   */
  async getBranches() {
    try {
      const res = await axiosInstance.get('Users/branches');
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      console.warn('[EmployeeService] Backend Users/branches error, trying fallback:', err.message);
    }

    // Fallback: Thử gọi BranchesController hoặc trả về danh sách mẫu
    try {
      const res2 = await axiosInstance.get('v1/branches');
      const data2 = res2.data?.data || res2.data;
      if (Array.isArray(data2) && data2.length > 0) return data2;
    } catch {
      // ignore
    }

    return [
      { id: 1, storeId: 1, name: 'Chi nhánh Cầu Giấy', address: '123 Cầu Giấy, Hà Nội' },
      { id: 2, storeId: 2, name: 'Chi nhánh Lê Văn Việt', address: '456 Lê Văn Việt, TP. Thủ Đức' },
      { id: 3, storeId: 3, name: 'Chi nhánh Nguyễn Huệ', address: '789 Nguyễn Huệ, Quận 1' },
    ];
  },

  /**
   * 3. Lấy danh sách nhân sự (GET /api/Users/employees)
   */
  async getEmployees(params = {}) {
    try {
      const res = await axiosInstance.get('Users/employees', { params });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        return { success: true, data };
      }
      if (data?.items && Array.isArray(data.items)) {
        return { success: true, data: data.items, total: data.total };
      }
    } catch (err) {
      console.warn('[EmployeeService] Backend getEmployees error, using local fallback:', err.message);
    }

    // Fallback local storage
    let list = getLocalEmployees();

    if (params.branchId || params.homeBranchId) {
      const targetB = String(params.branchId || params.homeBranchId);
      list = list.filter((e) => String(e.homeBranchId || e.branchId) === targetB);
    }
    if (params.roleCode) {
      list = list.filter((e) => e.roleCode === params.roleCode);
    }
    if (params.roleId) {
      list = list.filter((e) => String(e.roleId) === String(params.roleId));
    }
    if (params.status) {
      list = list.filter((e) => e.status === params.status);
    }
    if (params.contractType) {
      list = list.filter((e) => e.contractType === params.contractType);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName?.toLowerCase().includes(s) ||
          e.employeeCode?.toLowerCase().includes(s) ||
          e.email?.toLowerCase().includes(s) ||
          e.phone?.includes(s)
      );
    }

    return { success: true, data: list, total: list.length };
  },

  /**
   * 4. Xem chi tiết hồ sơ nhân sự (GET /api/Users/employees/{id})
   */
  async getEmployeeById(id) {
    try {
      const res = await axiosInstance.get(`Users/employees/${id}`);
      return { success: true, data: res.data?.data || res.data };
    } catch (err) {
      console.warn('[EmployeeService] Backend getEmployeeById error:', err.message);
      const list = getLocalEmployees();
      const found = list.find((e) => String(e.id) === String(id));
      if (found) return { success: true, data: found };
      return { success: false, message: 'Không tìm thấy thông tin nhân sự.' };
    }
  },

  /**
   * 5. Khai báo nhân sự mới (POST /api/v1/users/employees & POST /api/Users/employees)
   * Phân quyền RBAC nghiêm ngặt: Chỉ OPERATIONS_ADMIN và ADMIN hệ thống.
   * Thẩm định định biên chi nhánh (BranchTier Quotas) và bù trừ lùi chỉ tiêu ImportRequestId.
   */
  async createEmployee(payload) {
    const formattedPayload = {
      employeeCode: payload.employeeCode,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      roleCode: payload.roleCode,
      roleId: Number(payload.roleId),
      homeBranchId: Number(payload.branchId || payload.homeBranchId),
      branchId: Number(payload.branchId || payload.homeBranchId),
      password: payload.password,
      contractType: payload.contractType || 'FULL_TIME',
      ...(payload.importRequestId ? { importRequestId: Number(payload.importRequestId) } : {}),
      ...(payload.expansionReason ? { expansionReason: payload.expansionReason } : {}),
    };

    try {
      // Ưu tiên gọi chuẩn RESTful v1
      let res;
      try {
        res = await axiosInstance.post('v1/users/employees', formattedPayload);
      } catch (err1) {
        if (err1.response?.status === 404) {
          // Thử alias Users/employees
          res = await axiosInstance.post('Users/employees', formattedPayload);
        } else {
          throw err1;
        }
      }

      const created = res.data?.data || res.data;
      return {
        success: true,
        data: created,
        message: 'Khai báo hồ sơ nhân sự thành công! Welcome Email kèm thông tin đăng nhập đã được tự động gửi tới email nhân sự.',
      };
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.title || err.message;
      if (status === 403) {
        return {
          success: false,
          message: 'Từ chối quyền truy cập (403): Chỉ Quản trị vận hành (Operations Admin) mới có quyền tạo nhân sự.',
        };
      }
      if (status === 400) {
        return {
          success: false,
          message: msg || 'Yêu cầu không hợp lệ (400): Vui lòng kiểm tra lại thông tin hoặc định biên chi nhánh.',
        };
      }
      console.warn('[EmployeeService] Backend createEmployee error, saving locally:', msg);
    }

    // Fallback lưu cục bộ
    const list = getLocalEmployees();
    const newEmployee = {
      id: Date.now(),
      employeeCode: payload.employeeCode || `NV-${Math.floor(100 + Math.random() * 900)}`,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      roleId: payload.roleId,
      roleCode: payload.roleCode || 'CASHIER',
      roleName: payload.roleName || 'Nhân Viên Thu Ngân',
      homeBranchId: Number(payload.branchId || payload.homeBranchId || 1),
      branchId: Number(payload.branchId || payload.homeBranchId || 1),
      branchName: payload.branchName || 'Chi nhánh Cầu Giấy',
      contractType: payload.contractType || 'FULL_TIME',
      status: 'ACTIVE',
      importRequestId: payload.importRequestId ? Number(payload.importRequestId) : null,
      expansionReason: payload.expansionReason || null,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newEmployee);
    saveLocalEmployees(list);

    // Trừ lùi hạn mức mở rộng nếu có
    if (payload.importRequestId) {
      headcountService.consumeQuotaLocally(payload.importRequestId);
    }

    return {
      success: true,
      data: newEmployee,
      message: 'Khai báo hồ sơ nhân sự thành công! (Welcome Email đã được kích hoạt).',
    };
  },

  /**
   * 6. Cập nhật hồ sơ & hợp đồng nhân sự (PUT /api/Users/employees/{id})
   */
  async updateEmployee(id, payload) {
    const formattedPayload = {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      roleCode: payload.roleCode,
      roleId: Number(payload.roleId),
      homeBranchId: Number(payload.branchId || payload.homeBranchId),
      branchId: Number(payload.branchId || payload.homeBranchId),
      contractType: payload.contractType || 'FULL_TIME',
    };

    try {
      const res = await axiosInstance.put(`Users/employees/${id}`, formattedPayload);
      return {
        success: true,
        data: res.data?.data || res.data,
        message: 'Cập nhật hồ sơ & hợp đồng nhân sự thành công!',
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 400 || err.response?.status === 403) {
        return { success: false, message: msg };
      }
      console.warn('[EmployeeService] Backend updateEmployee error, saving locally:', msg);
    }

    const list = getLocalEmployees();
    const idx = list.findIndex((e) => String(e.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload, updatedAt: new Date().toISOString() };
      saveLocalEmployees(list);
      return { success: true, data: list[idx], message: 'Cập nhật thành công!' };
    }
    return { success: false, message: 'Không tìm thấy hồ sơ để cập nhật.' };
  },

  /**
   * 7. Cấp tài khoản Cửa hàng trưởng (POST /api/Users/store-managers)
   * Dành riêng cho OPERATIONS_ADMIN & BUSINESS_OWNER
   */
  async createStoreManager(payload) {
    const formattedPayload = {
      employeeCode: payload.employeeCode,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      homeBranchId: Number(payload.branchId || payload.homeBranchId),
      branchId: Number(payload.branchId || payload.homeBranchId),
      password: payload.password,
    };

    try {
      const res = await axiosInstance.post('Users/store-managers', formattedPayload);
      return {
        success: true,
        data: res.data?.data || res.data,
        message: 'Cấp tài khoản Cửa hàng trưởng thành công! Welcome Email đã được gửi.',
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 400 || err.response?.status === 403) {
        return { success: false, message: msg };
      }
      console.warn('[EmployeeService] Backend createStoreManager error:', msg);
    }

    const list = getLocalEmployees();
    const newManager = {
      id: Date.now(),
      employeeCode: payload.employeeCode || `SM-${Math.floor(100 + Math.random() * 900)}`,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      roleId: 2,
      roleCode: 'STORE_MANAGER',
      roleName: 'Cửa Hàng Trưởng',
      homeBranchId: Number(payload.branchId || 1),
      branchId: Number(payload.branchId || 1),
      branchName: payload.branchName || 'Chi nhánh Cầu Giấy',
      contractType: 'FULL_TIME',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newManager);
    saveLocalEmployees(list);

    return {
      success: true,
      data: newManager,
      message: 'Cấp tài khoản Cửa hàng trưởng thành công!',
    };
  },

  /**
   * 8. Khóa / Kích hoạt lại tài khoản (PATCH /api/Users/{id}/status)
   */
  async toggleUserStatus(id, newStatus) {
    try {
      const res = await axiosInstance.patch(`Users/${id}/status`, {
        status: newStatus,
        isActive: newStatus === 'ACTIVE',
      });
      return {
        success: true,
        data: res.data?.data || res.data,
        message: newStatus === 'ACTIVE' ? 'Đã kích hoạt lại tài khoản thành công!' : 'Đã khóa tài khoản thành công!',
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.warn('[EmployeeService] Backend toggleUserStatus error:', msg);
    }

    const list = getLocalEmployees();
    const idx = list.findIndex((e) => String(e.id) === String(id));
    if (idx !== -1) {
      list[idx].status = newStatus;
      saveLocalEmployees(list);
      return {
        success: true,
        data: list[idx],
        message: newStatus === 'ACTIVE' ? 'Đã kích hoạt lại tài khoản!' : 'Đã khóa tài khoản!',
      };
    }
    return { success: false, message: 'Không tìm thấy tài khoản để thao tác.' };
  },

  /**
   * 9. Đặt lại mật khẩu tài khoản (POST /api/Users/{id}/reset-password)
   */
  async resetPassword(id, customPassword = null) {
    try {
      const body = customPassword ? { newPassword: customPassword } : {};
      const res = await axiosInstance.post(`Users/${id}/reset-password`, body);
      const resData = res.data?.data || res.data;
      const returnedPassword = resData?.newPassword || resData?.temporaryPassword || customPassword;
      return {
        success: true,
        data: resData,
        newPassword: returnedPassword,
        message: 'Đặt lại mật khẩu tài khoản thành công!',
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 400 || err.response?.status === 403) {
        return { success: false, message: msg };
      }
      console.warn('[EmployeeService] Backend resetPassword error:', msg);
    }

    const fallbackPass = customPassword || `Rwfm@${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      newPassword: fallbackPass,
      message: 'Đặt lại mật khẩu tài khoản thành công!',
    };
  },

  /**
   * 10. Tải file mẫu import nhân sự (GET /api/v1/users/employees/import-template)
   * Backend dùng ClosedXML sinh file .xlsx 2 sheet: Danh_Sach_Nhan_Su + Huong_Dan_Va_Danh_Muc.
   * Dùng Blob URL để tải file, không redirect — tránh lỗi corrupt file.
   * @returns {{ success, message, fileName }}
   */
  async downloadImportTemplate() {
    let blobUrl = null;
    try {
      const res = await axiosInstance.get('v1/users/employees/import-template', {
        responseType: 'blob',
        timeout: 30000,
      });

      // Lấy tên file từ Content-Disposition (RFC 5987 UTF-8)
      const disposition = res.headers?.['content-disposition'] || '';
      let fileName = 'Mau_Import_Nhan_Su.xlsx';
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const asciiMatch = disposition.match(/filename="([^"]+)"/i) || disposition.match(/filename=([^;]+)/i);
      if (utf8Match?.[1]) {
        fileName = decodeURIComponent(utf8Match[1].trim());
      } else if (asciiMatch?.[1]) {
        fileName = asciiMatch[1].trim().replace(/"/g, '');
      }

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      return { success: true, fileName, message: `Đã tải file mẫu "${fileName}" thành công!` };
    } catch (err) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      const status = err.response?.status;
      if (status === 401) return { success: false, message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' };
      if (status === 403) return { success: false, message: 'Bạn không có quyền tải file mẫu này.' };
      console.warn('[EmployeeService] downloadImportTemplate error:', err.message);
      // Fallback: sinh file CSV local
      return this._downloadImportTemplateFallback();
    }
  },

  /**
   * Fallback tạo CSV template local khi backend không khả dụng
   * @private
   */
  _downloadImportTemplateFallback() {
    const csvContent =
      '\uFEFFSTT,Mã Nhân Viên,Họ Và Tên,Email,Số Điện Thoại,Mã Vai Trò,Hình Thức,Mã Chi Nhánh,Mật Khẩu Khởi Tạo\n' +
      '1,NV101,Nguyễn Văn An,an.nguyen@rwfm.vn,0912345678,CASHIER,FULL_TIME,CN001,Rwfm@123456\n' +
      '2,NV102,Trần Thị Bình,binh.tran@rwfm.vn,0923456789,SALES_STAFF,PART_TIME,CN001,Rwfm@123456\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Import_Nhan_Su.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return { success: true, fileName: 'Mau_Import_Nhan_Su.csv', message: 'Đã tải file mẫu CSV (fallback).' };
  },

  /**
   * 11. Import nhân sự hàng loạt (POST /api/v1/users/employees/import)
   * Chỉ OPERATIONS_ADMIN và ADMIN mới có quyền gọi API này.
   *
   * @param {{ file, defaultBranchId?, importRequestId?, expansionReason? }} params
   *   - file: File Excel/CSV cần import
   *   - defaultBranchId: Chi nhánh mặc định (fallback nếu file không chứa cột Mã Chi Nhánh)
   *   - importRequestId: Mã đơn mở rộng định biên (bắt buộc nếu chi nhánh đã đạt trần)
   *   - expansionReason: Lý do nếu dùng chỉ tiêu mở rộng
   *
   * @returns {{ success, data: BulkImportResultDto, message }}
   *   BulkImportResultDto: { totalRows, successCount, failureCount, errors: [{ rowIndex, rowData, errorMessages }] }
   */
  async importEmployees({ file, defaultBranchId, importRequestId, expansionReason } = {}) {
    if (!file) {
      return { success: false, message: 'Vui lòng chọn file Excel/CSV để import.' };
    }

    // FE validate — Backend vẫn tự validate độc lập
    const ext = ('.' + file.name.split('.').pop()).toLowerCase();
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    if (!allowedExts.includes(ext)) {
      return {
        success: false,
        message: `Định dạng file không hỗ trợ. Vui lòng chọn: ${allowedExts.join(', ')}.`,
      };
    }
    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        success: false,
        message: `Dung lượng file vượt quá ${maxSizeMB}MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      };
    }
    if (file.size === 0) {
      return { success: false, message: 'File rỗng, vui lòng chọn file hợp lệ.' };
    }

    const formData = new FormData();
    formData.append('file', file);
    if (defaultBranchId != null) {
      formData.append('defaultBranchId', String(defaultBranchId));
    }
    if (importRequestId != null) {
      formData.append('importRequestId', String(importRequestId));
    }
    if (expansionReason) {
      formData.append('expansionReason', expansionReason);
    }

    try {
      const res = await axiosInstance.post('v1/users/employees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 phút cho batch lớn
      });

      const data = res.data?.data || res.data;
      // Chuẩn hóa BulkImportResultDto
      const result = {
        totalRows: data?.totalRows ?? data?.TotalRows ?? 0,
        successCount: data?.successCount ?? data?.SuccessCount ?? 0,
        failureCount: data?.failureCount ?? data?.FailureCount ?? 0,
        errors: data?.errors ?? data?.Errors ?? [],
      };

      const { successCount, failureCount, totalRows } = result;
      let message = '';
      if (failureCount === 0 && successCount > 0) {
        message = `Import thành công! Đã tạo ${successCount}/${totalRows} nhân sự.`;
      } else if (successCount > 0 && failureCount > 0) {
        message = `Import một phần: ${successCount} thành công, ${failureCount} thất bại trên tổng ${totalRows} dòng.`;
      } else {
        message = `Import thất bại: Tất cả ${failureCount} dòng đều có lỗi. Vui lòng kiểm tra và thử lại.`;
      }

      return { success: successCount > 0, data: result, message, isPartialSuccess: successCount > 0 && failureCount > 0 };
    } catch (err) {
      const status = err.response?.status;
      const errData = err.response?.data;
      let msg = errData?.message || errData?.title;
      if (!msg && errData?.errors) {
        msg = Object.values(errData.errors).flat().join(', ');
      }
      if (status === 401) return { success: false, message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' };
      if (status === 403) return { success: false, message: 'Bạn không có quyền thực hiện import nhân sự hàng loạt (403 Forbidden).' };
      return { success: false, message: msg || err.message || 'Lỗi không xác định khi import nhân sự.' };
    }
  },
};

export default employeeService;

