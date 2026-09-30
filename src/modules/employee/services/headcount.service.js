import axiosInstance from '@/config/axios.config';
import fileService, { getFileIconName } from '@/shared/services/file.service';

/**
 * ==============================================================================
 * MODULE: Quản Lý Định Biên Chi Nhánh (Effective Quota)
 * SERVICE: headcount.service.js
 * ==============================================================================
 * Đồng bộ với BranchesController (.NET 8) sau khi loại bỏ luồng đề xuất cũ:
 * - GET /v1/headcount-requests/branch/:branchId/status  (alias route — tương thích ngược)
 * - GET /v1/branches/:id/headcount-status               (route mới)
 *
 * Cơ chế Effective Quota:
 *   EffectiveQuota = branch.StaffCount > 0 ? branch.StaffCount : TierQuota
 * ==============================================================================
 */

// Định biên chuẩn theo phân cấp chi nhánh (HeadcountConstants — vẫn dùng cho fallback)
export const HEADCOUNT_TIER_QUOTAS = {
  1: 30, // Tier 1 (Đại siêu thị / Flagship)
  2: 15, // Tier 2 (Siêu thị tiêu chuẩn)
  3: 8,  // Tier 3 (Cửa hàng tiện lợi mini)
};

export const headcountService = {
  /**
   * 1. Lấy thông tin định biên hiệu dụng của chi nhánh
   *    GET /v1/headcount-requests/branch/{branchId}/status  (alias tương thích ngược)
   *    Trả về: standardQuota, staffCount, effectiveQuota, currentHeadcount,
   *            availableQuotaSlots, isQuotaReached, canCreateDirectly
   */
  async getBranchHeadcountStatus(branchId, branchTier = 2) {
    try {
      const res = await axiosInstance.get(`v1/headcount-requests/branch/${branchId}/status`);
      const raw = res.data?.data || res.data;

      if (raw && (raw.currentHeadcount !== undefined || raw.CurrentHeadcount !== undefined || raw.standardQuota !== undefined)) {
        const resolvedTier = Number(
          raw.branchTier ?? raw.BranchTier ?? raw.branchTierValue ?? raw.BranchTierValue ?? branchTier
        );
        const standardQuota = Number(
          raw.standardQuota ?? raw.StandardQuota ?? HEADCOUNT_TIER_QUOTAS[resolvedTier] ?? 15
        );
        // Định biên theo Tier là cố định: Tier 1 = 30, Tier 2 = 15, Tier 3 = 8
        const effectiveQuota = standardQuota;
        const currentHeadcount = Number(raw.currentHeadcount ?? raw.CurrentHeadcount ?? 0);
        const officialHeadcount = Number(raw.officialHeadcount ?? raw.OfficialHeadcount ?? currentHeadcount);
        const dispatchedInCount = Number(raw.dispatchedInCount ?? raw.DispatchedInCount ?? 0);
        const dispatchedOutCount = Number(raw.dispatchedOutCount ?? raw.DispatchedOutCount ?? 0);
        const actualWorkingCount = Number(raw.actualWorkingCount ?? raw.ActualWorkingCount ?? (currentHeadcount + dispatchedInCount));

        const availableQuotaSlots = Number(
          (raw.availableQuotaSlots != null && raw.availableQuotaSlots >= 0) ? raw.availableQuotaSlots :
          (raw.AvailableQuotaSlots != null && raw.AvailableQuotaSlots >= 0) ? raw.AvailableQuotaSlots :
          Math.max(0, effectiveQuota - officialHeadcount)
        );
        const isQuotaReached = raw.isQuotaReached != null
          ? Boolean(raw.isQuotaReached)
          : raw.IsQuotaReached != null
          ? Boolean(raw.IsQuotaReached)
          : (officialHeadcount >= effectiveQuota);
        const canCreateDirectly = raw.canCreateDirectly != null
          ? Boolean(raw.canCreateDirectly)
          : raw.CanCreateDirectly != null
          ? Boolean(raw.CanCreateDirectly)
          : (officialHeadcount < effectiveQuota);
        const inactiveCount = Number(raw.inactiveCount ?? raw.InactiveCount ?? 0);

        const canUpgradeTier = raw.canUpgradeTier != null
          ? Boolean(raw.canUpgradeTier)
          : (resolvedTier > 1);
        const nextTier = raw.nextTier ?? (resolvedTier > 1 ? resolvedTier - 1 : null);
        const nextTierQuota = raw.nextTierQuota ?? (resolvedTier === 3 ? 15 : resolvedTier === 2 ? 30 : null);

        return {
          success: true,
          data: {
            branchId: Number(branchId),
            branchTier: resolvedTier,
            standardQuota,
            staffCount: 0,
            effectiveQuota,
            currentHeadcount: officialHeadcount,
            officialHeadcount,
            dispatchedInCount,
            dispatchedOutCount,
            actualWorkingCount,
            inactiveCount,
            availableQuotaSlots,
            isQuotaReached,
            isStandardQuotaReached: isQuotaReached,
            canCreateDirectly,
            canUpgradeTier,
            nextTier,
            nextTierQuota,
            additionalApprovedQuota: 0,
            totalAvailableSlots: availableQuotaSlots,
            availableRequests: [],
          },
        };
      }
    } catch (err) {
      console.warn('[HeadcountService] Backend getBranchHeadcountStatus fallback:', err.message);
    }

    // Fallback local — tính toán dựa trên Tier chuẩn
    const resolvedTier = Number(branchTier || 2);
    const standardQuota = HEADCOUNT_TIER_QUOTAS[resolvedTier] || 15;
    const effectiveQuota = standardQuota;

    let officialActiveCount = 0;
    let dispatchedInCount = 0;
    let dispatchedOutCount = 0;
    let inactiveCount = 0;
    try {
      const rawEmp = localStorage.getItem('wfm_employees_data_v2');
      if (rawEmp) {
        const employees = JSON.parse(rawEmp);
        const targetId = String(branchId);
        employees.forEach((e) => {
          const homeId = String(e.homeBranchId || e.branchId || '');
          const origId = e.originalHomeBranchId ? String(e.originalHomeBranchId) : null;
          const isOfficial = origId ? origId === targetId : homeId === targetId;

          if (isOfficial) {
            if (e.status === 'INACTIVE') {
              inactiveCount++;
            } else {
              officialActiveCount++;
              if (origId && origId === targetId && homeId !== targetId) {
                dispatchedOutCount++;
              }
            }
          } else if (homeId === targetId && origId && origId !== targetId && e.status !== 'INACTIVE') {
            dispatchedInCount++;
          }
        });
      }
    } catch {
      // ignore
    }

    const availableQuotaSlots = Math.max(0, effectiveQuota - officialActiveCount);
    const isQuotaReached = officialActiveCount >= effectiveQuota;
    const actualWorkingCount = officialActiveCount - dispatchedOutCount + dispatchedInCount;

    return {
      success: true,
      data: {
        branchId: Number(branchId),
        branchTier: resolvedTier,
        standardQuota,
        staffCount: 0,
        effectiveQuota,
        currentHeadcount: officialActiveCount,
        officialHeadcount: officialActiveCount,
        dispatchedInCount,
        dispatchedOutCount,
        actualWorkingCount,
        inactiveCount,
        availableQuotaSlots,
        isQuotaReached,
        isStandardQuotaReached: isQuotaReached,
        canCreateDirectly: !isQuotaReached,
        canUpgradeTier: resolvedTier > 1,
        nextTier: resolvedTier > 1 ? resolvedTier - 1 : null,
        nextTierQuota: resolvedTier === 3 ? 15 : resolvedTier === 2 ? 30 : null,
        additionalApprovedQuota: 0,
        totalAvailableSlots: availableQuotaSlots,
        availableRequests: [],
      },
    };
  },

  /**
   * 2. Lấy thông tin định biên cho toàn bộ danh sách chi nhánh
   */
  async getAllBranchesHeadcountStatus(branchList = []) {
    const list = branchList.length > 0 ? branchList : [
      { id: 1, storeId: 1, name: 'Chi nhánh Cầu Giấy (Flagship)', branchTier: 1 },
      { id: 2, storeId: 2, name: 'Chi nhánh Lê Văn Việt', branchTier: 2 },
      { id: 3, storeId: 3, name: 'Chi nhánh Hoàn Kiếm', branchTier: 2 },
    ];

    try {
      const results = await Promise.all(
        list.map(async (b) => {
          const bId = b.id || b.storeId;
          const tier = b.branchTier || b.tier || (bId === 1 ? 1 : 2);
          const res = await this.getBranchHeadcountStatus(bId, tier);
          return {
            branchId: Number(bId),
            branchName: b.name || `Chi nhánh #${bId}`,
            branchTier: tier,
            ...(res.success ? res.data : {}),
          };
        })
      );
      return { success: true, data: results };
    } catch (err) {
      console.warn('[HeadcountService] getAllBranchesHeadcountStatus error:', err);
      return { success: false, data: [] };
    }
  },

  /**
   * 3. Nâng cấp phân cấp Tier chi nhánh khi đạt định trần kịch biên
   *    Tier 3 (8 nhân sự) -> Tier 2 (15 nhân sự) -> Tier 1 (30 nhân sự kịch trần)
   */
  async upgradeBranchTier(branchId) {
    try {
      const res = await axiosInstance.post(`v1/branches/${branchId}/upgrade-tier`);
      return {
        success: true,
        data: res.data?.data || res.data,
        message: res.data?.message || 'Nâng cấp phân cấp chi nhánh thành công.',
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể nâng Tier chi nhánh';
      return { success: false, message: msg };
    }
  },

  /**
   * 4. Lấy icon tương ứng với file đính kèm đề xuất
   */
  getFileIcon(req) {
    return getFileIconName(req?.fileName || req?.fileAttachment || req?.attachmentFileName);
  },

  /**
   * 5. Mở xem trực tiếp tài liệu đề xuất (PDF inline tab mới hoặc Presigned URL)
   */
  async viewRequestFile(req) {
    return await fileService.openPdfPreview({
      s3Key: req?.s3Key || req?.fileAttachment || req?.attachmentKey,
      viewUrl: req?.viewUrl || req?.presignedUrl,
      fileName: req?.fileName || req?.attachmentFileName,
    });
  },

  /**
   * 6. Tải file đính kèm đề xuất về máy
   */
  async downloadRequestFile(req) {
    return await fileService.downloadFile({
      s3Key: req?.s3Key || req?.fileAttachment || req?.attachmentKey,
      downloadUrl: req?.downloadUrl,
      fileName: req?.fileName || req?.attachmentFileName,
    });
  },
};

export default headcountService;
