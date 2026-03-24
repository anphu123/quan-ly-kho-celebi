import api from '../api';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  bankAccount?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliersResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSupplierDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  bankAccount?: string;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export const suppliersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<SuppliersResponse> => {
    const { page = 1, limit = 12, search = '' } = params || {};
    const response = await api.get('/suppliers', { params: { page, limit, search } });
    return response.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (dto: CreateSupplierDto): Promise<Supplier> => {
    const response = await api.post('/suppliers', dto);
    return response.data;
  },

  update: async (id: string, dto: UpdateSupplierDto): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
