/**
 * Standard API Response format from Backend ASP.NET Core
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[] | null;
  timestamp?: string;
}

export interface PaginationMeta {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
