import axiosInstance from '@/config/axios.config';

/**
 * ==============================================================================
 * MODULE: Quản Lý File S3 & Presigned URL
 * SERVICE: file.service.js
 * ==============================================================================
 * Đồng bộ với FilesController (.NET 8):
 * - POST   /api/v1/files/upload-pdf                              : Upload PDF an toàn
 * - GET    /api/v1/files/presigned-view-url?key={s3Key}          : Sinh Presigned URL xem tạm thời
 * - GET    /api/v1/files/view?key={s3Key}                        : Stream file inline (Bearer auth)
 * - GET    /api/v1/files/download?key={s3Key}                    : Tải file xuống (Bearer auth)
 * ==============================================================================
 *
 * SECURITY:
 * - Không dùng window.open(endpoint) trực tiếp với endpoint yêu cầu Bearer Token.
 * - Preview/Download phải dùng Axios → Blob → Blob URL → mở tab.
 * - Ưu tiên Presigned URL (không cần auth header) khi mở PDF.
 * - s3Key phải được encodeURIComponent() khi đưa vào query string.
 * - Sau dùng Blob URL phải revokeObjectURL() để tránh memory leak.
 */

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Xác định icon phù hợp theo tên file
 */
export function getFileIconName(fileName = '') {
  const ext = ('.' + fileName.split('.').pop()).toLowerCase();
  if (ext === '.pdf') return 'file-pdf';
  if (['.xlsx', '.xls'].includes(ext)) return 'file-spreadsheet';
  if (ext === '.csv') return 'file-text';
  return 'file';
}

/**
 * Validate file PDF ở Frontend trước khi upload
 */
export function validatePdfFile(file) {
  if (!file) return { valid: false, error: 'Vui lòng chọn file PDF.' };
  const ext = ('.' + file.name.split('.').pop()).toLowerCase();
  if (ext !== '.pdf') {
    return { valid: false, error: `Chỉ chấp nhận file PDF (.pdf). File bạn chọn có đuôi "${ext}".` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dung lượng file vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File rỗng, vui lòng chọn file PDF hợp lệ.' };
  }
  return { valid: true };
}

/**
 * Validate file Excel/CSV/PDF cho headcount request
 */
export function validateUploadFile(file, allowedExts = ['.xlsx', '.xls', '.csv', '.pdf']) {
  if (!file) return { valid: false, error: 'Vui lòng chọn file đính kèm.' };
  const ext = ('.' + file.name.split('.').pop()).toLowerCase();
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Định dạng không được hỗ trợ. Vui lòng chọn: ${allowedExts.join(', ')}.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dung lượng file vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File rỗng, vui lòng chọn file hợp lệ.' };
  }
  return { valid: true };
}

