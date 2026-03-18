# API Implementation Guide - Masterdata Module

## ✅ Đã hoàn thành:

### 1. UI Components
- ✅ `CategoriesPage.tsx` - Quản lý danh mục
- ✅ `BrandsPage.tsx` - Quản lý thương hiệu  
- ✅ `ProductTemplatesPage.tsx` - Quản lý sản phẩm template

### 2. Backend cần implement

## 📁 Cấu trúc Backend

```
apps/backend/src/modules/masterdata/
├── masterdata.module.ts
├── masterdata.service.ts
├── categories.controller.ts
├── brands.controller.ts
├── products.controller.ts
└── dto/
    ├── category.dto.ts
    ├── brand.dto.ts
    └── product-template.dto.ts
```

## 🔧 API Endpoints cần tạo

### Categories API

```typescript
// GET /api/v1/masterdata/categories
// - Query: search, productType, trackingMethod
// - Response: Category[]

// POST /api/v1/masterdata/categories
// - Body: CreateCategoryDto
// - Response: Category

// GET /api/v1/masterdata/categories/:id
// - Response: Category with children

// PUT /api/v1/masterdata/categories/:id
// - Body: UpdateCategoryDto
// - Response: Category

// DELETE /api/v1/masterdata/categories/:id
// - Validate: Không có ProductTemplate
// - Response: 204
```

### Brands API

```typescript
// GET /api/v1/masterdata/brands
// - Query: search
// - Response: Brand[]

// POST /api/v1/masterdata/brands
// - Body: CreateBrandDto
// - Response: Brand

// GET /api/v1/masterdata/brands/:id
// - Response: Brand with products count

// PUT /api/v1/masterdata/brands/:id
// - Body: UpdateBrandDto
// - Response: Brand

// DELETE /api/v1/masterdata/brands/:id
// - Validate: Không có ProductTemplate
// - Response: 204
```

### Product Templates API

```typescript
// GET /api/v1/masterdata/product-templates
// - Query: search, categoryId, brandId, page, limit
// - Response: PaginatedResponse<ProductTemplate>

// POST /api/v1/masterdata/product-templates
// - Body: CreateProductTemplateDto
// - Response: ProductTemplate

// GET /api/v1/masterdata/product-templates/:id
// - Response: ProductTemplate with full details

// PUT /api/v1/masterdata/product-templates/:id
// - Body: UpdateProductTemplateDto
// - Response: ProductTemplate

// DELETE /api/v1/masterdata/product-templates/:id
// - Validate: Không có SerialItem
// - Response: 204
```

## 📝 DTOs

### Category DTOs

```typescript
// create-category.dto.ts
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(ProductType)
  productType: ProductType;

  @IsEnum(TrackingMethod)
  @IsOptional()
  trackingMethod?: TrackingMethod;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```

### Brand DTOs

```typescript
// create-brand.dto.ts
export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
```

### Product Template DTOs

```typescript
// create-product-template.dto.ts
export class CreateProductTemplateDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsNumber()
  @IsOptional()
  baseWholesalePrice?: number;

  @IsNumber()
  @IsOptional()
  baseRetailPrice?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductTemplateDto extends PartialType(CreateProductTemplateDto) {}
```

## 🔐 Validation Rules

### Category
- ✅ `code` phải unique
- ✅ `parentId` phải tồn tại (nếu có)
- ❌ Không thể xóa nếu có ProductTemplate
- ❌ Không thể thay đổi `trackingMethod` nếu có SerialItem

### Brand
- ✅ `code` phải unique
- ❌ Không thể xóa nếu có ProductTemplate

### ProductTemplate
- ✅ `sku` phải unique
- ✅ `categoryId` phải tồn tại
- ✅ `brandId` phải tồn tại (nếu có)
- ❌ Không thể xóa nếu có SerialItem
- ❌ Không thể thay đổi `categoryId` nếu có SerialItem

## 🎯 Service Methods

### CategoryService

```typescript
async create(dto: CreateCategoryDto): Promise<Category>
async findAll(query?: CategoryQuery): Promise<Category[]>
async findById(id: string): Promise<Category>
async update(id: string, dto: UpdateCategoryDto): Promise<Category>
async delete(id: string): Promise<void>
async getHierarchy(): Promise<Category[]> // Cấu trúc cây
```

### BrandService

```typescript
async create(dto: CreateBrandDto): Promise<Brand>
async findAll(query?: BrandQuery): Promise<Brand[]>
async findById(id: string): Promise<Brand>
async update(id: string, dto: UpdateBrandDto): Promise<Brand>
async delete(id: string): Promise<void>
async getStats(id: string): Promise<BrandStats> // Thống kê sản phẩm
```

### ProductTemplateService

