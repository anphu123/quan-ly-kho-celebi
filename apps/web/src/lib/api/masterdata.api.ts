import api from '../api';

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  logo?: string;
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
  getAll: async () => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },
};

export const brandsApi = {
  getAll: async () => {
    const { data } = await api.get<Brand[]>('/brands');
    return data;
  },
};

export const unitsApi = {
  getAll: async () => {
    const { data } = await api.get<UnitOfMeasure[]>('/units');
    return data;
  },
};
