import api from '../api';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  managerId?: string;
  manager?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WarehousesResponse {
  data: Warehouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateWarehouseDto {
  name: string;
  address?: string;
  phone?: string;
  managerId?: string;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {}

export const warehousesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<WarehousesResponse> => {
    const { page = 1, limit = 12, search = '' } = params || {};
    const response = await api.get('/warehouses', { params: { page, limit, search } });
    return response.data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  create: async (dto: CreateWarehouseDto): Promise<Warehouse> => {
    const response = await api.post('/warehouses', dto);
    return response.data;
  },

  update: async (id: string, dto: UpdateWarehouseDto): Promise<Warehouse> => {
    const response = await api.put(`/warehouses/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};