```typescript
async create(dto: CreateProductTemplateDto): Promise<ProductTemplate>
async findAll(query?: ProductQuery): Promise<PaginatedResponse<ProductTemplate>>
async findById(id: string): Promise<ProductTemplate>
async update(id: string, dto: UpdateProductTemplateDto): Promise<ProductTemplate>
async delete(id: string): Promise<void>
async getInventory(id: string): Promise<InventoryStats> // Tồn kho theo template
```

## 🚀 Implementation Steps

### Step 1: Create DTOs
```bash
# Create DTO files
touch apps/backend/src/modules/masterdata/dto/category.dto.ts
touch apps/backend/src/modules/masterdata/dto/brand.dto.ts
touch apps/backend/src/modules/masterdata/dto/product-template.dto.ts
```

### Step 2: Update Service
```typescript
// masterdata.service.ts
// Add methods for Categories, Brands, ProductTemplates
```

### Step 3: Create Controllers
```typescript
// categories.controller.ts
@Controller('masterdata/categories')
export class CategoriesController {
  // Implement CRUD endpoints
}

// brands.controller.ts
@Controller('masterdata/brands')
export class BrandsController {
  // Implement CRUD endpoints
}

// products.controller.ts
@Controller('masterdata/product-templates')
export class ProductTemplatesController {
  // Implement CRUD endpoints
}
```

### Step 4: Update Module
```typescript
// masterdata.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [
    CategoriesController,
    BrandsController,
    ProductTemplatesController,
  ],
  providers: [MasterdataService],
  exports: [MasterdataService],
})
export class MasterdataModule {}
```

### Step 5: Add to AppModule
```typescript
// app.module.ts
imports: [
  // ...
  MasterdataModule,
]
```

### Step 6: Create Frontend API
```typescript
// apps/web/src/api/masterdata.api.ts
export const categoriesApi = {
  getAll: async () => api.get('/masterdata/categories'),
  create: async (data) => api.post('/masterdata/categories', data),
  // ...
};

export const brandsApi = {
  getAll: async () => api.get('/masterdata/brands'),
  create: async (data) => api.post('/masterdata/brands', data),
  // ...
};

export const productTemplatesApi = {
  getAll: async (params) => api.get('/masterdata/product-templates', { params }),
  create: async (data) => api.post('/masterdata/product-templates', data),
  // ...
};
```

### Step 7: Update Routes
```typescript
// apps/web/src/App.tsx
<Route path="categories" element={<CategoriesPage />} />
<Route path="brands" element={<BrandsPage />} />
<Route path="product-templates" element={<ProductTemplatesPage />} />
```

## 📊 Database Queries Examples

### Get Categories with Product Count
```typescript
const categories = await prisma.category.findMany({
  include: {
    _count: {
      select: { productTemplates: true }
    }
  }
});
```

### Get Brands with Stats
```typescript
const brand = await prisma.brand.findUnique({
  where: { id },
  include: {
    productTemplates: {
      include: {
        serialItems: {
          where: { status: 'AVAILABLE' }
        }
      }
    }
  }
});
```

### Get Product Templates with Inventory
```typescript
const products = await prisma.productTemplate.findMany({
  where: { categoryId, brandId },
  include: {
    category: true,
    brand: true,
    serialItems: {
      where: { status: { in: ['AVAILABLE', 'RESERVED'] } }
    },
    _count: {
      select: { serialItems: true }
    }
  }
});
```

## ✅ Testing Checklist

### Categories
- [ ] Tạo danh mục mới
- [ ] Tạo danh mục con (parent-child)
- [ ] Sửa danh mục
- [ ] Xóa danh mục (không có sản phẩm)
- [ ] Không cho xóa danh mục có sản phẩm
- [ ] Hiển thị cấu trúc phân cấp

### Brands
- [ ] Tạo thương hiệu mới
- [ ] Upload logo
- [ ] Sửa thương hiệu
- [ ] Xóa thương hiệu (không có sản phẩm)
- [ ] Không cho xóa thương hiệu có sản phẩm
- [ ] Hiển thị thống kê sản phẩm

### Product Templates
- [ ] Tạo sản phẩm mới
- [ ] Chọn danh mục và thương hiệu
- [ ] Set giá chuẩn
- [ ] Sửa sản phẩm
- [ ] Xóa sản phẩm (không có serial item)
- [ ] Không cho xóa sản phẩm có serial item
- [ ] Filter theo danh mục/thương hiệu
- [ ] Search sản phẩm
- [ ] Hiển thị tồn kho

## 🎉 Kết quả mong đợi

Sau khi implement xong, hệ thống sẽ có:
- ✅ Quản lý danh mục với cấu trúc phân cấp
- ✅ Quản lý thương hiệu độc lập
- ✅ Quản lý sản phẩm template linh hoạt
- ✅ Validation đầy đủ
- ✅ UI/UX hiện đại, dễ sử dụng
- ✅ API RESTful chuẩn
- ✅ Tích hợp với SerialItem tracking
