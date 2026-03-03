import api from '../api';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
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
  code: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {}

export const warehousesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<WarehousesResponse>('/warehouses', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Warehouse>(`/warehouses/${id}`);
    return data;
  },

  create: async (dto: CreateWarehouseDto) => {
    const { data } = await api.post<Warehouse>('/warehouses', dto);
    return data;
  },

  update: async (id: string, dto: UpdateWarehouseDto) => {
    const { data } = await api.patch<Warehouse>(`/warehouses/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/warehouses/${id}`);
  },
};
