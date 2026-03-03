import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Building, User,
  Phone, Mail, Package, AlertCircle, ChevronRight,
  Zap, Database, Calendar, ClipboardList,
  Fingerprint, Truck, DollarSign, FileText, Loader2, ScanLine
} from 'lucide-react';
import { inboundApi, type CreateInboundRequest, type CreateInboundItem } from '../../api/inbound.api';
import { categoriesApi, brandsApi } from '../../lib/api/masterdata.api';
import { warehousesApi } from '../../lib/api/warehouses.api';

interface Category { id: string; name: string; code: string; }
interface Brand { id: string; name: string; code: string; }
interface Warehouse { id: string; name: string; code: string; }

const CONDITION_LEVELS = [
  { val: 'Tốt', label: 'Cấp 1 — Tốt / Mới' },
  { val: 'Khá', label: 'Cấp 2 — Khá / 98%' },
  { val: 'Cần sửa chữa', label: 'Cấp 3 — Cần sửa chữa' },
  { val: 'Hỏng nặng', label: 'Cấp 4 — Hỏng nặng' },
];

const SUPPLIER_TYPES = [
  { val: 'INDIVIDUAL_SELLER', label: '🏪 Bán lẻ (Individual)' },
  { val: 'CUSTOMER_TRADE_IN', label: '🔄 Trade-in (Thu cũ)' },
  { val: 'LIQUIDATION', label: '📦 Thanh lý (Bulk)' },
  { val: 'INTERNAL_RETURN', label: '↩️ Trả nội bộ' },
];

const emptyItem = (): CreateInboundItem => ({
  categoryId: '', brandId: '', serialNumber: '',
  modelName: '', condition: 'Tốt', estimatedValue: 0, notes: ''
});

