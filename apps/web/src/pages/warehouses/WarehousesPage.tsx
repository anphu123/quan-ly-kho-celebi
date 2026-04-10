import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Warehouse as WarehouseIcon, Search, Edit, Trash2, X, Loader2,
  MapPin, Phone, ChevronRight, Zap, Target, Globe, Navigation,
  Package, BarChart3, TrendingUp, Activity, Settings, Copy, UserCog
} from 'lucide-react';
import { warehousesApi, type Warehouse, type CreateWarehouseDto } from '../../lib/api/warehouses.api';
import { inventoryApi } from '../../lib/api/inventory.api';
import { usersApi } from '../../api/users.api';

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const { data: warehousesData, isLoading } = useQuery({
    queryKey: ['warehouses', page, searchTerm],
    queryFn: () => warehousesApi.getAll({ page, limit: 12, search: searchTerm }),
  });

  const { data: inventoryStats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryApi.getStockLevels(),
    enabled: !!warehousesData?.data.length,
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
            Quản trị mạng lưới kho bãi, tồn kho thời gian thực và phân tích hiệu suất.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="table-filter-btn" style={{ padding: '0.875rem 1.25rem' }}>
            <BarChart3 size={16} />
            Báo cáo
          </button>
          <button className="page-action-btn" onClick={() => { setEditingWarehouse(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            Thêm kho mới
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="page-stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Tổng số kho', value: warehousesData?.meta.total || 0, icon: WarehouseIcon, color: 'indigo', desc: 'Toàn hệ thống' },
          { label: 'Kho hoạt động', value: warehousesData?.data.filter(w => w.isActive).length || 0, icon: Activity, color: 'emerald', desc: 'Đang vận hành' },
          { label: 'Tổng SKU', value: inventoryStats?.length || 0, icon: Package, color: 'purple', desc: 'Sản phẩm tồn kho' },
          { label: 'Giá trị tồn', value: '0đ', icon: TrendingUp, color: 'blue', desc: 'Estimate value' },
        ].map((s) => (
          <div key={s.label} className="page-stat-card">
            <div className={`page-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className="page-stat-value">{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.desc}</p>
            </div>
          </div>
        ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {warehousesData.data.map((warehouse) => {
              const warehouseInventory = inventoryStats?.filter(item => item.warehouseId === warehouse.id) || [];
              const totalItems = warehouseInventory.length;
              const totalValue = warehouseInventory.reduce((sum, item) => sum + (Number(item.purchasePrice) || Number(item.suggestedPrice) || 0), 0);

              return (
                <div key={warehouse.id} className="page-stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', gap: 0, border: '2px solid transparent' }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = warehouse.isActive ? '#10b981' : '#f59e0b';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '3rem', height: '3rem', background: warehouse.isActive ? '#10b981' : '#f59e0b', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, transition: 'background 0.2s' }}>
                        <WarehouseIcon size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.9375rem', lineHeight: 1.2 }}>{warehouse.name}</h3>
                        <span className="sku-badge" style={{ marginTop: '0.375rem', display: 'inline-flex' }}>{warehouse.code}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: warehouse.isActive ? '#10b981' : '#f59e0b', animation: warehouse.isActive ? 'pulseOpacity 2s infinite' : 'none', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: warehouse.isActive ? '#16a34a' : '#d97706', textTransform: 'uppercase' }}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <UserCog size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      {warehouse.manager ? (
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4f46e5' }}>{warehouse.manager.fullName}</span>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontStyle: 'italic' }}>Chưa có thủ kho</span>
                      )}
                    </div>
                  </div>

                  {/* Inventory Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', padding: '1rem', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '0.875rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                        <Package size={14} style={{ color: '#4f46e5' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Items</span>
                      </div>
                      <p style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{totalItems.toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                        <TrendingUp size={14} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Value</span>
                      </div>
                      <p style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                        {totalValue > 0 ? `${(totalValue / 1000000).toFixed(1)}M` : '0'}
                      </p>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      background: warehouse.isActive ? '#dcfce7' : '#fef3c7',
                      color: warehouse.isActive ? '#15803d' : '#d97706',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      border: `1px solid ${warehouse.isActive ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      {warehouse.isActive ? '✓ Vận hành' : '⚠ Bảo trì'}
                    </div>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Settings size={12} style={{ marginRight: '0.25rem' }} />
                      Manage
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', color: '#4f46e5', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}
                    >
                      <ChevronRight size={14} /> Xem chi tiết
                    </button>
                    <button
                      style={{ padding: '0.75rem', background: '#4f46e5', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8125rem', color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => { setEditingWarehouse(warehouse); setIsModalOpen(true); }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#4338ca'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#4f46e5'; }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => navigator.clipboard?.writeText(warehouse.code)}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => confirm(`Xóa kho "${warehouse.name}"?`) && deleteMutation.mutate(warehouse.id)}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
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
    name: warehouse?.name || '',
    address: warehouse?.address || '',
    phone: warehouse?.phone || '',
    managerId: warehouse?.managerId || '',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });
  const managers = users.filter((u: any) => u.isActive && (u.role === 'INVENTORY_MANAGER' || u.role === 'SUPER_ADMIN'));

  const mutation = useMutation({
    mutationFn: (data: CreateWarehouseDto) => {
      const payload = { ...data, managerId: data.managerId || undefined };
      return warehouse ? warehousesApi.update(warehouse.id, payload) : warehousesApi.create(payload);
    },
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
          <div className="form-field">
            <label className="form-label">Tên kho <span>*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Kho Trung Tâm HCM" />
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
          <div className="form-field">
            <label className="form-label">
              <UserCog size={13} style={{ display: 'inline', marginRight: 4 }} />
              Thủ kho phụ trách
            </label>
            <select name="managerId" value={formData.managerId || ''} onChange={handleChange} className="form-input">
              <option value="">— Chưa chỉ định —</option>
              {managers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
            {managers.length === 0 && (
              <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>Chưa có tài khoản Thủ kho. Tạo tài khoản với vai trò "Thủ kho" trước.</p>
            )}
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
