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
        
        // Đọc quota tùy chỉnh từ localStorage (nếu có từ phân cấp chi nhánh)
        let customQuota = null;
        try {
          const map = JSON.parse(localStorage.getItem('wfm_branch_custom_quotas_v1') || '{}');
          if (map[branchId] != null && Number(map[branchId]) > 0) {
            customQuota = Number(map[branchId]);
          }
        } catch {}

        const backendQuota = Number(raw.effectiveQuota ?? raw.EffectiveQuota ?? raw.staffCount ?? raw.StaffCount ?? 0);
        const fallbackQuota = raw.standardQuota ?? raw.StandardQuota ?? HEADCOUNT_TIER_QUOTAS[resolvedTier] ?? 15;
        const standardQuota = Number(
          customQuota ||
          (backendQuota > 0 ? backendQuota : null) ||
          fallbackQuota
        );
        const effectiveQuota = standardQuota;
        const currentHeadcount = Number(raw.currentHeadcount ?? raw.CurrentHeadcount ?? 0);
        const officialHeadcount = Number(raw.officialHeadcount ?? raw.OfficialHeadcount ?? currentHeadcount);
        const dispatchedInCount = Number(raw.dispatchedInCount ?? raw.DispatchedInCount ?? 0);
        const dispatchedOutCount = Number(raw.dispatchedOutCount ?? raw.DispatchedOutCount ?? 0);
        const actualWorkingCount = Number(raw.actualWorkingCount ?? raw.ActualWorkingCount ?? (currentHeadcount + dispatchedInCount));

        const availableQuotaSlots = Number(
          (raw.availableQuotaSlots != null && raw.availableQuotaSlots >= 0 && !customQuota)
            ? raw.availableQuotaSlots
            : Math.max(0, effectiveQuota - officialHeadcount)
        );
        const isQuotaReached = officialHeadcount >= effectiveQuota;
        const canCreateDirectly = officialHeadcount < effectiveQuota;
        const inactiveCount = Number(raw.inactiveCount ?? raw.InactiveCount ?? 0);

        const canUpgradeTier = raw.canUpgradeTier != null
          ? Boolean(raw.canUpgradeTier)
          : (resolvedTier > 1);
        const nextTier = raw.nextTier ?? (resolvedTier > 1 ? resolvedTier - 1 : null);
        const nextTierQuota = raw.nextTierQuota ?? (resolvedTier === 3 ? 15 : resolvedTier === 2 ? 30 : null);

        const hasActiveStoreManager = Boolean(raw.hasActiveStoreManager ?? raw.HasActiveStoreManager ?? false);
        const activeStoreManagerId = raw.activeStoreManagerId ?? raw.ActiveStoreManagerId ?? null;
        const activeStoreManagerName = raw.activeStoreManagerName ?? raw.ActiveStoreManagerName ?? null;
        const activeStoreManagerCode = raw.activeStoreManagerCode ?? raw.ActiveStoreManagerCode ?? null;

        return {
          success: true,
          data: {
            branchId: Number(branchId),
            branchTier: resolvedTier,
            standardQuota,
            staffCount: backendQuota > 0 ? backendQuota : standardQuota,
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
            hasActiveStoreManager,
            activeStoreManagerId,
            activeStoreManagerName,
            activeStoreManagerCode,
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
    let hasActiveStoreManager = false;
    let activeStoreManagerId = null;
    let activeStoreManagerName = null;
    let activeStoreManagerCode = null;

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
              const roleCode = String(e.roleCode || '').toUpperCase();
              if (roleCode === 'STORE_MANAGER' || Number(e.roleId) === 2) {
                hasActiveStoreManager = true;
                activeStoreManagerId = e.id;
                activeStoreManagerName = e.fullName;
                activeStoreManagerCode = e.employeeCode;
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
        hasActiveStoreManager,
        activeStoreManagerId,
        activeStoreManagerName,
        activeStoreManagerCode,
      },
    };
  },

  /**
   * 2. Lấy thông tin định biên cho toàn bộ danh sách chi nhánh
   */
  async getAllBranchesHeadcountStatus(branchList = []) {
    let customQuotasMap = {};
    try {
      customQuotasMap = JSON.parse(localStorage.getItem('wfm_branch_custom_quotas_v1') || '{}');
    } catch {}

    const list = branchList.length > 0 ? branchList : [
      { id: 1, storeId: 1, name: 'Cửa hàng Tiện lợi Chi nhánh Cầu Giấy', branchTier: 1 },
      { id: 2, storeId: 2, name: 'Cửa hàng Tiện lợi Chi nhánh Lê Văn Việt', branchTier: 1 },
      { id: 3, storeId: 3, name: 'Cửa hàng Tiện lợi Chi nhánh Hoàn Kiếm', branchTier: 2 },
      { id: 4, storeId: 4, name: 'Siêu Thị FPT', branchTier: 2 },
    ];

    try {
      const results = await Promise.all(
        list.map(async (b) => {
          const bId = Number(b.id || b.storeId);
          const tier = Number(b.branchTier || b.tier || (bId === 1 || bId === 2 ? 1 : 2));
          const res = await this.getBranchHeadcountStatus(bId, tier);
          const quotaFromMap = customQuotasMap[bId] ? Number(customQuotasMap[bId]) : null;
          const quotaFromBranch = Number(b.staffCount || b.targetStaffCount || 0);

          let finalStatus = res.success ? { ...res.data } : {};
          const finalQuota = quotaFromMap || (quotaFromBranch > 0 ? quotaFromBranch : null) || finalStatus.effectiveQuota || finalStatus.standardQuota;
          if (finalQuota) {
            const official = Number(finalStatus.officialHeadcount ?? finalStatus.currentHeadcount ?? 0);
            finalStatus.standardQuota = finalQuota;
            finalStatus.effectiveQuota = finalQuota;
            finalStatus.staffCount = finalQuota;
            finalStatus.availableQuotaSlots = Math.max(0, finalQuota - official);
            finalStatus.isQuotaReached = official >= finalQuota;
            finalStatus.isStandardQuotaReached = official >= finalQuota;
            finalStatus.canCreateDirectly = official < finalQuota;
          }

          return {
            branchId: Number(bId),
            branchName: b.name || `Chi nhánh #${bId}`,
            branchTier: tier,
            ...finalStatus,
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
