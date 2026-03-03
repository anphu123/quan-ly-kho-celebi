import api from '../api';

// Types
export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  isTracked: boolean;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: {
      id: string;
      name: string;
    };
    brand: {
      id: string;
      name: string;
    };
    baseUnit: {
      id: string;
      name: string;
      symbol: string;
    };
  };
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  createdAt: string;
  createdById: string;
  product: {
    name: string;
    sku: string;
  };
  warehouse: {
    name: string;
    code: string;
  };
  createdBy: {
    fullName: string;
    email: string;
  };
}

export interface StockMovementsResponse {
  data: StockMovement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockAdjustmentDto {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
  notes?: string;
}

export interface ProductInventory {
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  stockLevels: Array<{
    warehouseId: string;
    warehouse: {
      name: string;
      code: string;
    };
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    minStockLevel: number;
  }>;
  totalQuantity: number;
  totalAvailable: number;
  totalReserved: number;
}

// API Functions
export const inventoryApi = {
  // Get stock levels
  getStockLevels: async (params?: { 
    warehouseId?: string; 
    productId?: string; 
  }) => {
    const { data } = await api.get<StockLevel[]>('/inventory/stock-levels', { params });
    return data;
  },

  // Get stock movements with pagination
  getStockMovements: async (params?: {
    productId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<StockMovementsResponse>('/inventory/stock-movements', { params });
    return data;
  },

  // Get low stock products
  getLowStockProducts: async (warehouseId?: string) => {
    const params = warehouseId ? { warehouseId } : undefined;
    const { data } = await api.get<StockLevel[]>('/inventory/low-stock', { params });
    return data;
  },

  // Get inventory for specific product
  getProductInventory: async (productId: string) => {
    const { data } = await api.get<ProductInventory>(`/inventory/product/${productId}`);
    return data;
  },

  // Adjust stock manually
  adjustStock: async (dto: StockAdjustmentDto) => {
    const { data } = await api.post('/inventory/adjust', dto);
    return data;
  },
};