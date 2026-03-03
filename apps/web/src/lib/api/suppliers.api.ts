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
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<SuppliersResponse>('/suppliers', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  create: async (dto: CreateSupplierDto) => {
    const { data } = await api.post<Supplier>('/suppliers', dto);
    return data;
  },

  update: async (id: string, dto: UpdateSupplierDto) => {
    const { data } = await api.patch<Supplier>(`/suppliers/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/suppliers/${id}`);
  },
};
