import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, Clock, ArrowLeft,
    LayoutList, DollarSign, BadgeCheck, Edit2, X, Save,
    Upload, Image as ImageIcon, ClipboardCheck, Loader2, Package
} from 'lucide-react';
import { inboundApi } from '../../api/inbound.api';
import { tradeInProgramsApi } from '../../api/trade-in-programs.api';
import { uploadApi } from '../../api/upload.api';
import { resolveImageUrl } from '../../lib/image';

const fmt = (n?: number) => n != null ? n.toLocaleString('vi-VN') : '—';
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const statusBadge = (status: string) => {
    if (status === 'COMPLETED') return <span style={badgeStyle('#dcfce7', '#166534')}><BadgeCheck size={11} /> ĐÃ NHẬP KHO</span>;
    if (status === 'IN_PROGRESS') return <span style={badgeStyle('#fef9c3', '#854d0e')}><ClipboardCheck size={11} /> CHỜ QC</span>;
    return <span style={badgeStyle('#eff6ff', '#1d4ed8')}><Clock size={11} /> CHỜ NHẬN HÀNG</span>;
};
const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px',
    borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color, letterSpacing: '0.04em', whiteSpace: 'nowrap',
});
const stickyLeft = (left: number, shadow = false): React.CSSProperties => ({
    position: 'sticky', left, zIndex: 2, background: 'inherit',
    ...(shadow ? { boxShadow: '4px 0 6px -2px rgba(0,0,0,.08)' } : {}),
});
const stickyRight: React.CSSProperties = {
    position: 'sticky', right: 0, zIndex: 2, background: 'inherit',
    boxShadow: '-4px 0 6px -2px rgba(0,0,0,.08)',
};
const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 38, borderRadius: 9,
    border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 12,
    color: '#0f172a', outline: 'none', background: '#fff',
};

