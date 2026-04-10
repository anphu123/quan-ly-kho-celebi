import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, ToggleLeft, ToggleRight, Calendar, BarChart3, ChevronRight, X, Save, Loader2, Trash2 } from 'lucide-react';
import { tradeInProgramsApi } from '../../api/trade-in-programs.api';
import type { TradeInProgram, CustomFieldDef } from '../../api/trade-in-programs.api';
import { useAuthStore } from '../../stores/auth.store';

const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 38, borderRadius: 9,
    border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 12,
    color: '#0f172a', outline: 'none', background: '#fff',
};

const FIELD_TYPES = [
    { value: 'text', label: 'Văn bản' },
    { value: 'number', label: 'Số' },
    { value: 'date', label: 'Ngày' },
    { value: 'select', label: 'Chọn từ danh sách' },
    { value: 'textarea', label: 'Văn bản dài' },
];

const STANDARD_FIELDS = [
    { key: 'sourceCustomerName', label: 'Tên KH' },
    { key: 'sourceCustomerPhone', label: 'Số điện thoại' },
    { key: 'sourceCustomerAddress', label: 'Địa chỉ KH' },
    { key: 'sourceCustomerIdCard', label: 'Số CCCD' },
    { key: 'idCardIssueDate', label: 'Ngày cấp CCCD' },
    { key: 'idCardIssuePlace', label: 'Nơi cấp CCCD' },
    { key: 'bankAccount', label: 'Số TK Ngân hàng' },
    { key: 'bankName', label: 'Tên Ngân hàng' },
    { key: 'contractNumber', label: 'Số hợp đồng' },
    { key: 'employeeName', label: 'Tên NV thu' },
    { key: 'purchaseDate', label: 'Ngày mua' },
    { key: 'otherCosts', label: 'Chi phí khác' },
    { key: 'topUp', label: 'Bù thêm' },
    { key: 'repairCost', label: 'Giá sửa chữa' },
    { key: 'serialNumber', label: 'Serial/IMEI' },
    { key: 'cccdFront', label: 'Ảnh CCCD (trước)' },
    { key: 'cccdBack', label: 'Ảnh CCCD (sau)' },
];

