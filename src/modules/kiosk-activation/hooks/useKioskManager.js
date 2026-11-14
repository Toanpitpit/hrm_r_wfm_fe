import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStoreKiosks, createKioskCode, deactivateKiosk } from '../services/kiosk.service';

/**
 * Custom Hook quản lý dữ liệu trạm Kiosk và mã kích hoạt cho Store Manager.
 * @param {number|string} [initialStoreId=1] - ID cửa hàng của Manager
 */
export function useKioskManager(initialStoreId = 1) {
  const storedUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []);

  const storeId = storedUser?.storeId || initialStoreId;

  const [kiosks, setKiosks] = useState([]);
  const [activeCodes, setActiveCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeDisplayModalOpen, setIsCodeDisplayModalOpen] = useState(false);
  const [latestCodeData, setLatestCodeData] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  /**
   * Tải danh sách trạm Kiosk của cửa hàng
   */
  const fetchKiosks = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getStoreKiosks(storeId);
      if (res.success && Array.isArray(res.data)) {
        setKiosks(res.data);
      } else {
        setKiosks([]);
        if (res.message) setError(res.message);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách Kiosk:', err);
      // Mock data nếu backend dev chưa bật server
      setKiosks([
        {
          kioskId: 101,
          storeId: Number(storeId),
          storeCode: 'CH01',
          storeName: 'Chi nhánh Cầu Giấy',
          kioskCode: 'CH01-POS01',
          kioskName: 'Kiosk Cổng Chính',
          deviceToken: 'ksk_tok_sample_9a8b7c6d',
          status: 'ACTIVE',
          activatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          kioskId: 102,
          storeId: Number(storeId),
          storeCode: 'CH01',
          storeName: 'Chi nhánh Cầu Giấy',
          kioskCode: 'CH01-POS02',
          kioskName: 'Kiosk Quầy Thu Ngân 2',
          deviceToken: 'ksk_tok_sample_1e2f3a4b',
          status: 'ACTIVE',
          activatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchKiosks();
  }, [fetchKiosks]);

  /**
   * Yêu cầu Backend tạo mã kích hoạt OTP Kiosk mới
   * @param {string} kioskName - Tên gợi nhớ cho máy Kiosk
   */
  const handleCreateCode = useCallback(
    async (kioskName) => {
      setGenerating(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const res = await createKioskCode({ storeId, kioskName });
        if (res.success && res.data) {
          const newCodeData = res.data;
          setLatestCodeData(newCodeData);
          setActiveCodes((prev) => [newCodeData, ...prev]);
          setIsCreateModalOpen(false);
          setIsCodeDisplayModalOpen(true);
          setSuccessMessage(res.message || 'Tạo mã kích hoạt thành công!');
          // Tải lại danh sách Kiosk
          fetchKiosks();
          return newCodeData;
        } else {
          setError(res.message || 'Tạo mã kích hoạt thất bại.');
        }
      } catch (err) {
        console.error('Lỗi khi tạo mã Kiosk:', err);
        // Fallback mock khi offline/dev server chưa có
        const mockCode = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
        const mockData = {
          activationCodeId: Date.now(),
          storeId: Number(storeId),
          kioskName: kioskName || 'Trạm Kiosk Mới',
          code: mockCode,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          isUsed: false,
        };
        setLatestCodeData(mockData);
        setActiveCodes((prev) => [mockData, ...prev]);
        setIsCreateModalOpen(false);
        setIsCodeDisplayModalOpen(true);
        setSuccessMessage('Đã tạo mã kích hoạt demo (Dev mode)!');
        return mockData;
      } finally {
        setGenerating(false);
      }
    },
    [storeId, fetchKiosks]
  );

  /**
   * Danh sách Kiosk sau khi lọc theo từ khóa và trạng thái
   */
  const filteredKiosks = useMemo(() => {
    return kiosks.filter((kiosk) => {
      const cleanSearch = (searchTerm || '').trim().toLowerCase();
      const matchSearch =
        !cleanSearch ||
        (kiosk.kioskName && kiosk.kioskName.toLowerCase().includes(cleanSearch)) ||
        (kiosk.kioskCode && kiosk.kioskCode.toLowerCase().includes(cleanSearch)) ||
        (kiosk.deviceToken && kiosk.deviceToken.toLowerCase().includes(cleanSearch)) ||
        (kiosk.storeName && kiosk.storeName.toLowerCase().includes(cleanSearch));

      const kioskStatus = (kiosk.status || '').toUpperCase();
      const currentFilter = (statusFilter || 'ALL').toUpperCase();

      const matchStatus =
        currentFilter === 'ALL' ||
        (currentFilter === 'ACTIVE' && (kioskStatus === 'ACTIVE' || kioskStatus === 'ONLINE')) ||
        (currentFilter === 'INACTIVE' && (kioskStatus === 'INACTIVE' || kioskStatus === 'OFFLINE'));

      return matchSearch && matchStatus;
    });
  }, [kiosks, searchTerm, statusFilter]);

  /**
   * Thống kê tổng hợp
   */
  const stats = useMemo(() => {
    const totalActive = kiosks.filter((k) => k.status === 'ACTIVE').length;
    const activeCodeCount = activeCodes.filter((c) => !c.isUsed && new Date(c.expiresAt) > new Date()).length;
    return {
      totalKiosks: kiosks.length,
      totalActive,
      activeCodeCount,
      storeCode: kiosks[0]?.storeCode || 'CH01',
    };
  }, [kiosks, activeCodes]);

  /**
   * Hủy ghép nối / Dừng hoạt động trạm Kiosk
   */
  const handleDeactivateKiosk = useCallback(
    async (kioskId) => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const res = await deactivateKiosk(kioskId);
        if (res.success) {
          setSuccessMessage(res.message || 'Đã hủy ghép nối trạm Kiosk thành công!');
          await fetchKiosks();
          return true;
        } else {
          setError(res.message || 'Không thể hủy ghép nối trạm Kiosk.');
          return false;
        }
      } catch (err) {
        console.error('Lỗi khi hủy ghép nối Kiosk:', err);
        setError('Không thể kết nối máy chủ để hủy ghép nối.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchKiosks]
  );

  return {
    storeId,
    kiosks: filteredKiosks,
    rawKiosksCount: kiosks.length,
    activeCodes,
    loading,
    generating,
    error,
    successMessage,
    stats,

    // Modal controls
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCodeDisplayModalOpen,
    setIsCodeDisplayModalOpen,
    latestCodeData,

    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,

    // Actions
    fetchKiosks,
    handleCreateCode,
    handleDeactivateKiosk,
  };
}

export default useKioskManager;
