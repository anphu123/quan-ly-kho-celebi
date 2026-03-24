# Frontend Architecture - Component-Based Structure

## Cấu trúc thư mục đề xuất

```
apps/web/src/
├── components/           # Shared components
│   ├── common/          # Common UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Card/
│   │   └── Badge/
│   ├── layout/          # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── PageHeader/
│   └── widgets/         # Reusable widgets
│       ├── StatsCard/
│       ├── SearchBar/
│       ├── FilterBar/
│       └── Pagination/
│
├── features/            # Feature-based modules
│   ├── categories/
│   │   ├── components/  # Feature-specific components
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── CategoryTable.tsx
│   │   │   └── CategoryStats.tsx
│   │   ├── hooks/       # Custom hooks
│   │   │   └── useCategories.ts
│   │   ├── types/       # TypeScript types
│   │   │   └── category.types.ts
│   │   └── CategoriesPage.tsx
│   │
│   ├── brands/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── BrandsPage.tsx
│   │
│   └── products/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── ProductsPage.tsx
│
├── api/                 # API layer
│   ├── masterdata.api.ts
│   ├── inbound.api.ts
│   └── stock.api.ts
│
├── stores/              # State management (Zustand)
│   ├── auth.store.ts
│   └── ui.store.ts
│
└── utils/               # Utility functions
    ├── formatters.ts
    └── validators.ts
```

## Nguyên tắc thiết kế

### 1. Component Composition
- Tách các component lớn thành các component nhỏ hơn
- Mỗi component chỉ làm một việc duy nhất
- Tái sử dụng component ở nhiều nơi

### 2. Custom Hooks
- Logic nghiệp vụ nên được tách ra thành custom hooks
- Hooks xử lý data fetching, mutations, và business logic
- Component chỉ lo về UI rendering

### 3. Type Safety
- Định nghĩa types riêng cho từng feature
- Sử dụng TypeScript strict mode
- Tránh dùng `any`

### 4. Separation of Concerns
- **Components**: UI rendering
- **Hooks**: Business logic & data fetching
- **API**: HTTP requests
- **Types**: Type definitions
- **Utils**: Helper functions

## Ví dụ: Categories Feature

### Before (Monolithic)
```tsx
// CategoriesPage.tsx - 500+ lines
export default function CategoriesPage() {
  // All logic, UI, and data fetching in one file
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: categories } = useQuery(...);
  // ... 500 more lines
}
```

### After (Component-Based)
```tsx
// features/categories/CategoriesPage.tsx - 50 lines
export default function CategoriesPage() {
  const { categories, isLoading, stats } = useCategories();
  
  return (
    <div>
      <PageHeader title="Danh mục" />
      <CategoryStats stats={stats} />
      <CategoryTable categories={categories} loading={isLoading} />
    </div>
  );
}

// features/categories/hooks/useCategories.ts
export function useCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });
  
  const stats = useMemo(() => calculateStats(categories), [categories]);
  
  return { categories, isLoading, stats };
}

// features/categories/components/CategoryStats.tsx
export function CategoryStats({ stats }: Props) {
  return (
    <div className="stats-grid">
      <StatsCard label="Tổng danh mục" value={stats.total} />
      <StatsCard label="Điện tử" value={stats.electronics} />
    </div>
  );
}
```

## Benefits

1. **Dễ bảo trì**: Mỗi file nhỏ, dễ đọc và sửa
2. **Tái sử dụng**: Components có thể dùng ở nhiều nơi
3. **Testing**: Dễ test từng component riêng lẻ
4. **Collaboration**: Nhiều người có thể làm việc song song
5. **Performance**: Dễ optimize với React.memo, lazy loading

## Migration Plan

### Phase 1: Tạo shared components
- [ ] Button, Input, Modal, Table
- [ ] StatsCard, SearchBar, FilterBar
- [ ] PageHeader, Pagination

### Phase 2: Refactor Categories
- [ ] Tạo CategoryStats component
- [ ] Tạo CategoryTable component
- [ ] Tạo CategoryForm component
- [ ] Tạo useCategories hook

### Phase 3: Refactor Brands
- [ ] Tạo BrandCard component
- [ ] Tạo BrandGrid component
- [ ] Tạo BrandForm component
- [ ] Tạo useBrands hook

### Phase 4: Refactor Products
- [ ] Tạo ProductTable component
- [ ] Tạo ProductForm component
- [ ] Tạo useProducts hook

### Phase 5: Refactor Stock
- [ ] Tạo StockTable component
- [ ] Tạo StockFilters component
- [ ] Tạo useStock hook
