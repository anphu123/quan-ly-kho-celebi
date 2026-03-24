import api from '../lib/api';

// ===========================
// TYPES (matching backend DTOs)
// ===========================

export interface InboundRequest {
  id: string;
  code: string;
  warehouseId: string;
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  supplierType: 'CUSTOMER_TRADE_IN' | 'INTERNAL_RETURN' | 'LIQUIDATION' | 'INDIVIDUAL_SELLER';
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  expectedDate?: string;
  receivedDate?: string;
  totalEstimatedValue?: number;
  totalActualValue?: number;
  notes?: string;
  receivedById?: string;

  warehouse: {
    id: string;
    code: string;
    name: string;
  };

  receivedBy?: {
    id: string;
    fullName: string;
    email: string;
  };

  items: InboundItem[];

  createdAt: string;
  updatedAt: string;
}

export interface InboundItem {
  id: string;
  inboundRequestId: string;
  productTemplateId?: string;
  categoryId: string;
  brandId?: string;
  serialNumber?: string;
  modelName: string;
  condition?: string;
  estimatedValue?: number;
  notes?: string;
  sourceCustomerName?: string;
  sourceCustomerPhone?: string;
  sourceCustomerAddress?: string;
  sourceCustomerIdCard?: string;
  idCardIssueDate?: string;
  idCardIssuePlace?: string;
  bankAccount?: string;
  bankName?: string;
  contractNumber?: string;
  purchaseDate?: string;
  employeeName?: string;
  otherCosts?: number;
  topUp?: number;
  repairCost?: number;
  imageUrl?: string;
  deviceImages?: string;   // JSON array string
  cccdFrontUrl?: string;
  cccdBackUrl?: string;

  isReceived: boolean;
  receivedAt?: string;
  serialItemId?: string;

  category: {
    id: string;
    name: string;
    code: string;
  };

  brand?: {
    id: string;
    name: string;
    code: string;
  };

  productTemplate?: {
    id: string;
    sku: string;
    name: string;
  };

  serialItem?: {
    id: string;
    serialNumber?: string;
    internalCode: string;
    status: string;
  };
}

export interface CreateInboundRequest {
  warehouseId: string;
  supplierType: 'CUSTOMER_TRADE_IN' | 'INTERNAL_RETURN' | 'LIQUIDATION' | 'INDIVIDUAL_SELLER';
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  expectedDate?: string;
  totalEstimatedValue?: number;
  notes?: string;
  items: CreateInboundItem[];
}

export interface CreateInboundItem {
  productTemplateId?: string;
  categoryId: string;
  brandId?: string;
  serialNumber?: string;
  modelName: string;
  condition?: string;
  estimatedValue?: number;
  notes?: string;
  sourceCustomerName?: string;
  sourceCustomerPhone?: string;
  sourceCustomerAddress?: string;
  sourceCustomerIdCard?: string;
  idCardIssueDate?: string;
  idCardIssuePlace?: string;
  bankAccount?: string;
  bankName?: string;
  contractNumber?: string;
  purchaseDate?: string;
  employeeName?: string;
  otherCosts?: number;
  topUp?: number;
  repairCost?: number;
  imageUrl?: string;
  deviceImages?: string;
  cccdFrontUrl?: string;
  cccdBackUrl?: string;
}

export interface ReceiveItem {
  inboundItemId: string;
  serialNumber?: string;
  condition?: string;
  purchasePrice: number;
  binLocation?: string;
  notes?: string;
  customAttributes?: Array<{ attributeId: string; value: any }>;
}

export interface CompleteInbound {
  inboundRequestId: string;
  items: ReceiveItem[];
  totalActualValue?: number;
  notes?: string;
}

export interface InboundStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  totalItemsReceived: number;
  totalValueReceived: number;
}

