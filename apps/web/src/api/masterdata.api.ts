import api from '../lib/api';

// ===========================
// TYPES
// ===========================

export interface Category {
  id: string;
  name: string;
  code: string;
  productType: 'ELECTRONICS' | 'APPLIANCE_LARGE' | 'APPLIANCE_SMALL' | 'COMPUTER' | 'ACCESSORY';
  trackingMethod: 'SERIAL_BASED' | 'QUANTITY_BASED';
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  brandCategories?: Array<{
    id: string;
    brandId: string;
    categoryId: string;
    brand?: Brand;
  }>;
  productTemplates?: ProductTemplate[];
  _count?: {
    productTemplates: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  logo?: string;
  brandCategories?: Array<{
    id: string;
    brandId: string;
    categoryId: string;
    category?: Category;
  }>;
  productTemplates?: ProductTemplate[];
  _count?: {
    productTemplates: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductTemplate {
  id: string;
  sku: string;
  name: string;
  model?: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  category: Category;
  brand?: Brand;
  baseWholesalePrice?: number;
  baseRetailPrice?: number;
  image?: string;
  isActive: boolean;
  _count?: {
    serialItems: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  code: string;
  productType: 'ELECTRONICS' | 'APPLIANCE_LARGE' | 'APPLIANCE_SMALL' | 'COMPUTER' | 'ACCESSORY';
  trackingMethod?: 'SERIAL_BASED' | 'QUANTITY_BASED';
  description?: string;
  parentId?: string;
  brandIds?: string[];
}

export interface CreateBrandDto {
  name: string;
  code: string;
  logo?: string;
  categoryIds?: string[];
}

export interface CreateProductTemplateDto {
  sku: string;
  name: string;
  model?: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  baseWholesalePrice?: number;
  baseRetailPrice?: number;
  image?: string;
  isActive?: boolean;
}

export interface CategoryQuery {
  search?: string;
  productType?: 'ELECTRONICS' | 'APPLIANCE_LARGE' | 'APPLIANCE_SMALL' | 'COMPUTER' | 'ACCESSORY';
  trackingMethod?: 'SERIAL_BASED' | 'QUANTITY_BASED';
  brandId?: string;
}

export interface BrandQuery {
  search?: string;
  categoryId?: string;
}

export interface ProductTemplateQuery {
  search?: string;
  categoryId?: string;
  brandId?: string;
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
// CATEGORIES API
// ===========================

export const categoriesApi = {
  async getAll(query?: CategoryQuery): Promise<Category[]> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.productType) params.append('productType', query.productType);
    if (query?.trackingMethod) params.append('trackingMethod', query.trackingMethod);
    if (query?.brandId) params.append('brandId', query.brandId);

    const response = await api.get(`/categories?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCategoryDto>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  getProductTypeLabel(type: string): string {
    const labels = {
      ELECTRONICS: '📱 Điện tử',
      APPLIANCE_LARGE: '📺 Điện máy lớn',
      APPLIANCE_SMALL: '🍳 Điện máy nhỏ',
      COMPUTER: '💻 Máy tính',
      ACCESSORY: '🎧 Phụ kiện',
    };
    return labels[type as keyof typeof labels] || type;
  },

  getTrackingMethodLabel(method: string): string {
    const labels = {
      SERIAL_BASED: '🔢 Theo Serial',
      QUANTITY_BASED: '📦 Theo số lượng',
    };
    return labels[method as keyof typeof labels] || method;
  },
};

// ===========================
// BRANDS API
// ===========================

export const brandsApi = {
  async getAll(query?: BrandQuery): Promise<Brand[]> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.categoryId) params.append('categoryId', query.categoryId);

    const response = await api.get(`/brands?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Brand> {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },

  async create(data: CreateBrandDto): Promise<Brand> {
    const response = await api.post('/brands', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateBrandDto>): Promise<Brand> {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/brands/${id}`);
  },
};

// ===========================
// PRODUCT TEMPLATES API
// ===========================

export const productTemplatesApi = {
  async getAll(query?: ProductTemplateQuery): Promise<PaginatedResponse<ProductTemplate>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.categoryId) params.append('categoryId', query.categoryId);
    if (query?.brandId) params.append('brandId', query.brandId);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await api.get(`/product-templates?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ProductTemplate> {
    const response = await api.get(`/product-templates/${id}`);
    return response.data;
  },

  async create(data: CreateProductTemplateDto): Promise<ProductTemplate> {
    const response = await api.post('/product-templates', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateProductTemplateDto>): Promise<ProductTemplate> {
    const response = await api.put(`/product-templates/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/product-templates/${id}`);
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
    });
  },
};

// ===========================
// UNITS API (Stub - chưa implement)
// ===========================

export const unitsApi = {
  async getAll(): Promise<any[]> {
    // TODO: Implement units API
    return [];
  },
};
