// Wrapper chung cho mọi Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}
