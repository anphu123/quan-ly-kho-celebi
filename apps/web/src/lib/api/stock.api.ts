import api from '../api';

export interface StockLevel {
  id: string;
  productTemplateId: string;
  warehouseId: string;
  grade: string | null;
  
  // Quantities by status
  physicalQty: number;
  incomingQty: number;
  qcInProgressQty: number;
  availableQty: number;
  reservedQty: number;
  refurbishingQty: number;
  damagedQty: number;
  returnedQty: number;
  
  // Values
  averageCost: number;
  totalValue: number;
  
  // Thresholds
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  
  // Relations
  productTemplate: {
    id: string;
    sku: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
    brand: {
      id: string;
      name: string;
    };
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
  
  lastUpdated: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productTemplateId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT' | 'RESERVE' | 'UNRESERVE';
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  serialItemId: string | null;
  unitCost: number;
  totalValue: number;
  balanceBefore: number;
  balanceAfter: number;
  notes: string | null;
  createdAt: string;
  
  productTemplate: {
    id: string;
    sku: string;
    name: string;
    category: { name: string };
    brand: { name: string };
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface InboundBySourceReport {
  summary: Array<{
    source: string;
    quantity: number;
    totalValue: number;
    items: StockMovement[];
  }>;
  total: {
    quantity: number;
    value: number;
  };
}

export const stockApi = {
  // Get all stock levels
  getStockLevels: async (warehouseId?: string): Promise<StockLevel[]> => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get('/stock/levels', { params });
    return response.data;
  },

  // Get stock levels by product
  getStockLevelsByProduct: async (productId: string): Promise<StockLevel[]> => {
    const response = await api.get(`/stock/levels/product/${productId}`);
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (warehouseId?: string): Promise<StockLevel[]> => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get('/stock/low-stock', { params });
    return response.data;
  },

  // Get stock movements
  getStockMovements: async (filters: {
    productId?: string;
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<StockMovement[]> => {
    const response = await api.get('/stock/movements', { params: filters });
    return response.data;
  },

  // Get inbound by source report
  getInboundBySource: async (filters: {
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<InboundBySourceReport> => {
    const response = await api.get('/stock/reports/inbound-by-source', { params: filters });
    return response.data;
  },

  // Recalculate stock level
  recalculateStockLevel: async (
    productId: string,
    warehouseId: string,
    grade?: string,
  ): Promise<StockLevel> => {
    const params = grade ? { grade } : {};
    const response = await api.post(
      `/stock/recalculate/${productId}/${warehouseId}`,
      {},
      { params },
    );
    return response.data;
  },

  // Format currency
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  },

  // Get grade label
  getGradeLabel: (grade: string | null): string => {
    if (!grade) return 'Chưa phân loại';
    const labels: Record<string, string> = {
      GRADE_A_NEW: 'A+ (Như mới)',
      GRADE_A: 'A (Rất đẹp)',
      GRADE_B_PLUS: 'B+ (Đẹp)',
      GRADE_B: 'B (Khá)',
      GRADE_C_PLUS: 'C+ (Trung bình)',
      GRADE_C: 'C (Cần sửa)',
      GRADE_D: 'D (Hỏng)',
    };
    return labels[grade] || grade;
  },

  // Get grade color
  getGradeColor: (grade: string | null): string => {
    if (!grade) return '#94a3b8';
    const colors: Record<string, string> = {
      GRADE_A_NEW: '#10b981',
      GRADE_A: '#059669',
      GRADE_B_PLUS: '#3b82f6',
      GRADE_B: '#6366f1',
      GRADE_C_PLUS: '#f59e0b',
      GRADE_C: '#f97316',
      GRADE_D: '#ef4444',
    };
    return colors[grade] || '#94a3b8';
  },
};
