import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, Edit, Trash2, X, Loader2,
  Phone, Mail, MapPin, Award, ChevronRight,
  Filter, UserPlus, AlertTriangle, Target, Heart
} from 'lucide-react';
import { customersApi, type Customer, type CreateCustomerDto } from '../../lib/api/customers.api';

const TIER_STYLES: Record<string, { label: string; badge: string }> = {
  BRONZE: { label: 'Đồng', badge: 'background:#fff7ed;color:#c2410c;border:1px solid #fed7aa' },
  SILVER: { label: 'Bạc', badge: 'background:#f1f5f9;color:#475569;border:1px solid #e2e8f0' },
  GOLD: { label: 'Vàng', badge: 'background:#fefce8;color:#d97706;border:1px solid #fde68a' },
  PLATINUM: { label: 'Bạch Kim', badge: 'background:#eef2ff;color:#4f46e5;border:1px solid #c7d2fe' },
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', page, searchTerm],
    queryFn: () => customersApi.getAll({ page, limit: 12, search: searchTerm }),
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <div className="page-tag">
            <Users size={11} />
            Hệ thống CRM
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Khách <span>hàng</span></h1>
          <p className="page-desc">
            Quản lý hồ sơ thành viên, hạng loyalty và lịch sử mua sắm của khách hàng.
          </p>
        </div>
        <button className="page-action-btn" onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}>
          <UserPlus size={18} />
          Thêm khách hàng
        </button>
      </div>

      {/* Search + counter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        <div className="table-card" style={{ margin: 0, padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="table-search-wrap" style={{ flex: 1 }}>
              <span className="table-search-icon"><Search size={16} /></span>
              <input
                type="text" placeholder="Tìm kiếm tên, số điện thoại, email..."
                className="table-search" value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>
            <button className="table-filter-btn"><Filter size={15} /></button>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '1.125rem',
          padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
          position: 'relative', overflow: 'hidden', minWidth: '14rem'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '5rem', height: '5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0 0 0 100%' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Heart size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
              <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Tổng khách hàng</p>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{customersData?.meta.total || 0}</p>
          </div>
          <div style={{ width: '2.75rem', height: '2.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginLeft: 'auto' }}>
            <Award size={22} />
          </div>
        </div>
      </div>

      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th className="center">Hạng</th>
                <th className="right">Điểm tích lũy</th>
                <th className="right" style={{ color: '#10b981' }}>Tổng mua</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
                      <p style={{ color: '#94a3b8', fontWeight: 500 }}>Đang tải dữ liệu khách hàng...</p>
                    </div>
                  </td>
                </tr>
              ) : !customersData?.data.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <div className="table-empty-icon"><Users size={24} /></div>
                      <p>Chưa có khách hàng nào. Thêm hồ sơ đầu tiên!</p>
                    </div>
                  </td>
                </tr>
              ) : customersData.data.map((customer) => {
                const tier = TIER_STYLES[customer.membershipTier];
                return (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.25rem', height: '2.25rem', background: '#0f172a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.875rem', flexShrink: 0 }}>
                          {customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#0f172a' }}>{customer.fullName}</p>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.625rem', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '0.125rem 0.375rem', borderRadius: '0.375rem', textTransform: 'uppercase' }}>{customer.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.375rem', color: '#0f172a' }}>
                        <Phone size={13} style={{ color: '#94a3b8' }} /> {customer.phone || '—'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Mail size={12} /> {customer.email || 'Chưa có email'}
                      </div>
                    </td>
                    <td className="center">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', ...(tier ? Object.fromEntries(tier.badge.split(';').filter(Boolean).map(s => { const [k, v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase()), v.trim()]; })) : { background: '#f1f5f9', color: '#64748b' }) }}>
                        <Award size={12} />
                        {tier?.label || customer.membershipTier}
                      </span>
                    </td>
                    <td className="right">
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5' }}>{customer.loyaltyPoints}</span>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>pts</p>
                    </td>
                    <td className="right">
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(Number(customer.totalSpent))}</span>
                    </td>
                    <td className="right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button className="tbl-action-btn" onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}><Edit size={15} /></button>
                        <button className="tbl-action-btn danger" onClick={() => confirm(`Xóa "${customer.fullName}"?`) && deleteMutation.mutate(customer.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {customersData && customersData.meta.totalPages > 1 && (
          <div className="table-pagination">
            <p className="table-pagination-info">
              Hiển thị <strong>{(page - 1) * 12 + 1}–{Math.min(page * 12, customersData.meta.total)}</strong> / {customersData.meta.total}
            </p>
            <div className="table-pagination-btns">
              <button className="table-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Trước
              </button>
              <button className="table-page-btn" disabled={page === customersData.meta.totalPages} onClick={() => setPage(p => p + 1)}>
                Tiếp <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }}
          onSuccess={() => { setIsModalOpen(false); setEditingCustomer(null); queryClient.invalidateQueries({ queryKey: ['customers'] }); }}
        />
      )}
    </div>
  );
}

function CustomerModal({ customer, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState<CreateCustomerDto>({
    fullName: customer?.fullName || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || ''
  });
  const mutation = useMutation({
    mutationFn: (data: CreateCustomerDto) => customer ? customersApi.update(customer.id, data) : customersApi.create(data),
    onSuccess
  });
  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay">
      <div className="modal-card sm">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon ${customer ? 'indigo' : 'dark'}`}>
              {customer ? <Edit size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <p className="modal-title">{customer ? 'Chỉnh sửa hồ sơ' : 'Thêm khách hàng mới'}</p>
              <p className="modal-subtitle">Nhập thông tin cá nhân của khách hàng</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Họ và tên <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Users size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="VD: Nguyễn Văn A..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="09xx.xxx.xxx" />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="email@domain.com" />
              </div>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Địa chỉ</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8', pointerEvents: 'none' }} />
              <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="form-input" style={{ paddingLeft: '2.75rem', resize: 'none' }} placeholder="Địa chỉ chi tiết..." />
            </div>
          </div>
          {mutation.isError && (
            <div className="error-box">
              <AlertTriangle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
              <p>Lỗi hệ thống hoặc định dạng dữ liệu không hợp lệ.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-submit" disabled={mutation.isPending} onClick={() => mutation.mutate(formData)}>
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            {customer ? 'Lưu thay đổi' : 'Thêm khách hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}
