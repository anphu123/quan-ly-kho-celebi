import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Award, Package } from 'lucide-react';
import { brandsApi } from '../../api/masterdata.api';

export default function BrandsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', logo: '' });
  const queryClient = useQueryClient();

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: brandsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setIsModalOpen(false);
      setFormData({ name: '', code: '', logo: '' });
      alert('Tạo thương hiệu thành công!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => brandsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setIsModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', code: '', logo: '' });
      alert('Cập nhật thương hiệu thành công!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brandsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      alert('Xóa thương hiệu thành công!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openModal = (brand?: any) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, code: brand.code, logo: brand.logo || '' });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', code: '', logo: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
            Quản lý Thương hiệu
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14 }}>
            Quản lý các thương hiệu/nhà sản xuất sản phẩm
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Plus size={20} />
          Tạo thương hiệu mới
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{brands.length}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Tổng thương hiệu</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>0</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Sản phẩm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', color: '#64748b' }}>
            Đang tải...
          </div>
        ) : brands.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center' }}>
            <Award size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Chưa có thương hiệu nào
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
              Tạo thương hiệu đầu tiên để bắt đầu
            </div>
          </div>
        ) : (
          brands.map((brand: any) => (
            <div
              key={brand.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #f1f5f9',
                padding: 24,
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Logo */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                border: '1px solid #e2e8f0',
              }}>
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />
                ) : (
                  <Award size={32} color="#cbd5e1" />
                )}
              </div>

              {/* Info */}
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  {brand.name}
                </h3>
                <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
                  {brand.code}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>0</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Sản phẩm</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>0</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Tồn kho</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(brand);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Edit2 size={14} />
                  Sửa
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Xác nhận xóa thương hiệu "${brand.name}"?`)) {
                      deleteMutation.mutate(brand.id);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
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
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>
              {editingBrand ? 'Sửa thương hiệu' : 'Tạo thương hiệu mới'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                  Tên thương hiệu *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Apple, Samsung, Xiaomi"
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                  Mã thương hiệu *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: APPLE, SAMSUNG, XIAOMI"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
                  URL Logo
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
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
                    background: '#10b981',
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
