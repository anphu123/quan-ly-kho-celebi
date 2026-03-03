import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Package, Search, Edit, Trash2, X, Loader2, Filter,
  ChevronRight, Tag, Layers, Database, Zap, AlertTriangle, ScanLine
} from 'lucide-react';
import { productsApi, type Product, type CreateProductDto } from '../../lib/api/products.api';
import { categoriesApi, brandsApi, unitsApi } from '../../lib/api/masterdata.api';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, searchTerm],
    queryFn: () => productsApi.getAll({ page, limit: 12, search: searchTerm }),
  });

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.getAll });
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: unitsApi.getAll });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getTotalStock = (product: Product) =>
    product.stockLevels?.reduce((sum, l) => sum + l.quantity, 0) || 0;

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <ScanLine size={11} />
            Quản lý sản phẩm
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">
            Danh mục <span>Sản phẩm</span>
          </h1>
          <p className="page-desc">
            Quản lý SKU, giá bán, giá vốn và định mức tồn kho toàn hệ thống.
          </p>
        </div>
        <button
          className="page-action-btn"
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Stats */}
      <div className="page-stats-grid">
        {[
          { label: 'Tổng sản phẩm', value: productsData?.meta.total || 0, icon: Package, color: 'indigo' },
          { label: 'Danh mục', value: categories.length, icon: Layers, color: 'purple' },
          { label: 'Thương hiệu', value: brands.length, icon: Tag, color: 'blue' },
          { label: 'Đơn vị tính', value: units.length, icon: Database, color: 'emerald' },
        ].map((s) => (
          <div key={s.label} className="page-stat-card">
            <div className={`page-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className="page-stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="table-card">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search-wrap" style={{ flex: 1 }}>
            <span className="table-search-icon"><Search size={16} /></span>
            <input
              type="text"
              placeholder="Tìm kiếm SKU, tên sản phẩm..."
              className="table-search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button className="table-filter-btn">
            <Filter size={15} /> Lọc
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th className="right">Giá bán</th>
                <th className="center">Tồn kho</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
                      <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : !productsData?.data.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <div className="table-empty-icon"><Package size={24} /></div>
                      <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>
                    </div>
                  </td>
                </tr>
              ) : productsData.data.map((product) => {
                const stock = getTotalStock(product);
                const isLow = stock <= product.minStockLevel;
                return (
                  <tr key={product.id}>
                    <td><span className="sku-badge">{product.sku}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{product.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Tag size={11} /> {product.brand?.name || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="chip">
                        <Layers size={12} style={{ color: '#818cf8' }} />
                        {product.category?.name || '—'}
                      </span>
                    </td>
                    <td className="right" style={{ fontWeight: 700 }}>
                      {formatPrice(Number(product.sellingPrice))}
                    </td>
                    <td className="center">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span className={`stock-badge ${stock <= 0 ? 'none' : isLow ? 'low' : 'ok'}`}>
                          {stock} {product.baseUnit?.code || 'U'}
                        </span>
                        {isLow && (
                          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <AlertTriangle size={10} /> Sắp hết
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button className="tbl-action-btn" onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>
                          <Edit size={15} />
                        </button>
                        <button
                          className="tbl-action-btn danger"
                          onClick={() => confirm(`Xóa sản phẩm "${product.name}"?`) && deleteMutation.mutate(product.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData && productsData.meta.totalPages > 1 && (
          <div className="table-pagination">
            <p className="table-pagination-info">
              Hiển thị{' '}
              <strong>{(page - 1) * 12 + 1}–{Math.min(page * 12, productsData.meta.total)}</strong>
              {' '}/ {productsData.meta.total} sản phẩm
            </p>
            <div className="table-pagination-btns">
              <button
                className="table-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> Trước
              </button>
              <button
                className="table-page-btn"
                disabled={page === productsData.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Tiếp <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          units={units}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['products'] }); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, brands, units, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState<CreateProductDto>({
    sku: product?.sku || '', name: product?.name || '', description: product?.description || '',
    categoryId: product?.categoryId || '', brandId: product?.brandId || '', baseUnitId: product?.baseUnitId || '',
    costPrice: product ? Number(product.costPrice) : 0,
    sellingPrice: product ? Number(product.sellingPrice) : 0,
    wholesalePrice: product?.wholesalePrice ? Number(product.wholesalePrice) : undefined,
    minStockLevel: product?.minStockLevel || 0, maxStockLevel: product?.maxStockLevel || 100,
    reorderPoint: product?.reorderPoint || 10,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProductDto) => product ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['costPrice', 'sellingPrice', 'wholesalePrice', 'minStockLevel', 'maxStockLevel', 'reorderPoint'].includes(name)
        ? (Number(value) || 0) : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card lg">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon ${product ? 'indigo' : 'dark'}`}><Package size={20} /></div>
            <div>
              <p className="modal-title">{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</p>
              <p className="modal-subtitle">Nhập đầy đủ thông tin sản phẩm</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

            {/* Left */}
            <div>
              <div className="section-title">
                <span className="section-accent indigo" />
                Thông tin cơ bản
              </div>

              <div className="form-field">
                <label className="form-label">Mã SKU <span>*</span></label>
                <input name="sku" value={formData.sku} onChange={handleChange} required className="form-input" placeholder="VD: SKU-001" />
              </div>
              <div className="form-field">
                <label className="form-label">Tên sản phẩm <span>*</span></label>
                <input name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="VD: iPhone 15 Pro Max 256GB" />
              </div>
              <div className="form-field">
                <label className="form-label">Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows={3} placeholder="Mô tả ngắn về sản phẩm..." style={{ resize: 'none' }} />
              </div>

              <div className="section-title" style={{ marginTop: '1.5rem' }}>
                <span className="section-accent purple" />
                Phân loại
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Danh mục</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="form-input" style={{ cursor: 'pointer' }}>
                    <option value="">Chọn danh mục</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Thương hiệu</label>
                  <select name="brandId" value={formData.brandId} onChange={handleChange} className="form-input" style={{ cursor: 'pointer' }}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Đơn vị tính</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {units.map((u: any) => (
                    <button
                      key={u.id} type="button"
                      onClick={() => setFormData(p => ({ ...p, baseUnitId: u.id }))}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '2px solid',
                        borderColor: formData.baseUnitId === u.id ? '#4f46e5' : '#e2e8f0',
                        background: formData.baseUnitId === u.id ? '#4f46e5' : 'white',
                        color: formData.baseUnitId === u.id ? 'white' : '#64748b',
                        fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div>
              <div className="section-title">
                <span className="section-accent emerald" />
                Giá bán
              </div>

              <div style={{ background: '#0f172a', borderRadius: '1.125rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-field">
                  <label style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#34d399', display: 'block', marginBottom: '0.5rem' }}>
                    Giá bán lẻ (VNĐ) *
                  </label>
                  <input
                    type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required
                    style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #334155', width: '100%', outline: 'none', fontSize: '2.5rem', fontWeight: 900, color: 'white', paddingBottom: '0.5rem', fontFamily: 'inherit' }}
                    placeholder="0"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    { label: 'Giá vốn', name: 'costPrice', value: formData.costPrice },
                    { label: 'Giá sỉ', name: 'wholesalePrice', value: formData.wholesalePrice },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
                      <input
                        type="number" name={f.name} value={f.value ?? ''} onChange={handleChange}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #334155', width: '100%', outline: 'none', fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8', paddingBottom: '0.25rem', fontFamily: 'inherit' }}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-title">
                <span className="section-accent amber" />
                Định mức tồn kho
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Tối thiểu', name: 'minStockLevel', value: formData.minStockLevel },
                  { label: 'Tối đa', name: 'maxStockLevel', value: formData.maxStockLevel },
                  { label: 'Điểm đặt hàng', name: 'reorderPoint', value: formData.reorderPoint, highlight: true },
                ].map(f => (
                  <div key={f.name} className="form-field">
                    <label className="form-label" style={f.highlight ? { color: '#4f46e5' } : {}}>{f.label}</label>
                    <input
                      type="number" name={f.name} value={f.value} onChange={handleChange}
                      className="form-input"
                      style={{ textAlign: 'center', fontWeight: 800, ...(f.highlight ? { background: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' } : {}) }}
                    />
                  </div>
                ))}
              </div>

              {mutation.isError && (
                <div className="error-box">
                  <AlertTriangle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
                  <p>Không thể lưu — kiểm tra lại thông tin hoặc SKU đã tồn tại.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" type="button" onClick={onClose}>Hủy</button>
          <button
            className="btn-submit"
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(formData)}
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </div>

      </div>
    </div>
  );
}