/* ── Create / Edit Modal ── */
function ProgramModal({ program, onClose }: { program?: TradeInProgram; onClose: () => void }) {
    const queryClient = useQueryClient();
    const isEdit = !!program;
    const [form, setForm] = useState({
        code: program?.code ?? '',
        name: program?.name ?? '',
        description: program?.description ?? '',
        logoUrl: program?.logoUrl ?? '',
        startDate: program?.startDate ? program.startDate.split('T')[0] : '',
        endDate: program?.endDate ? program.endDate.split('T')[0] : '',
    });
    const [customFields, setCustomFields] = useState<CustomFieldDef[]>(program?.customFields ?? []);

    const addField = () => setCustomFields(f => [...f, { key: `field_${Date.now()}`, label: '', type: 'text', required: false }]);
    const removeField = (i: number) => setCustomFields(f => f.filter((_, j) => j !== i));
    const updateField = (i: number, patch: Partial<CustomFieldDef>) =>
        setCustomFields(f => f.map((field, j) => j === i ? { ...field, ...patch } : field));

    let initialConfig = {};
    if (program?.defaultFieldConfig) {
        try {
            initialConfig = typeof program.defaultFieldConfig === 'string' ? JSON.parse(program.defaultFieldConfig) : program.defaultFieldConfig;
        } catch { }
    }
    const [defaultFieldConfig, setDefaultFieldConfig] = useState<Record<string, { visible: boolean; required: boolean }>>(initialConfig);
    const updateDefField = (key: string, prop: 'visible' | 'required', val: boolean) => {
        setDefaultFieldConfig(prev => {
            const current = prev[key] || { visible: true, required: false };
            return { ...prev, [key]: { ...current, [prop]: val } };
        });
    };

    const createMutation = useMutation({
        mutationFn: () => tradeInProgramsApi.create({
            code: form.code.toUpperCase(),
            name: form.name,
            description: form.description || undefined,
            logoUrl: form.logoUrl || undefined,
            startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            customFields,
            defaultFieldConfig,
        }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trade-in-programs'] }); onClose(); },
        onError: (e: any) => alert('Lỗi: ' + (e.response?.data?.message || e.message)),
    });

    const updateMutation = useMutation({
        mutationFn: () => tradeInProgramsApi.update(program!.id, {
            name: form.name,
            description: form.description || undefined,
            logoUrl: form.logoUrl || undefined,
            startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            customFields,
            defaultFieldConfig,
        }),
        onSuccess: async () => { await queryClient.refetchQueries({ queryKey: ['trade-in-programs'] }); onClose(); },
        onError: (e: any) => alert('Lỗi: ' + (e.response?.data?.message || e.message)),
    });

    const isPending = createMutation.isPending || updateMutation.isPending;
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = () => {
        if (!form.name.trim()) return alert('Vui lòng nhập tên chương trình');
        if (!isEdit && !form.code.trim()) return alert('Vui lòng nhập mã code');
        const invalid = customFields.find(f => !f.label || !f.label.trim());
        if (invalid) return alert('Vui lòng nhập tên cho tất cả các field bổ sung');
        isEdit ? updateMutation.mutate() : createMutation.mutate();
    };

    const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
    const selStyle: React.CSSProperties = { ...inputStyle, height: 34, fontSize: 12, paddingLeft: 8, appearance: 'none' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Edit2 size={18} />
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình thu cũ'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={16} />
                    </button>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
                    {/* Basic info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label style={lbl}>Mã chương trình *</label>
                            <input name="code" value={form.code} onChange={onChange} placeholder="XIAOMI-2025" disabled={isEdit}
                                style={{ ...inputStyle, opacity: isEdit ? 0.5 : 1 }} />
                        </div>
                        <div>
                            <label style={lbl}>Tên chương trình *</label>
                            <input name="name" value={form.name} onChange={onChange} placeholder="Thu cũ Xiaomi 2025" style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Mô tả</label>
                        <textarea name="description" value={form.description} onChange={onChange}
                            placeholder="Mô tả ngắn về chương trình..."
                            style={{ ...inputStyle, height: 60, paddingTop: 8, resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={lbl}>URL Logo</label>
                        <input name="logoUrl" value={form.logoUrl} onChange={onChange} placeholder="https://..." style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label style={lbl}>Ngày bắt đầu</label>
                            <input type="date" name="startDate" value={form.startDate} onChange={onChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={lbl}>Ngày kết thúc</label>
                            <input type="date" name="endDate" value={form.endDate} onChange={onChange} style={inputStyle} />
                        </div>
                    </div>

                    {/* Custom fields editor */}
                    <div style={{ borderTop: '1.5px dashed #e2e8f0', paddingTop: 16 }}>
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ marginBottom: 12 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Tùy chỉnh Field mặc định</p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Bật/tắt các trường mặc định khi tạo phiếu cho chương trình này</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                {STANDARD_FIELDS.map(f => {
                                    const c = defaultFieldConfig[f.key] || { visible: true, required: false };
                                    return (
                                        <div key={f.key} style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{f.label}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={c.visible} onChange={e => updateDefField(f.key, 'visible', e.target.checked)} />
                                                    Hiển thị
                                                </label>
                                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', cursor: 'pointer', opacity: c.visible ? 1 : 0.4 }}>
                                                    <input type="checkbox" checked={c.required} disabled={!c.visible} onChange={e => updateDefField(f.key, 'required', e.target.checked)} />
                                                    Bắt buộc
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderTop: '1px dashed #e2e8f0', paddingTop: 16 }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Field bổ sung</p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Thêm field riêng hiển thị khi tạo phiếu của chương trình này</p>
                            </div>
                            <button onClick={addField}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#eef2ff', fontSize: 12, fontWeight: 700, color: '#6366f1', cursor: 'pointer' }}>
                                <Plus size={13} /> Thêm field
                            </button>
                        </div>

                        {customFields.length === 0 ? (
                            <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1', textAlign: 'center', padding: '16px 0' }}>Chưa có field nào — bấm "+ Thêm field" để bắt đầu</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {customFields.map((field, i) => (
                                    <div key={field.key} style={{ background: '#f8fafc', borderRadius: 10, border: '1.5px solid #e2e8f0', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: 8, alignItems: 'center' }}>
                                            <div>
                                                <input value={field.label || ''} onChange={e => updateField(i, { label: e.target.value })}
                                                    placeholder="Tên field (vd: Tình trạng màn hình)"
                                                    style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                            </div>
                                            <select value={field.type} onChange={e => updateField(i, { type: e.target.value as any })} style={selStyle}>
                                                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                    <input type="checkbox" checked={field.required} onChange={e => updateField(i, { required: e.target.checked })} />
                                                    Bắt buộc
                                                </label>
                                                <button onClick={() => removeField(i)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'flex' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        {field.type === 'select' && (
                                            <div>
                                                <input value={(field.options || []).join(', ')}
                                                    onChange={e => updateField(i, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                    placeholder="Các lựa chọn, phân cách bằng dấu phẩy (vd: Tốt, Trầy nhẹ, Vỡ)"
                                                    style={{ ...inputStyle, height: 32, fontSize: 11 }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        Hủy
                    </button>
                    <button onClick={submit} disabled={isPending}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isPending ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo chương trình')}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Program Card ── */
function ProgramCard({ prog }: { prog: TradeInProgram }) {
    const navigate = useNavigate();
    const isXiaomi = prog.code === 'XIAOMI';
    const detailHref = isXiaomi ? '/trade-in-xiaomi' : `/trade-in/programs/${prog.id}`;
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'SUPER_ADMIN';
    const [showEdit, setShowEdit] = useState(false);

    const toggleMutation = useMutation({
        mutationFn: () => tradeInProgramsApi.update(prog.id, { isActive: !prog.isActive }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade-in-programs'] }),
        onError: (e: any) => alert('Lỗi: ' + (e.response?.data?.message || e.message)),
    });

    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
    const fmtVal = (n: number) => n > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n) : '—';

    const startFmt = fmtDate(prog.startDate);
    const endFmt = fmtDate(prog.endDate);

    return (
        <>
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow .15s', boxShadow: prog.isActive ? '0 2px 12px rgba(99,102,241,.1)' : 'none', opacity: prog.isActive ? 1 : 0.65 }}>
                {/* Card Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {prog.logoUrl ? (
                        <img src={prog.logoUrl} alt={prog.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
                            {prog.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.name}</p>
                            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', fontFamily: 'monospace', flexShrink: 0 }}>{prog.code}</span>
                            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: prog.isActive ? '#dcfce7' : '#fee2e2', color: prog.isActive ? '#166534' : '#991b1b', flexShrink: 0 }}>
                                {prog.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                            </span>
                        </div>
                        {prog.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.description}</p>}
                        {(startFmt || endFmt) && (
                            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={11} /> {startFmt ?? '...'} → {endFmt ?? '...'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderBottom: '1px solid #f1f5f9' }}>
                    {[
                        { label: 'Tổng phiếu', value: prog.stats.totalRequests },
                        { label: 'Hoàn thành', value: prog.stats.completedRequests },
                        { label: 'GT ước tính', value: fmtVal(prog.stats.totalEstimatedValue) },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '12px 16px', textAlign: 'center', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{s.value}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
                    <button onClick={() => navigate(detailHref)}
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Xem phiếu <ChevronRight size={14} />
                    </button>
                    {isAdmin && (
                        <>
                            <button onClick={() => setShowEdit(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                                <Edit2 size={13} /> Sửa
                            </button>
                            <button onClick={() => toggleMutation.mutate()} disabled={toggleMutation.isPending}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 700, color: prog.isActive ? '#dc2626' : '#16a34a', cursor: 'pointer', opacity: toggleMutation.isPending ? 0.5 : 1 }}>
                                {prog.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                {prog.isActive ? 'Tắt' : 'Bật'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            {showEdit && <ProgramModal key={prog.updatedAt} program={prog} onClose={() => setShowEdit(false)} />}
        </>
    );
}

/* ── Main Page ── */
export default function TradeInProgramsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'SUPER_ADMIN';

    const { data: programs = [], isLoading } = useQuery({
        queryKey: ['trade-in-programs'],
        queryFn: tradeInProgramsApi.getAll,
    });


    const totalRequests = programs.reduce((s, p) => s + p.stats.totalRequests, 0);
    const totalCompleted = programs.reduce((s, p) => s + p.stats.completedRequests, 0);
    const totalValue = programs.reduce((s, p) => s + p.stats.totalEstimatedValue, 0);
    const activeCount = programs.filter(p => p.isActive).length;

    const stats = [
        { label: 'Tổng chương trình', value: programs.length, color: '#6366f1', bg: '#eef2ff' },
        { label: 'Đang hoạt động', value: activeCount, color: '#16a34a', bg: '#dcfce7' },
        { label: 'Tổng phiếu', value: totalRequests, color: '#f97316', bg: '#fff7ed' },
        { label: 'Đã hoàn thành', value: totalCompleted, color: '#0ea5e9', bg: '#e0f2fe' },
    ];

    return (
        <div style={{ padding: 24, minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>Chương trình Thu cũ</h1>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Quản lý các chương trình thu mua thiết bị cũ</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowCreate(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }}>
                        <Plus size={16} /> Tạo chương trình
                    </button>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                {stats.map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BarChart3 size={20} color={s.color} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 900, fontSize: 22, color: s.color }}>{s.value}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total value bar */}
            {totalValue > 0 && (
                <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 14, padding: '16px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, color: '#fff' }}>
                    <BarChart3 size={22} />
                    <div>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.8, fontWeight: 600 }}>Tổng giá trị ước tính</p>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: 20 }}>{tradeInProgramsApi.formatCurrency(totalValue)}</p>
                    </div>
                </div>
            )}

            {/* Programs grid */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>Đang tải...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {programs.map(p => <ProgramCard key={p.id} prog={p} />)}
                </div>
            )}

            {showCreate && <ProgramModal onClose={() => setShowCreate(false)} />}
        </div>
    );
}