/* ── Edit Item Modal ── */
function EditItemModal({ item, onClose }: { item: any; onClose: () => void }) {
    const queryClient = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState({
        modelName: item.modelName || '',
        serialNumber: item.serialNumber || '',
        notes: item.notes || '',
        contractNumber: item.contractNumber || '',
        purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
        employeeName: item.employeeName || '',
        estimatedValue: item.estimatedValue ?? '',
        otherCosts: item.otherCosts ?? '',
        topUp: item.topUp ?? '',
        repairCost: item.repairCost ?? '',
        sourceCustomerName: item.sourceCustomerName || '',
        sourceCustomerPhone: item.sourceCustomerPhone || '',
        sourceCustomerAddress: item.sourceCustomerAddress || '',
        sourceCustomerIdCard: item.sourceCustomerIdCard || '',
        idCardIssueDate: item.idCardIssueDate ? item.idCardIssueDate.split('T')[0] : '',
        idCardIssuePlace: item.idCardIssuePlace || '',
        bankAccount: item.bankAccount || '',
        bankName: item.bankName || '',
        imageUrl: item.imageUrl || '',
    });
    const [previewImage, setPreviewImage] = useState<string>(item.imageUrl || '');

    const saveMutation = useMutation({
        mutationFn: () => inboundApi.updateItem(item.id, {
            modelName: form.modelName,
            serialNumber: form.serialNumber || undefined,
            notes: form.notes || undefined,
            contractNumber: form.contractNumber || undefined,
            purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
            employeeName: form.employeeName || undefined,
            estimatedValue: form.estimatedValue !== '' ? Number(form.estimatedValue) : undefined,
            otherCosts: form.otherCosts !== '' ? Number(form.otherCosts) : undefined,
            topUp: form.topUp !== '' ? Number(form.topUp) : undefined,
            repairCost: form.repairCost !== '' ? Number(form.repairCost) : undefined,
            sourceCustomerName: form.sourceCustomerName || undefined,
            sourceCustomerPhone: form.sourceCustomerPhone || undefined,
            sourceCustomerAddress: form.sourceCustomerAddress || undefined,
            sourceCustomerIdCard: form.sourceCustomerIdCard || undefined,
            idCardIssueDate: form.idCardIssueDate ? new Date(form.idCardIssueDate).toISOString() : undefined,
            idCardIssuePlace: form.idCardIssuePlace || undefined,
            bankAccount: form.bankAccount || undefined,
            bankName: form.bankName || undefined,
            imageUrl: form.imageUrl || undefined,
        } as any),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trade-in-program-requests'] }); onClose(); },
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadApi.uploadImage(file);
            setPreviewImage(url);
            setForm(p => ({ ...p, imageUrl: url }));
        } catch (err: any) {
            alert('Upload ảnh thất bại: ' + (err?.response?.data?.message || err?.message));
        } finally {
            setIsUploading(false);
            input.value = '';
        }
    };

    const totalPrice = (Number(form.estimatedValue) || 0) + (Number(form.otherCosts) || 0) + (Number(form.topUp) || 0);

    const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
        <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `2px solid ${color}20`, paddingBottom: 6 }}>{title}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
        </div>
    );
    const F = ({ label, name, type = 'text', span = 1 }: { label: string; name: string; type?: string; span?: number }) => (
        <div style={{ gridColumn: `span ${span}` }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
            <input type={type} name={name} value={(form as any)[name]} onChange={onChange}
                style={{ ...inputStyle, height: 36, fontSize: 13 }} />
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 800, boxShadow: '0 24px 60px rgba(0,0,0,.25)', flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Edit2 size={18} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>Chỉnh sửa thiết bị</p>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{item.modelName} · {item.serialNumber || 'Chưa có IMEI'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={16} />
                    </button>
                </div>
                <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Image Upload */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #e0e7ff', paddingBottom: 6 }}>Hình ảnh thiết bị</p>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ width: 120, height: 120, borderRadius: 12, border: '2px dashed #c7d2fe', background: '#fafbff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                                onClick={() => fileRef.current?.click()}>
                                {previewImage ? (
                                    <img src={resolveImageUrl(previewImage)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                        <ImageIcon size={28} style={{ marginBottom: 4 }} />
                                        <p style={{ margin: 0, fontSize: 11 }}>Ảnh thiết bị</p>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f0f4ff', fontSize: 12, fontWeight: 700, color: '#6366f1', cursor: 'pointer', marginBottom: 8 }}>
                                    <Upload size={14} /> Chọn ảnh từ máy
                                </button>
                                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#94a3b8' }}>Hoặc nhập URL ảnh:</p>
                                <input type="text" name="imageUrl" value={form.imageUrl} onChange={e => { onChange(e); setPreviewImage(e.target.value); }}
                                    placeholder="https://..." style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
                            </div>
                        </div>
                    </div>
                    <Section title="Thiết bị & Thu mua" color="#f97316">
                        <F label="Tên thiết bị *" name="modelName" span={2} />
                        <F label="Serial / IMEI" name="serialNumber" />
                        <F label="Ghi chú" name="notes" />
                        <F label="Số hợp đồng" name="contractNumber" />
                        <F label="Ngày mua" name="purchaseDate" type="date" />
                        <F label="Tên nhân viên" name="employeeName" span={2} />
                        <F label="Giá thu mua (đ)" name="estimatedValue" type="number" />
                        <F label="Chi phí khác (đ)" name="otherCosts" type="number" />
                        <F label="Bù thêm (đ)" name="topUp" type="number" />
                        <F label="Sửa chữa (đ)" name="repairCost" type="number" />
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Tổng giá thu: <span style={{ fontWeight: 900, fontSize: 18, color: '#6366f1', marginLeft: 8 }}>{totalPrice.toLocaleString('vi-VN')} đ</span></p>
                        </div>
                    </Section>
                    <Section title="Thông tin khách hàng" color="#10b981">
                        <F label="Tên khách hàng" name="sourceCustomerName" />
                        <F label="Số điện thoại" name="sourceCustomerPhone" />
                        <F label="Địa chỉ" name="sourceCustomerAddress" span={2} />
                        <F label="Số CCCD" name="sourceCustomerIdCard" />
                        <F label="Ngày cấp CCCD" name="idCardIssueDate" type="date" />
                        <F label="Nơi cấp CCCD" name="idCardIssuePlace" span={2} />
                        <F label="Số TK Ngân hàng" name="bankAccount" />
                        <F label="Tên Ngân hàng" name="bankName" />
                    </Section>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        Hủy
                    </button>
                    <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isUploading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saveMutation.isPending ? 0.6 : 1 }}>
                        <Save size={14} /> {saveMutation.isPending || isUploading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function TradeInProgramDetailPage() {
    const { id: programId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<any>(null);
    const [query, setQuery] = useState({ page: 1, limit: 20, search: '', status: '' });
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const { data: program } = useQuery({
        queryKey: ['trade-in-program', programId],
        queryFn: () => tradeInProgramsApi.getById(programId!),
        enabled: !!programId,
    });

    const { data: inboundData, isLoading } = useQuery({
        queryKey: ['trade-in-program-requests', programId, query],
        queryFn: () => inboundApi.getAllRequests({
            ...query,
            tradeInProgramId: programId,
            supplierType: 'CUSTOMER_TRADE_IN',
            status: query.status as any || undefined,
        }),
        enabled: !!programId,
    });

    const receiveItemsMutation = useMutation({
        mutationFn: (requestId: string) => inboundApi.receiveItems(requestId),
        onMutate: (id) => setActionLoadingId(id),
        onSettled: () => setActionLoadingId(null),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade-in-program-requests'] }),
        onError: (e: any) => alert('Lỗi nhận hàng: ' + (e.response?.data?.message || e.message)),
    });

    const completeQCMutation = useMutation({
        mutationFn: (requestId: string) => inboundApi.completeQC(requestId),
        onMutate: (id) => setActionLoadingId(id),
        onSettled: () => setActionLoadingId(null),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade-in-program-requests'] }),
        onError: (e: any) => alert('Lỗi nhập kho: ' + (e.response?.data?.message || e.message)),
    });

    const allRequestsRaw = inboundData?.data || [];

    // Flatten requests → items for table display
    const allItems: Array<{ item: any; request: any; rowNum: number }> = [];
    let rowNum = 0;
    allRequestsRaw.forEach((request: any) => {
        if (dateFrom && new Date(request.createdAt) < new Date(dateFrom)) return;
        if (dateTo && new Date(request.createdAt) > new Date(dateTo + 'T23:59:59')) return;
        (request.items || []).forEach((item: any) => {
            rowNum++;
            allItems.push({ item, request, rowNum });
        });
    });

    const pagination = inboundData?.pagination || { total: 0, page: 1, totalPages: 1 };
    const totalValue = allItems.reduce((a, { item }) =>
        a + (Number(item.estimatedValue) || 0) + (Number(item.otherCosts) || 0) + (Number(item.topUp) || 0), 0);
    const pendingCount = allItems.filter(({ request }) => request.status === 'REQUESTED').length;
    const inProgressCount = allItems.filter(({ request }) => request.status === 'IN_PROGRESS').length;

    const thStyle: React.CSSProperties = {
        padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textAlign: 'left',
        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', background: '#f8fafc',
    };
    const tdStyle: React.CSSProperties = {
        padding: '12px 14px', fontSize: 13, color: '#0f172a', verticalAlign: 'middle',
        borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {editingItem && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <button onClick={() => navigate('/trade-in')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', marginBottom: 12 }}>
                        <ArrowLeft size={14} /> Tất cả chương trình
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {program?.logoUrl ? (
                            <img src={program.logoUrl} alt={program.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 10, border: '1px solid #e2e8f0' }} />
                        ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18 }}>
                                {program?.name.charAt(0).toUpperCase() ?? '?'}
                            </div>
                        )}
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>{program?.name ?? '...'}</h1>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                                <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>{program?.code}</span>
                                {program?.description && <span style={{ marginLeft: 8 }}>{program.description}</span>}
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate(`/trade-in/programs/${programId}/create-single`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,.35)' }}>
                        <Plus size={16} /> Tạo đơn thu cũ
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                    { label: 'Tổng thiết bị', val: allItems.length, color: '#6366f1', bg: '#eef2ff', icon: Package },
                    { label: 'Chờ nhận hàng', val: pendingCount, color: '#f97316', bg: '#fff7ed', icon: Clock },
                    { label: 'Đang QC', val: inProgressCount, color: '#0ea5e9', bg: '#e0f2fe', icon: ClipboardCheck },
                    { label: 'Tổng giá trị', val: totalValue > 0 ? `${fmt(totalValue)} đ` : '—', color: '#ec4899', bg: '#fdf2f8', icon: DollarSign },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #f1f5f9' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.icon size={20} color={s.color} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{isLoading ? '—' : s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutList size={18} color="#fff" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Danh sách thiết bị</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                                <strong style={{ color: '#6366f1' }}>{pagination.total}</strong> phiếu · Trang {query.page}/{pagination.totalPages || 1}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Date range */}
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            style={{ height: 36, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, paddingLeft: 10, paddingRight: 10, color: '#0f172a', outline: 'none' }} />
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>→</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            style={{ height: 36, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, paddingLeft: 10, paddingRight: 10, color: '#0f172a', outline: 'none' }} />
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            <input type="text" placeholder="Tìm mã, IMEI, khách hàng..." value={query.search}
                                onChange={e => setQuery({ ...query, search: e.target.value, page: 1 })}
                                style={{ ...inputStyle, width: 260, paddingLeft: 34, height: 36 }} />
                        </div>
                        {/* Status */}
                        <select value={query.status} onChange={e => setQuery({ ...query, status: e.target.value, page: 1 })}
                            style={{ height: 36, paddingLeft: 10, paddingRight: 28, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                            <option value="">Tất cả TT</option>
                            <option value="REQUESTED">Chưa nhận</option>
                            <option value="IN_PROGRESS">Đang QC</option>
                            <option value="COMPLETED">Hoàn tất</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ ...thStyle, ...stickyLeft(0) }}>#</th>
                                <th style={{ ...thStyle, ...stickyLeft(48, true) }}>Mã lô</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={thStyle}>Ảnh</th>
                                <th style={thStyle}>Tên thiết bị</th>
                                <th style={thStyle}>Serial/IMEI</th>
                                <th style={thStyle}>Số HĐ</th>
                                <th style={thStyle}>Khách hàng</th>
                                <th style={thStyle}>SĐT</th>
                                <th style={thStyle}>Nhân viên</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Giá thu</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Bù thêm</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Tổng</th>
                                <th style={thStyle}>Ngày mua</th>
                                <th style={{ ...thStyle, ...stickyRight }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={15} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                                    <p style={{ margin: 0 }}>Đang tải...</p>
                                </td></tr>
                            ) : allItems.length === 0 ? (
                                <tr><td colSpan={15} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                                    <Package size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                                    <p style={{ margin: 0 }}>Chưa có thiết bị nào</p>
                                </td></tr>
                            ) : allItems.map(({ item, request, rowNum: rn }) => {
                                const totalPrice = (Number(item.estimatedValue) || 0) + (Number(item.otherCosts) || 0) + (Number(item.topUp) || 0);
                                const isLoading_ = actionLoadingId === request.id;
                                return (
                                    <tr key={item.id} style={{ background: '#fff' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                                        <td style={{ ...tdStyle, ...stickyLeft(0), color: '#94a3b8', fontSize: 12, width: 48 }}>{rn}</td>
                                        <td style={{ ...tdStyle, ...stickyLeft(48, true) }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>{request.code}</span>
                                        </td>
                                        <td style={tdStyle}>{statusBadge(request.status)}</td>
                                        <td style={tdStyle}>
                                            {item.imageUrl ? (
                                                <img src={resolveImageUrl(item.imageUrl)} alt={item.modelName}
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                            ) : (
                                                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                    <Package size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 180 }}>
                                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.modelName}</span>
                                        </td>
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{item.serialNumber || '—'}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{item.contractNumber || '—'}</td>
                                        <td style={tdStyle}>{item.sourceCustomerName || '—'}</td>
                                        <td style={{ ...tdStyle, fontSize: 12 }}>{item.sourceCustomerPhone || '—'}</td>
                                        <td style={{ ...tdStyle, fontSize: 12 }}>{item.employeeName || '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#6366f1', fontWeight: 700 }}>{item.estimatedValue ? fmt(item.estimatedValue) : '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#f97316', fontWeight: 600 }}>{item.topUp ? fmt(item.topUp) : '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: '#0f172a', minWidth: 110 }}>{totalPrice > 0 ? fmt(totalPrice) + ' đ' : '—'}</td>
                                        <td style={{ ...tdStyle, fontSize: 12, color: '#64748b' }}>{fmtDate(item.purchaseDate)}</td>
                                        <td style={{ ...tdStyle, ...stickyRight }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => setEditingItem(item)}
                                                    style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid #c7d2fe', background: '#f0f4ff', fontSize: 12, fontWeight: 700, color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Edit2 size={12} /> Sửa
                                                </button>
                                                {request.status === 'REQUESTED' && (
                                                    <button onClick={() => receiveItemsMutation.mutate(request.id)} disabled={isLoading_}
                                                        style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#f97316)', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: isLoading_ ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                                                        {isLoading_ ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Nhận hàng'}
                                                    </button>
                                                )}
                                                {request.status === 'IN_PROGRESS' && (
                                                    <button onClick={() => completeQCMutation.mutate(request.id)} disabled={isLoading_}
                                                        style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#10b981,#16a34a)', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: isLoading_ ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                                                        {isLoading_ ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Nhập kho'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {(pagination.totalPages || 1) > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={() => setQuery(q => ({ ...q, page: Math.max(1, q.page - 1) }))} disabled={query.page <= 1}
                            style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: query.page <= 1 ? 0.4 : 1 }}>
                            ← Trước
                        </button>
                        <span style={{ padding: '6px 14px', fontSize: 13, color: '#64748b' }}>
                            {query.page} / {pagination.totalPages}
                        </span>
                        <button onClick={() => setQuery(q => ({ ...q, page: Math.min(pagination.totalPages || 1, q.page + 1) }))} disabled={query.page >= (pagination.totalPages || 1)}
                            style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: query.page >= (pagination.totalPages || 1) ? 0.4 : 1 }}>
                            Sau →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
