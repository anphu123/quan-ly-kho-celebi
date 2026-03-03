import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Factory, Search, Edit, Trash2, X, Loader2,
  Phone, Mail, MapPin, FileText, Database,
  ChevronRight, Zap, Target, Globe, Building2
} from 'lucide-react';
import { suppliersApi, type Supplier, type CreateSupplierDto } from '../../lib/api/suppliers.api';

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', page, searchTerm],
    queryFn: () => suppliersApi.getAll({ page, limit: 12, search: searchTerm }),
  });

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <div className="page-tag">
            <Globe size={11} />
            Mạng lưới cung ứng
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Nhà <span>cung cấp</span></h1>
          <p className="page-desc">
            Quản lý danh sách nhà cung cấp, thông tin liên hệ và dữ liệu pháp lý.
          </p>
        </div>
        <button className="page-action-btn" onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}>
          <Plus size={18} />
          Thêm nhà cung cấp
        </button>
      </div>

      {/* Search + counter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        <div className="table-card" style={{ margin: 0, padding: '1rem' }}>
          <div className="table-search-wrap">
            <span className="table-search-icon"><Search size={16} /></span>
            <input
              type="text" placeholder="Tìm kiếm nhà cung cấp theo tên, mã số..."
              className="table-search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '1.125rem',
          padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1.5rem', position: 'relative', overflow: 'hidden', minWidth: '14rem'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '5rem', height: '5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0 0 0 100%' }} />
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Tổng nhà cung cấp</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{suppliersData?.meta.total || 0}</p>
          </div>
          <div style={{ width: '2.75rem', height: '2.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Building2 size={22} />
          </div>
        </div>
      </div>

      <div className="table-card">
        <div style={{ overflowX: 'auto', minHeight: '16rem' }}>
          {isLoading ? (
            <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>Đang tải danh sách nhà cung cấp...</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên doanh nghiệp</th>
                  <th>Liên hệ</th>
                  <th>Thông tin pháp lý</th>
                  <th className="right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!suppliersData?.data.length ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="table-empty">
                        <div className="table-empty-icon"><Factory size={24} /></div>
                        <p>Chưa có nhà cung cấp. Thêm đối tác đầu tiên!</p>
                      </div>
                    </td>
                  </tr>
                ) : suppliersData.data.map((supplier) => (
                  <tr key={supplier.id}>
                    <td><span className="sku-badge">{supplier.code}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', display: 'block' }}>{supplier.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={11} /> Nhà cung cấp
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                        <Phone size={13} style={{ color: '#94a3b8' }} /> {supplier.phone || '—'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Mail size={12} /> {supplier.email || 'Chưa có email'}
                      </div>
                    </td>
                    <td>
                      {supplier.taxCode ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3125rem 0.625rem', background: '#0f172a', color: 'white', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          <FileText size={12} style={{ color: '#818cf8' }} /> MST: {supplier.taxCode}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có mã số thuế</span>
                      )}
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Database size={11} style={{ opacity: 0.5 }} />
                        {supplier.bankAccount ? 'Có tài khoản ngân hàng' : 'Chưa có tài khoản ngân hàng'}
                      </p>
                    </td>
                    <td className="right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button className="tbl-action-btn" onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}><Edit size={15} /></button>
                        <button className="tbl-action-btn danger" onClick={() => confirm(`Xóa "${supplier.name}"?`) && deleteMutation.mutate(supplier.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {suppliersData && suppliersData.meta.totalPages > 1 && (
          <div className="table-pagination">
            <p className="table-pagination-info">
              Hiển thị <strong>{(page - 1) * 12 + 1}–{Math.min(page * 12, suppliersData.meta.total)}</strong> / {suppliersData.meta.total}
            </p>
            <div className="table-pagination-btns">
              <button className="table-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Trước
              </button>
              <button className="table-page-btn" disabled={page === suppliersData.meta.totalPages} onClick={() => setPage(p => p + 1)}>
                Tiếp <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => { setIsModalOpen(false); setEditingSupplier(null); }}
          onSuccess={() => { setIsModalOpen(false); setEditingSupplier(null); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); }}
        />
      )}
    </div>
  );
}

function SupplierModal({ supplier, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState<CreateSupplierDto>({
    name: supplier?.name || '', contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '', email: supplier?.email || '',
    address: supplier?.address || '', taxCode: supplier?.taxCode || '',
    bankAccount: supplier?.bankAccount || '', notes: supplier?.notes || ''
  });
  const mutation = useMutation({
    mutationFn: (data: CreateSupplierDto) => supplier ? suppliersApi.update(supplier.id, data) : suppliersApi.create(data),
    onSuccess
  });
  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay">
      <div className="modal-card md">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon ${supplier ? 'indigo' : 'dark'}`}><Factory size={20} /></div>
            <div>
              <p className="modal-title">{supplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</p>
              <p className="modal-subtitle">Điền đầy đủ thông tin liên hệ và pháp lý</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="section-title"><span className="section-accent indigo" /> Thông tin định danh &amp; pháp lý</div>
          <div className="form-field">
            <label className="form-label">Tên tổ chức / Doanh nghiệp <span>*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="VD: Công ty TNHH ABC..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Mã số thuế</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="text" name="taxCode" value={formData.taxCode} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="0123.xxx.xxx" />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Tài khoản ngân hàng</label>
              <div style={{ position: 'relative' }}>
                <Database size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="MB BANK - 09xx..." />
              </div>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: '1.5rem' }}><span className="section-accent purple" /> Kênh liên hệ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Người phụ trách</label>
              <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="form-input" placeholder="Contact person" />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.75rem' }} />
              </div>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Địa chỉ</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8', pointerEvents: 'none' }} />
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="form-input" style={{ paddingLeft: '2.75rem', resize: 'none' }} placeholder="Địa chỉ chi tiết..." />
            </div>
          </div>

          {mutation.isError && (
            <div className="error-box">
              <Zap size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
              <p>Không thể lưu thông tin nhà cung cấp. Vui lòng thử lại.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-submit" disabled={mutation.isPending} onClick={() => mutation.mutate(formData)}>
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            {supplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
          </button>
        </div>
      </div>
    </div>
  );
}
