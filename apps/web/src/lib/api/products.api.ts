import api from '../api';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  baseUnitId: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; code: string };
  brand?: { id: string; name: string; code: string };
  baseUnit?: { id: string; name: string; code: string };
  barcodes?: Array<{ id: string; code: string; isPrimary: boolean }>;
  stockLevels?: Array<{
    warehouseId: string;
    quantity: number;
    warehouse: { id: string; name: string; code: string };
  }>;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  baseUnitId: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  image?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) => {
    const { data } = await api.get<ProductsResponse>('/products', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (dto: CreateProductDto) => {
    const { data } = await api.post<Product>('/products', dto);
    return data;
  },

  update: async (id: string, dto: UpdateProductDto) => {
    const { data } = await api.patch<Product>(`/products/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  findByBarcode: async (barcode: string) => {
    const { data } = await api.get<Product>(`/products/barcode/${barcode}`);
    return data;
  },
};
