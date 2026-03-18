import api from '../api';

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  productTemplates?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  logo?: string;
  productTemplates?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const categoriesApi = {
  getAll: async (params?: { search?: string; productType?: string; trackingMethod?: string; brandId?: string }) => {
    const { data } = await api.get<Category[]>('/categories', { params });
    return data;
  },

  create: async (payload: { name: string; code?: string; description?: string; parentId?: string; brandIds?: string[] }) => {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  update: async (id: string, payload: { name?: string; code?: string; description?: string; parentId?: string; brandIds?: string[] }) => {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

export const brandsApi = {
  getAll: async (params?: { search?: string; categoryId?: string }) => {
    const { data } = await api.get<Brand[]>('/brands', { params });
    return data;
  },

  create: async (payload: { name: string; code?: string; logo?: string; categoryIds?: string[] }) => {
    const { data } = await api.post<Brand>('/brands', payload);
    return data;
  },

  update: async (id: string, payload: { name?: string; code?: string; logo?: string; categoryIds?: string[] }) => {
    const { data } = await api.put<Brand>(`/brands/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/brands/${id}`);
  },
};

export const unitsApi = {
  getAll: async () => {
    const { data } = await api.get<UnitOfMeasure[]>('/units');
    return data;
  },
};

export interface ProductTemplate {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  brandId?: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  baseRetailPrice?: number;
  baseWholesalePrice?: number;
}

export const productTemplatesApi = {
  search: async (params: { search?: string; categoryId?: string; brandId?: string; limit?: number }) => {
    const { data } = await api.get<{ data: ProductTemplate[] }>('/product-templates', { params: { ...params, limit: params.limit ?? 10 } });
    return data.data;
  },
};
