import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Factory, Search, Loader2,
  Phone, Mail, MapPin, FileText, Database,
  ChevronRight, Globe, Building2, Plus, Edit2, Trash2, X, Save, AlertCircle
} from 'lucide-react';
import { suppliersApi, type Supplier, type CreateSupplierDto } from '../../lib/api/suppliers.api';

/* ────────────────── SupplierModal (Create/Edit) ────────────────── */
function SupplierModal({ supplier, onClose }: { supplier?: Supplier; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!supplier;
  
  const [form, setForm] = useState<CreateSupplierDto>({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    taxCode: supplier?.taxCode || '',
    bankAccount: supplier?.bankAccount || '',
    notes: supplier?.notes || '',
  });

  const saveMutation = useMutation({
    mutationFn: () => isEdit 
      ? suppliersApi.update(supplier.id, form)
      : suppliersApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onClose();
    },
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 38, borderRadius: 9, border: '1.5px solid #e2e8f0',
    fontSize: 13, paddingLeft: 12, paddingRight: 12, color: '#0f172a', outline: 'none', background: '#fff',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, boxShadow: '0 24px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={20} />
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</p>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{isEdit ? supplier.code : 'Tạo đối tác mới trong hệ thống'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tên doanh nghiệp / cá nhân <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="text" name="name" value={form.name} onChange={onChange} placeholder="Ví dụ: Công ty TNHH ABC" required
                style={inputStyle} />
            </div>
            
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Người liên hệ</label>
              <input type="text" name="contactPerson" value={form.contactPerson} onChange={onChange} placeholder="Họ tên người đại diện"
                style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Số điện thoại</label>
              <input type="text" name="phone" value={form.phone} onChange={onChange} placeholder="0123456789"
                style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="email@domain.com"
                style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Địa chỉ</label>
              <input type="text" name="address" value={form.address} onChange={onChange} placeholder="Số nhà, đường, phường, quận, thành phố"
                style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mã số thuế</label>
              <input type="text" name="taxCode" value={form.taxCode} onChange={onChange} placeholder="0123456789"
                style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tài khoản ngân hàng</label>
              <input type="text" name="bankAccount" value={form.bankAccount} onChange={onChange} placeholder="1234567890"
                style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ghi chú</label>
              <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Thông tin bổ sung về nhà cung cấp..."
                style={{ ...inputStyle, height: 80, paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
            </div>
          </div>

          {saveMutation.isError && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b' }}>
              <AlertCircle size={16} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Có lỗi xảy ra. Vui lòng thử lại.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbff' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
            Hủy
          </button>
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: form.name ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#cbd5e1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: form.name ? 'pointer' : 'not-allowed', boxShadow: form.name ? '0 4px 12px rgba(79,70,229,.35)' : 'none', opacity: saveMutation.isPending ? 0.6 : 1 }}>
            <Save size={14} /> {saveMutation.isPending ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── DeleteConfirmModal ────────────────── */
function DeleteConfirmModal({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: () => suppliersApi.delete(supplier.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onClose();
    },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
            <Trash2 size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Xóa nhà cung cấp?</h3>
          <p style={{ margin: '0 0 6px', fontSize: 14, color: '#64748b' }}>Bạn có chắc muốn xóa:</p>
          <p style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{supplier.name}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', background: '#fef9c3', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde047' }}>
            ⚠️ Hành động này không thể hoàn tác
          </p>
          
          {deleteMutation.isError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 12 }}>
              <AlertCircle size={14} />
              Không thể xóa. Nhà cung cấp có thể đang được sử dụng.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbff' }}>
          <button onClick={onClose} disabled={deleteMutation.isPending}
            style={{ flex: 1, padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
            Hủy
          </button>
          <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: deleteMutation.isPending ? 0.6 : 1 }}>
            <Trash2 size={14} /> {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<{ type: 'create' | 'edit' | 'delete'; supplier?: Supplier } | null>(null);

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', page, searchTerm],
    queryFn: () => suppliersApi.getAll({ page, limit: 12, search: searchTerm }),
  });

  return (
    <div className="animate-fade-in">
      {/* Modals */}
      {modalMode?.type === 'create' && <SupplierModal onClose={() => setModalMode(null)} />}
      {modalMode?.type === 'edit' && modalMode.supplier && <SupplierModal supplier={modalMode.supplier} onClose={() => setModalMode(null)} />}
      {modalMode?.type === 'delete' && modalMode.supplier && <DeleteConfirmModal supplier={modalMode.supplier} onClose={() => setModalMode(null)} />}

      <div className="page-header">
        <div>
          <div className="page-tag">
            <Globe size={11} />
            Mạng lưới cung ứng
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Nhà <span>cung cấp</span></h1>
          <p className="page-desc">
            Quản lý toàn bộ nhà cung cấp và đối tác trong hệ thống
          </p>
        </div>
        <button onClick={() => setModalMode({ type: 'create' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,.35)' }}>
          <Plus size={18} /> Thêm nhà cung cấp
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
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
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
                        <MapPin size={11} /> {supplier.contactPerson || 'Nhà cung cấp'}
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3125rem 0.625rem', background: '#0f172a', color: 'white', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          <FileText size={12} style={{ color: '#818cf8' }} /> MST: {supplier.taxCode}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có mã số thuế</span>
                      )}
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Database size={11} style={{ opacity: 0.5 }} />
                        {supplier.bankAccount ? 'Có TK ngân hàng' : 'Chưa có TK ngân hàng'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button onClick={() => setModalMode({ type: 'edit', supplier })} title="Chỉnh sửa"
                          style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f4ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setModalMode({ type: 'delete', supplier })} title="Xóa"
                          style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
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
    </div>
  );
}

