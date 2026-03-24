import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react';
import { productTemplatesApi, categoriesApi, brandsApi } from '../../api/masterdata.api';
import { resolveImageUrl } from '../../lib/image';

export default function ProductTemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    model: '',
    categoryId: '',
    brandId: '',
    baseWholesalePrice: 0,
    baseRetailPrice: 0,
    description: '',
    image: '',
  });

  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['product-templates', searchTerm, filterCategory, filterBrand],
    queryFn: () => productTemplatesApi.getAll({ search: searchTerm, categoryId: filterCategory, brandId: filterBrand }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getAll(),
  });

  const products = productsData?.data || [];

  const createMutation = useMutation({
    mutationFn: productTemplatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-templates'] });
      setIsModalOpen(false);
      resetForm();
      alert('Tạo sản phẩm thành công!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => productTemplatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-templates'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      alert('Cập nhật sản phẩm thành công!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productTemplatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-templates'] });
      alert('Xóa sản phẩm thành công!');
    },
  });

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      model: '',
      categoryId: '',
      brandId: '',
      baseWholesalePrice: 0,
      baseRetailPrice: 0,
      description: '',
      image: '',
    });
  };

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        model: product.model || '',
        categoryId: product.categoryId,
        brandId: product.brandId || '',
        baseWholesalePrice: product.baseWholesalePrice || 0,
        baseRetailPrice: product.baseRetailPrice || 0,
        description: product.description || '',
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const fmt = (n?: number) => n ? n.toLocaleString('vi-VN') + ' đ' : '—';

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
            Quản lý Sản phẩm Template
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14 }}>
            Quản lý khuôn mẫu sản phẩm (không lưu tồn kho)
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Plus size={20} />
          Tạo sản phẩm mới
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #f1f5f9', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              background: '#fff',
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              background: '#fff',
            }}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand: any) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            Đang tải...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Package size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Chưa có sản phẩm nào
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
              Tạo sản phẩm template đầu tiên
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Sản phẩm</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>SKU</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Danh mục</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Thương hiệu</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Giá bán</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                      }}>
                        {product.image ? (
                          <img src={resolveImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <Package size={20} color="#cbd5e1" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{product.name}</div>
                        {product.model && (
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Model: {product.model}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <code style={{ fontSize: 13, color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: 4 }}>
                      {product.sku}
                    </code>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>
                    {product.category?.name || '—'}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>
                    {product.brand?.name || '—'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    {fmt(product.baseRetailPrice)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openModal(product)}
                        style={{
                          padding: 8,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xác nhận xóa "${product.name}"?`)) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        style={{
                          padding: 8,
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
            padding: 20,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>
              {editingProduct ? 'Sửa sản phẩm' : 'Tạo sản phẩm mới'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="IP15PM-256-NT"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="A3108"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 15 Pro Max 256GB Natural Titanium"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    Danh mục *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    Thương hiệu
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Không có</option>
                    {brands.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    Giá thu mua chuẩn (Hạng A)
                  </label>
                  <input
                    type="number"
                    value={formData.baseWholesalePrice}
                    onChange={(e) => setFormData({ ...formData, baseWholesalePrice: Number(e.target.value) })}
                    placeholder="28000000"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    Giá bán chuẩn (Hạng A)
                  </label>
                  <input
                    type="number"
                    value={formData.baseRetailPrice}
                    onChange={(e) => setFormData({ ...formData, baseRetailPrice: Number(e.target.value) })}
                    placeholder="32000000"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết sản phẩm..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                  URL Hình ảnh
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