export const fileService = {
  /**
   * 1. Upload file PDF lên S3
   */
  async uploadPdf(file, folderName = 'uploads') {
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);

    try {
      const res = await axiosInstance.post('v1/files/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      const data = res.data?.data || res.data;
      return { success: true, data, message: 'Upload file PDF thành công!' };
    } catch (err) {
      const errData = err.response?.data;
      let msg = errData?.message || errData?.title;
      if (!msg && errData?.errors) {
        msg = Object.values(errData.errors).flat().join(', ');
      }
      return { success: false, message: msg || err.message || 'Lỗi khi upload file PDF.' };
    }
  },

  /**
   * 2. Lấy Presigned View URL — Không yêu cầu auth khi dùng URL này
   * s3Key phải được encodeURIComponent khi đưa vào query string
   */
  async getPresignedViewUrl(s3Key, expirationMinutes = 30) {
    if (!s3Key) return null;
    try {
      const res = await axiosInstance.get(
        `v1/files/presigned-view-url?key=${encodeURIComponent(s3Key)}&expirationMinutes=${expirationMinutes}`
      );
      const data = res.data?.data || res.data;
      return data?.url || data?.presignedUrl || data?.viewUrl || (typeof data === 'string' ? data : null);
    } catch (err) {
      console.warn('[FileService] getPresignedViewUrl error:', err.message);
      return null;
    }
  },

  /**
   * 3. Mở xem file PDF inline trên tab mới — AN TOÀN VỀ AUTHENTICATION
   *
   * Chiến lược ưu tiên:
   * 1. presignedUrl đã có → window.open (không cần Bearer)
   * 2. viewUrl là AWS presigned URL → window.open
   * 3. s3Key → gọi API lấy presigned mới → window.open
   * 4. Fallback → Axios Blob → Blob URL → tab mới
   */
  async openPdfPreview(fileInfo = {}) {
    const { s3Key, viewUrl, presignedUrl, fileName } = fileInfo;

    // 1. Presigned URL sẵn có
    if (presignedUrl && (presignedUrl.startsWith('https://') || presignedUrl.startsWith('http://'))) {
      window.open(presignedUrl, '_blank', 'noopener,noreferrer');
      return { success: true };
    }

    // 2. viewUrl là AWS presigned
    if (viewUrl && viewUrl.includes('X-Amz-')) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
      return { success: true };
    }

    // 3. Lấy presigned URL từ s3Key
    if (s3Key) {
      const freshPresigned = await this.getPresignedViewUrl(s3Key, 15);
      if (freshPresigned && freshPresigned.startsWith('http')) {
        window.open(freshPresigned, '_blank', 'noopener,noreferrer');
        return { success: true };
      }
    }

    // 4. Fallback: Axios Blob
    const endpoint = s3Key
      ? `v1/files/view?key=${encodeURIComponent(s3Key)}`
      : viewUrl
      ? viewUrl.replace(/^\/api\//, '').replace(/^\//, '')
      : null;

    if (!endpoint) {
      return { success: false, message: 'Không có thông tin file để xem.' };
    }

    return await this._openBlobInNewTab(endpoint, fileName || 'preview.pdf', 'application/pdf');
  },

  /**
   * 4. Download file — Blob URL để giữ auth + tên file
   */
  async downloadFile(fileInfo = {}) {
    const { s3Key, downloadUrl, fileName } = fileInfo;
    let endpoint = null;
    if (s3Key) {
      endpoint = `v1/files/download?key=${encodeURIComponent(s3Key)}`;
    } else if (downloadUrl) {
      endpoint = downloadUrl.replace(/^\/api\//, '').replace(/^\//, '');
    }
    if (!endpoint) {
      return { success: false, message: 'Không có thông tin file để tải về.' };
    }
    return await this._downloadBlob(endpoint, fileName || 'download');
  },

  /**
   * Mở file trên tab mới dạng Blob (inline stream với Bearer auth)
   * @private
   */
  async _openBlobInNewTab(endpoint, fileName, mimeType) {
    let blobUrl = null;
    try {
      const res = await axiosInstance.get(endpoint, {
        responseType: 'blob',
        timeout: 30000,
      });
      const blob = new Blob([res.data], { type: mimeType || res.data.type });
      blobUrl = URL.createObjectURL(blob);

      const newTab = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      // Revoke sau 5 phút tránh memory leak
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5 * 60 * 1000);

      if (!newTab) {
        return {
          success: false,
          message: 'Trình duyệt chặn mở tab mới. Vui lòng cho phép popup và thử lại.',
        };
      }
      return { success: true };
    } catch (err) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return this._handleFileError(err);
    }
  },

  /**
   * Tải file xuống dùng Blob URL — giữ đúng tên file từ Content-Disposition
   * @private
   */
  async _downloadBlob(endpoint, suggestedFileName) {
    let blobUrl = null;
    try {
      const res = await axiosInstance.get(endpoint, {
        responseType: 'blob',
        timeout: 60000,
      });

      // Lấy tên file từ Content-Disposition (ưu tiên RFC 5987 UTF-8)
      const disposition = res.headers?.['content-disposition'] || '';
      let finalFileName = suggestedFileName;
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const asciiMatch = disposition.match(/filename="([^"]+)"/i) || disposition.match(/filename=([^;]+)/i);
      if (utf8Match?.[1]) {
        finalFileName = decodeURIComponent(utf8Match[1].trim());
      } else if (asciiMatch?.[1]) {
        finalFileName = asciiMatch[1].trim().replace(/"/g, '');
      }

      const blob = new Blob([res.data], { type: res.data.type });
      blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      return { success: true, fileName: finalFileName };
    } catch (err) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return this._handleFileError(err);
    }
  },

  /**
   * Chuẩn hóa lỗi HTTP cho file operations
   * @private
   */
  _handleFileError(err) {
    const status = err.response?.status;
    if (status === 401) return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
    if (status === 403) return { success: false, message: 'Bạn không có quyền truy cập tài liệu này (403 Forbidden).' };
    if (status === 404) return { success: false, message: 'Không tìm thấy file trên hệ thống (404).' };
    return { success: false, message: err.message || 'Lỗi không xác định khi thao tác file.' };
  },

  /**
   * Download headcount request file
   */
  async downloadHeadcountFile(reqId, suggestedFileName = 'De_Xuat_Dinh_Bien.xlsx') {
    return await this._downloadBlob(`v1/headcount-requests/${reqId}/download`, suggestedFileName);
  },

  /**
   * Xem headcount request file (PDF inline / Excel download)
   */
  async viewHeadcountFile(req = {}) {
    const { id, viewUrl, s3Key, fileName } = req;
    const ext = ('.' + (fileName || '').split('.').pop()).toLowerCase();

    // Presigned view URL
    if (viewUrl && viewUrl.includes('X-Amz-')) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
      return { success: true };
    }

    if (s3Key) {
      const presigned = await this.getPresignedViewUrl(s3Key, 15);
      if (presigned && presigned.startsWith('http')) {
        window.open(presigned, '_blank', 'noopener,noreferrer');
        return { success: true };
      }
    }

    const mimeType = ext === '.pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (ext === '.pdf') {
      return await this._openBlobInNewTab(
        `v1/headcount-requests/${id}/view`,
        fileName || `headcount-${id}.pdf`,
        mimeType
      );
    } else {
      // Excel/CSV không preview được inline → download
      return await this._downloadBlob(
        `v1/headcount-requests/${id}/download`,
        fileName || `headcount-${id}${ext || '.xlsx'}`
      );
    }
  },
};

export default fileService;