export default function CreateInboundPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [recentSuppliers, setRecentSuppliers] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState<CreateInboundRequest>({
    warehouseId: '', supplierType: 'INDIVIDUAL_SELLER',
    supplierName: '', supplierPhone: '', supplierEmail: '',
    expectedDate: '', totalEstimatedValue: 0, notes: '',
    items: [emptyItem()]
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [whRes, catRes, brandRes, suppliers] = await Promise.all([
        warehousesApi.getAll(), categoriesApi.getAll(),
        brandsApi.getAll(), inboundApi.getRecentSuppliers()
      ]);
      setWarehouses(whRes.data);
      setCategories(catRes);
      setBrands(brandRes);
      setRecentSuppliers(suppliers);
      if (whRes.data.length === 1)
        setFormData(p => ({ ...p, warehouseId: whRes.data[0].id }));
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!formData.warehouseId) errs.warehouseId = 'Vui lòng chọn kho hàng';
    if (!formData.supplierName.trim()) errs.supplierName = 'Vui lòng nhập tên nhà cung cấp';
    formData.items.forEach((item, i) => {
      if (!item.categoryId) errs[`items.${i}.categoryId`] = 'Chọn danh mục';
      if (!item.modelName.trim()) errs[`items.${i}.modelName`] = 'Nhập tên model';
    });
    if (Object.keys(errs).length > 0) { setErrors(errs); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      setLoading(true);
      await inboundApi.createRequest(formData);
      navigate('/inbound', { state: { message: 'Tạo phiếu nhập kho thành công!' } });
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Lỗi hệ thống khi khởi tạo phiếu' });
    } finally { setLoading(false); }
  };

  const addItem = () => setFormData(p => ({ ...p, items: [...p.items, emptyItem()] }));
  const removeItem = (i: number) => formData.items.length > 1 &&
    setFormData(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, field: keyof CreateInboundItem, val: any) =>
    setFormData(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it) }));
  const total = formData.items.reduce((s, it) => s + (it.estimatedValue || 0), 0);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '6rem' }}>

      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <button
            onClick={() => navigate('/inbound')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: 'white', border: '1.5px solid #e2e8f0',
              borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.75rem', color: '#64748b',
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1rem'
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
          >
            <ArrowLeft size={14} /> Quay lại
          </button>

          <div className="page-tag">
            <Truck size={11} />
            Lệnh nhập kho
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Lập phiếu <span>Nhập kho</span></h1>
          <p className="page-desc">
            Tạo chứng từ nhập hàng, khai báo nguồn cung ứng và ghi nhận tài sản vào hệ thống kho Celebi.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {errors.general && (
        <div className="error-box" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
          <p>{errors.general}</p>
        </div>
      )}

      {/* ─── Main grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 22rem', gap: '2rem', alignItems: 'start' }}>

          {/* LEFT: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* 1. Destination */}
            <div className="table-card" style={{ padding: '2rem' }}>
              <div className="section-title" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', background: '#0f172a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                  <Building size={18} />
                </div>
                Điểm nhận hàng
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-field">
                  <label className="form-label">Kho hàng nhận <span>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={formData.warehouseId}
                      onChange={e => setFormData(p => ({ ...p, warehouseId: e.target.value }))}
                      className="form-input"
                      style={{ paddingRight: '2.5rem', cursor: 'pointer', borderColor: errors.warehouseId ? '#fecdd3' : undefined }}
                    >
                      <option value="">-- Chọn kho nhận --</option>
                      {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name} [{wh.code}]</option>)}
                    </select>
                    <ChevronRight size={15} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: '#94a3b8' }} />
                  </div>
                  {errors.warehouseId && <p style={{ color: '#e11d48', fontSize: '0.75rem', fontWeight: 700 }}>{errors.warehouseId}</p>}
                </div>

                <div className="form-field">
                  <label className="form-label">Thời gian dự kiến (ETA)</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type="datetime-local"
                      value={formData.expectedDate}
                      onChange={e => setFormData(p => ({ ...p, expectedDate: e.target.value }))}
                      className="form-input"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Supplier info */}
            <div className="table-card" style={{ padding: '2rem' }}>
              <div className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', background: '#4f46e5', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
                  <User size={18} />
                </div>
                Nguồn hàng / Đối tác
              </div>

              {/* Recent suppliers quick-select */}
              {recentSuppliers.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
                    <Zap size={11} style={{ color: '#f59e0b' }} /> Truy cập nhanh
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {recentSuppliers.slice(0, 4).map((s, i) => (
                      <button
                        key={i} type="button"
                        onClick={() => setFormData(p => ({ ...p, supplierName: s.name, supplierPhone: s.phone || '', supplierEmail: s.email || '', supplierType: s.type }))}
                        style={{
                          padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0',
                          background: 'white', fontWeight: 700, fontSize: '0.75rem', color: '#0f172a',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#0f172a'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = '#0f172a'; }}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-field">
                  <label className="form-label">Loại hình cung ứng</label>
                  <select
                    value={formData.supplierType}
                    onChange={e => setFormData(p => ({ ...p, supplierType: e.target.value as any }))}
                    className="form-input" style={{ cursor: 'pointer' }}
                  >
                    {SUPPLIER_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Tên nhà cung cấp <span>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Fingerprint size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={e => setFormData(p => ({ ...p, supplierName: e.target.value }))}
                      placeholder="Tên cá nhân / Doanh nghiệp..."
                      className="form-input"
                      style={{ paddingLeft: '2.75rem', fontWeight: 800, borderColor: errors.supplierName ? '#fecdd3' : undefined }}
                    />
                  </div>
                  {errors.supplierName && <p style={{ color: '#e11d48', fontSize: '0.75rem', fontWeight: 700 }}>{errors.supplierName}</p>}
                </div>

                <div className="form-field">
                  <label className="form-label">Số điện thoại</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input type="tel" value={formData.supplierPhone}
                      onChange={e => setFormData(p => ({ ...p, supplierPhone: e.target.value }))}
                      className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="09xx.xxx.xxx" />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input type="email" value={formData.supplierEmail}
                      onChange={e => setFormData(p => ({ ...p, supplierEmail: e.target.value }))}
                      className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="email@domain.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Item list */}
            <div className="table-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div className="section-title" style={{ fontSize: '1rem', marginBottom: 0 }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', background: '#0f172a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                    <Package size={18} />
                  </div>
                  Khai báo hàng hóa
                </div>
                <button type="button" className="page-action-btn" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }} onClick={addItem}>
                  <Plus size={16} /> Thêm mặt hàng
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative', background: '#f8fafc', border: '2px solid #f1f5f9',
                      borderRadius: '1.25rem', padding: '1.5rem', transition: 'all 0.2s'
                    }}
                  >
                    {/* Item number badge */}
                    <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', background: '#0f172a', color: '#818cf8', width: '2rem', height: '2rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem' }}>
                      #{idx + 1}
                    </div>

                    {/* Remove button */}
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '2.25rem', height: '2.25rem', borderRadius: '50%', border: '1.5px solid #fecdd3', background: 'white', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f43f5e'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = '#f43f5e'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginTop: '2.75rem' }}>
                      {/* Category */}
                      <div className="form-field">
                        <label className="form-label">Danh mục <span>*</span></label>
                        <select
                          value={item.categoryId}
                          onChange={e => updateItem(idx, 'categoryId', e.target.value)}
                          className="form-input"
                          style={{ cursor: 'pointer', borderColor: errors[`items.${idx}.categoryId`] ? '#fecdd3' : undefined }}
                        >
                          <option value="">-- Danh mục --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors[`items.${idx}.categoryId`] && <p style={{ color: '#e11d48', fontSize: '0.6875rem', fontWeight: 700 }}>{errors[`items.${idx}.categoryId`]}</p>}
                      </div>

                      {/* Brand */}
                      <div className="form-field">
                        <label className="form-label">Thương hiệu</label>
                        <select
                          value={item.brandId || ''}
                          onChange={e => updateItem(idx, 'brandId', e.target.value)}
                          className="form-input" style={{ cursor: 'pointer' }}
                        >
                          <option value="">-- Thương hiệu --</option>
                          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>

                      {/* Model name */}
                      <div className="form-field">
                        <label className="form-label">Tên Model / Thiết bị <span>*</span></label>
                        <input
                          type="text"
                          value={item.modelName}
                          onChange={e => updateItem(idx, 'modelName', e.target.value)}
                          placeholder="VD: iPhone 15 Pro 256GB"
                          className="form-input"
                          style={{ fontWeight: 800, borderColor: errors[`items.${idx}.modelName`] ? '#fecdd3' : undefined }}
                        />
                        {errors[`items.${idx}.modelName`] && <p style={{ color: '#e11d48', fontSize: '0.6875rem', fontWeight: 700 }}>{errors[`items.${idx}.modelName`]}</p>}
                      </div>

                      {/* Serial */}
                      <div className="form-field">
                        <label className="form-label">Serial / IMEI</label>
                        <div style={{ position: 'relative' }}>
                          <ScanLine size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                          <input
                            type="text"
                            value={item.serialNumber}
                            onChange={e => updateItem(idx, 'serialNumber', e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', fontFamily: 'monospace', fontWeight: 900, color: '#4f46e5', fontSize: '0.8125rem' }}
                            placeholder="Scan hoặc nhập tay..."
                          />
                        </div>
                      </div>

                      {/* Condition */}
                      <div className="form-field">
                        <label className="form-label">Hiện trạng</label>
                        <select
                          value={item.condition}
                          onChange={e => updateItem(idx, 'condition', e.target.value)}
                          className="form-input" style={{ cursor: 'pointer' }}
                        >
                          {CONDITION_LEVELS.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                        </select>
                      </div>

                      {/* Estimated value */}
                      <div className="form-field">
                        <label className="form-label">Giá trị ước tính (VNĐ)</label>
                        <div style={{ position: 'relative' }}>
                          <DollarSign size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                          <input
                            type="number"
                            value={item.estimatedValue || ''}
                            onChange={e => updateItem(idx, 'estimatedValue', Number(e.target.value))}
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', fontWeight: 900, color: '#16a34a' }}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="form-field" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label">Ghi chú tình trạng</label>
                      <textarea
                        value={item.notes}
                        onChange={e => updateItem(idx, 'notes', e.target.value)}
                        rows={2}
                        className="form-input"
                        style={{ resize: 'none' }}
                        placeholder="Mô tả vết trầy, lịch sử sửa chữa..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary panel */}
          <div style={{ position: 'sticky', top: '6rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Bill of asset */}
            <div style={{ background: '#0f172a', borderRadius: '1.375rem', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '10rem', height: '10rem', background: 'rgba(79,70,229,0.12)', borderRadius: '0 0 0 100%', filter: 'blur(24px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', borderBottom: '1px solid #1e293b', paddingBottom: '1.25rem', marginBottom: '1.25rem', position: 'relative' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 900, color: '#818cf8', fontSize: '1rem', letterSpacing: '-0.02em' }}>Tóm tắt phiếu</p>
                  <p style={{ fontSize: '0.5625rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Inbound Summary</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', position: 'relative' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Số mặt hàng</span>
                <span style={{ fontWeight: 900, color: 'white', fontSize: '1rem' }}>{formData.items.length} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>sản phẩm</span></span>
              </div>

              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem', marginBottom: '1.75rem', position: 'relative' }}>
                <p style={{ fontSize: '0.5625rem', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Tổng giá trị ước tính</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {inboundApi.formatCurrency(total)}
                </p>
                <p style={{ fontSize: '0.5625rem', color: '#475569', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  <Database size={11} /> Tính toán thời gian thực
                </p>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: '1rem', background: 'white', border: 'none',
                  borderRadius: '1rem', fontWeight: 900, fontSize: '0.875rem', color: '#0f172a',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.625rem', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', opacity: loading ? 0.6 : 1
                }}
                onMouseOver={e => !loading && ((e.currentTarget as HTMLElement).style.background = '#eef2ff')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'white')}
              >
                {loading ? <Loader2 size={18} className="animate-spin" style={{ color: '#4f46e5' }} /> : <Save size={18} style={{ color: '#4f46e5' }} />}
                {loading ? 'Đang lưu...' : 'Xác nhận & Lưu'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/inbound')}
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.625rem', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#475569', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
              >
                Hủy thao tác
              </button>
            </div>

            {/* Notes panel */}
            <div className="table-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ width: '2rem', height: '2rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <FileText size={15} />
                </div>
                <p style={{ fontSize: '0.625rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Ghi chú nội bộ</p>
              </div>
              <textarea
                className="form-input"
                rows={4}
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                style={{ resize: 'none' }}
                placeholder="Ghi chú cho bộ phận kiểm hàng, thủ kho..."
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}