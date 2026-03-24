import api from '../api';

// Types - Serial-based system
export type SerialStatus =
  | 'INCOMING'
  | 'QC_IN_PROGRESS'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'REFURBISHING'
  | 'DAMAGED'
  | 'RETURNED'
  | 'DISPOSED';

export type SerialGrade =
  | 'GRADE_A_NEW'
  | 'GRADE_A'
  | 'GRADE_B_PLUS'
  | 'GRADE_B'
  | 'GRADE_C_PLUS'
  | 'GRADE_C'
  | 'GRADE_D';

export interface SerialItem {
  id: string;
  productTemplateId: string;
  serialNumber: string | null;
  internalCode: string;
  source: string | null;
  purchasePrice: number;
  purchaseDate: string | null;
  purchaseBatch: string | null;
  status: SerialStatus;
  grade: SerialGrade | null;
  conditionNotes: string | null;
  currentCostPrice: number;
  suggestedPrice: number;
  warehouseId: string;
  binLocation: string | null;
  productTemplate: {
    id: string;
    name: string;
    sku: string;
    category: { id: string; name: string };
    brand: { id: string; name: string };
  };
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SerialItemsResponse {
  data: SerialItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SerialItemStats {
  totalItems: number;
  byStatus: Record<SerialStatus, number>;
  byGrade: Record<string, number>;
  totalCostValue: number;
  totalSuggestedValue: number;
  averageCostPrice: number;
  averageSuggestedPrice: number;
}

// Keep legacy type alias for backwards compat with InventoryPage
export type StockLevel = SerialItem;

export interface StockAdjustmentDto {
  serialItemId: string;
  status: SerialStatus;
  notes?: string;
  binLocation?: string;
}

export const STATUS_LABELS: Record<SerialStatus, string> = {
  INCOMING: 'Mới nhập (Chờ QC)',
  QC_IN_PROGRESS: 'Đang kiểm định',
  AVAILABLE: 'Sẵn sàng bán',
  RESERVED: 'Đã đặt cọc',
  SOLD: 'Đã bán',
  REFURBISHING: 'Đang sửa chữa',
  DAMAGED: 'Hỏng',
  RETURNED: 'Hàng trả về',
  DISPOSED: 'Đã thanh lý',
};

export const IN_STOCK_STATUSES: SerialStatus[] = [
  'INCOMING',
  'QC_IN_PROGRESS',
  'AVAILABLE',
  'RESERVED',
  'REFURBISHING',
];

// API Functions
export const inventoryApi = {
  // Get all serial items (= tồn kho)
  getStockLevels: async (params?: {
    warehouseId?: string;
    productId?: string;
    status?: SerialStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    // Map to serial-items API, filter to in-stock statuses by default
    const { data } = await api.get<SerialItemsResponse>('/serial-items', {
      params: {
        ...params,
        limit: Math.min(params?.limit || 100, 100),
      },
    });
    // Filter to in-stock items only (exclude SOLD, DISPOSED, DAMAGED)
    const inStock = data.data.filter(item =>
      IN_STOCK_STATUSES.includes(item.status)
    );
    return inStock;
  },

  // Get serial items with all filters (for advanced inventory view)
  getAllSerialItems: async (params?: {
    warehouseId?: string;
    status?: SerialStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<SerialItemsResponse>('/serial-items', { params });
    return data;
  },

  // Get inventory stats
  getStats: async (warehouseId?: string) => {
    const { data } = await api.get<SerialItemStats>('/serial-items/stats', {
      params: warehouseId ? { warehouseId } : undefined,
    });
    return data;
  },

  // Get low stock / items needing attention (INCOMING items waiting QC)
  getLowStockProducts: async (_warehouseId?: string) => {
    const { data } = await api.get<SerialItemsResponse>('/serial-items', {
      params: { status: 'INCOMING', limit: 50 },
    });
    return data.data;
  },

  // Get single serial item with full details
  getById: async (id: string) => {
    const { data } = await api.get(`/serial-items/${id}`);
    return data;
  },

  // Update serial item status (replaces adjustStock)
  adjustStock: async (dto: StockAdjustmentDto) => {
    const { data } = await api.put(`/serial-items/${dto.serialItemId}/status`, {
      status: dto.status,
      notes: dto.notes,
      binLocation: dto.binLocation,
    });
    return data;
  },
};