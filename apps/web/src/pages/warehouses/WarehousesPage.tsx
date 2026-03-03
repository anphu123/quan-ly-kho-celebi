import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Warehouse as WarehouseIcon, Search, Edit, Trash2, X, Loader2,
  MapPin, Phone, ChevronRight, Zap, Target, Globe, Navigation
} from 'lucide-react';
import { warehousesApi, type Warehouse, type CreateWarehouseDto } from '../../lib/api/warehouses.api';

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const { data: warehousesData, isLoading } = useQuery({
    queryKey: ['warehouses', page, searchTerm],
    queryFn: () => warehousesApi.getAll({ page, limit: 12, search: searchTerm }),
  });

  const deleteMutation = useMutation({
    mutationFn: warehousesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <div className="page-tag">
            <Navigation size={11} />
            Hạ tầng kho bãi
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Quản lý <span>Kho hàng</span></h1>
          <p className="page-desc">
            Quản trị mạng lưới kho bãi, phân khu chức năng và thông tin vận hành.
          </p>
        </div>
        <button className="page-action-btn" onClick={() => { setEditingWarehouse(null); setIsModalOpen(true); }}>
          <Plus size={18} />
          Thêm kho mới
        </button>
      </div>

      {/* Search */}
      <div className="table-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="table-search-wrap" style={{ flex: 1 }}>
            <span className="table-search-icon"><Search size={16} /></span>
            <input
              type="text" placeholder="Tìm kiếm kho theo tên, mã số..."
              className="table-search" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button className="table-filter-btn"><Globe size={15} /></button>
        </div>
      </div>

      {/* Warehouse grid */}
      <div style={{ minHeight: '16rem' }}>
        {isLoading ? (
          <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Đang tải danh sách kho...</p>
          </div>
        ) : !warehousesData?.data.length ? (
          <div className="table-card" style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="table-empty-icon" style={{ margin: '0 auto 1rem' }}><WarehouseIcon size={24} /></div>
            <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>Chưa có kho nào</p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '18rem', margin: '0 auto' }}>Thêm kho đầu tiên để bắt đầu quản lý tồn kho.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {warehousesData.data.map((warehouse) => (
              <div key={warehouse.id} className="page-stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', gap: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '3rem', height: '3rem', background: '#0f172a', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0, transition: 'background 0.2s' }}>
                      <WarehouseIcon size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.9375rem', lineHeight: 1.2 }}>{warehouse.name}</h3>
                      <span className="sku-badge" style={{ marginTop: '0.375rem', display: 'inline-flex' }}>{warehouse.code}</span>
                    </div>
                  </div>
                  <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: warehouse.isActive ? '#10b981' : '#94a3b8', marginTop: '0.25rem', animation: warehouse.isActive ? 'pulseOpacity 2s infinite' : 'none', flexShrink: 0 }} />
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <MapPin size={15} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '0.125rem' }} />
                    <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{warehouse.address || 'Chưa có địa chỉ'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Phone size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{warehouse.phone || 'Chưa có số điện thoại'}</p>
                  </div>
                </div>

                {/* Stats chips */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.875rem', border: '1px solid #f1f5f9' }}>
                    <p className="page-stat-label">Trạng thái</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 900, color: warehouse.isActive ? '#16a34a' : '#94a3b8', textTransform: 'uppercase' }}>
                      {warehouse.isActive ? 'Vận hành' : 'Bảo trì'}
                    </p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.875rem', border: '1px solid #f1f5f9' }}>
                    <p className="page-stat-label">Công suất</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#4f46e5' }}>Đang tải...</p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => { setEditingWarehouse(warehouse); setIsModalOpen(true); }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                  >
                    <Edit size={14} /> Chỉnh sửa
                  </button>
                  <button
                    className="tbl-action-btn danger"
                    onClick={() => confirm(`Xóa kho "${warehouse.name}"?`) && deleteMutation.mutate(warehouse.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {warehousesData && warehousesData.meta.totalPages > 1 && (
        <div className="table-pagination" style={{ background: 'white', borderRadius: '1rem', padding: '1rem 1.25rem' }}>
          <p className="table-pagination-info">Trang <strong>{page}</strong> / {warehousesData.meta.totalPages}</p>
          <div className="table-pagination-btns">
            <button className="table-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Trước
            </button>
            <button className="table-page-btn" disabled={page === warehousesData.meta.totalPages} onClick={() => setPage(p => p + 1)}>
              Tiếp <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <WarehouseModal
          warehouse={editingWarehouse}
          onClose={() => { setIsModalOpen(false); setEditingWarehouse(null); }}
          onSuccess={() => { setIsModalOpen(false); setEditingWarehouse(null); queryClient.invalidateQueries({ queryKey: ['warehouses'] }); }}
        />
      )}
    </div>
  );
}

function WarehouseModal({ warehouse, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState<CreateWarehouseDto>({
    code: warehouse?.code || '', name: warehouse?.name || '',
    address: warehouse?.address || '', phone: warehouse?.phone || ''
  });
  const mutation = useMutation({
    mutationFn: (data: CreateWarehouseDto) => warehouse ? warehousesApi.update(warehouse.id, data) : warehousesApi.create(data),
    onSuccess
  });
  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay">
      <div className="modal-card sm">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon ${warehouse ? 'indigo' : 'dark'}`}><WarehouseIcon size={20} /></div>
            <div>
              <p className="modal-title">{warehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}</p>
              <p className="modal-subtitle">Nhập thông tin kho hàng</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Mã kho <span>*</span></label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required className="form-input" style={{ textTransform: 'uppercase' }} placeholder="KHO-01" />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên kho <span>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Warehouse HCM 01" />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Địa chỉ</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8', pointerEvents: 'none' }} />
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="form-input" style={{ paddingLeft: '2.75rem', resize: 'none' }} placeholder="Địa chỉ chi tiết..." />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Số điện thoại</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="Hotline kho..." />
            </div>
          </div>
          {mutation.isError && (
            <div className="error-box">
              <Zap size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
              <p>Không thể lưu thông tin kho. Vui lòng thử lại.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-submit" disabled={mutation.isPending} onClick={() => mutation.mutate(formData)}>
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            {warehouse ? 'Lưu thay đổi' : 'Thêm kho'}
          </button>
        </div>
      </div>
    </div>
  );
}
