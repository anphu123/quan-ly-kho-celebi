// ============== PRODUCT TYPES ==============

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  baseUnitId: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  minStock: number;
  maxStock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  shortName: string;
}

export interface UnitConversion {
  id: string;
  productId: string;
  fromUnitId: string;
  toUnitId: string;
  factor: number;
}

export interface CreateProductDto {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  baseUnitId: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  minStock?: number;
  maxStock?: number;
  imageUrl?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