export interface InboundQuery {
  status?: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  supplierType?: 'CUSTOMER_TRADE_IN' | 'INTERNAL_RETURN' | 'LIQUIDATION' | 'INDIVIDUAL_SELLER';
  warehouseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// API CLIENT
// ===========================

export const inboundApi = {
  // ===========================
  // INBOUND REQUESTS
  // ===========================

  async createRequest(data: CreateInboundRequest): Promise<InboundRequest> {
    const response = await api.post('/inbound/requests', data);
    return response.data;
  },

  async getAllRequests(query?: InboundQuery): Promise<PaginatedResponse<InboundRequest>> {
    const params = new URLSearchParams();

    if (query?.status) params.append('status', query.status);
    if (query?.supplierType) params.append('supplierType', query.supplierType);
    if (query?.warehouseId) params.append('warehouseId', query.warehouseId);
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await api.get(`/inbound/requests?${params.toString()}`);
    return response.data;
  },

  async getRequestById(id: string): Promise<InboundRequest> {
    const response = await api.get(`/inbound/requests/${id}`);
    return response.data;
  },

  async updateRequest(id: string, data: Partial<InboundRequest>): Promise<InboundRequest> {
    const response = await api.put(`/inbound/requests/${id}`, data);
    return response.data;
  },

  async deleteRequest(id: string): Promise<void> {
    await api.delete(`/inbound/requests/${id}`);
  },

  // ===========================
  // RECEIVING WORKFLOW  
  // ===========================

  async startReceiving(requestId: string): Promise<InboundRequest> {
    const response = await api.post(`/inbound/requests/${requestId}/start-receiving`);
    return response.data;
  },

  async receiveItems(requestId: string): Promise<InboundRequest> {
    return this.startReceiving(requestId);
  },

  async completeInbound(data: CompleteInbound): Promise<InboundRequest> {
    const response = await api.post('/inbound/complete', data);
    return response.data;
  },

  async completeQC(requestId: string, notes?: string): Promise<InboundRequest> {
    const response = await api.post(`/inbound/requests/${requestId}/complete-qc`, { notes });
    return response.data;
  },

  // ===========================
  // ITEMS MANAGEMENT
  // ===========================

  async updateItem(itemId: string, data: Partial<InboundItem>): Promise<InboundItem> {
    const response = await api.put(`/inbound/items/${itemId}`, data);
    return response.data;
  },

  async deleteItem(itemId: string): Promise<void> {
    await api.delete(`/inbound/items/${itemId}`);
  },

  // ===========================
  // STATISTICS & ANALYTICS
  // ===========================

  async getStats(warehouseId?: string): Promise<InboundStats> {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
    const response = await api.get(`/inbound/stats${params}`);
    return response.data;
  },

  async getPendingRequests(): Promise<PaginatedResponse<InboundRequest>> {
    const response = await api.get('/inbound/requests/pending/summary');
    return response.data;
  },

  async getInProgressRequests(): Promise<PaginatedResponse<InboundRequest>> {
    const response = await api.get('/inbound/requests/in-progress/summary');
    return response.data;
  },

  async getRecentActivity(): Promise<PaginatedResponse<InboundRequest>> {
    const response = await api.get('/inbound/recent');
    return response.data;
  },

  async getRecentSuppliers(): Promise<Array<{
    name: string;
    phone?: string;
    email?: string;
    type: string;
  }>> {
    const response = await api.get('/inbound/suppliers/recent');
    return response.data;
  },

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  getStatusColor(status: string): string {
    const colors = {
      REQUESTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  getStatusBadge(status: string): string {
    const badges = {
      REQUESTED: '📥 Yêu cầu',
      IN_PROGRESS: '⏳ Đang nhận',
      COMPLETED: '✅ Hoàn thành',
      CANCELLED: '❌ Hủy bỏ',
    };
    return badges[status as keyof typeof badges] || status;
  },

  getSupplierTypeLabel(type: string): string {
    const labels = {
      CUSTOMER_TRADE_IN: '🔄 Khách đổi cũ',
      INTERNAL_RETURN: '↩️ Trả hàng nội bộ',
      LIQUIDATION: '📦 Thanh lý doanh nghiệp',
      INDIVIDUAL_SELLER: '🏪 Người bán lẻ',
    };
    return labels[type as keyof typeof labels] || type;
  },

  formatCurrency(amount?: number): string {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  },

  formatDate(date?: string): string {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
};