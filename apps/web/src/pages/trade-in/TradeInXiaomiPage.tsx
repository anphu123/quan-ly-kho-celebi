import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Smartphone, Plus, Search, Clock,
    ChevronRight, RefreshCw,
    LayoutList, DollarSign, UserCheck,
    BadgeCheck, Edit2, X, Save, Upload, Image as ImageIcon,
    Filter, Calendar, Store, Package, ClipboardCheck, Loader2, Eye
} from 'lucide-react';
import { inboundApi } from '../../api/inbound.api';
import { suppliersApi } from '../../lib/api/suppliers.api';

/* ── helpers ── */
const fmt = (n?: number) => n != null ? n.toLocaleString('vi-VN') : '—';
const statusBadge = (status: string) => {
    if (status === 'COMPLETED') return <span style={badgeStyle('#dcfce7', '#166534')}><BadgeCheck size={11} /> ĐÃ NHẬP KHO</span>;
    if (status === 'IN_PROGRESS') return <span style={badgeStyle('#fef9c3', '#854d0e')}><ClipboardCheck size={11} /> CHỜ QC</span>;
    return <span style={badgeStyle('#eff6ff', '#1d4ed8')}><Clock size={11} /> CHỜ NHẬN HÀNG</span>;
};
const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px',
    borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color, letterSpacing: '0.04em', whiteSpace: 'nowrap',
});
// Sticky <th> / <td> helpers
const stickyLeft = (offsetLeft: number, shadow = false): React.CSSProperties => ({
    position: 'sticky', left: offsetLeft, zIndex: 2, background: 'inherit',
    ...(shadow ? { boxShadow: '4px 0 6px -2px rgba(0,0,0,.08)' } : {}),
});
const stickyRight: React.CSSProperties = {
    position: 'sticky', right: 0, zIndex: 2, background: 'inherit',
    boxShadow: '-4px 0 6px -2px rgba(0,0,0,.08)',
};
const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 38, borderRadius: 9, border: '1.5px solid #e2e8f0',
    fontSize: 13, paddingLeft: 12, paddingRight: 12, color: '#0f172a', outline: 'none', background: '#fff',
};

/* ────────────────── EditItemModal ────────────────── */
function EditItemModal({ item, onClose }: { item: any; onClose: () => void }) {
    const queryClient = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trade-in-requests'] });
            onClose();
        },
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setPreviewImage(dataUrl);
            setForm(p => ({ ...p, imageUrl: dataUrl }));
        };
        reader.readAsDataURL(file);
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
                {/* Modal Header */}
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

                {/* Modal Content */}
                <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Image Upload */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #e0e7ff', paddingBottom: 6 }}>📸 Hình ảnh thiết bị</p>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ width: 120, height: 120, borderRadius: 12, border: '2px dashed #c7d2fe', background: '#fafbff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                                onClick={() => fileRef.current?.click()}>
                                {previewImage ? (
                                    <img src={previewImage} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#94a3b8' }}>Hoặc nhập URL ảnh trực tiếp:</p>
                                <input type="text" name="imageUrl" value={form.imageUrl} onChange={e => { onChange(e); setPreviewImage(e.target.value); }}
                                    placeholder="https://..." style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
                            </div>
                        </div>
                    </div>

                    <Section title="📱 Thiết bị & Thu mua" color="#f97316">
                        <F label="Tên thiết bị *" name="modelName" span={2} />
                        <F label="Serial / IMEI" name="serialNumber" />
                        <F label="Loại test máy" name="notes" />
                        <F label="Số hợp đồng" name="contractNumber" />
                        <F label="Ngày mua" name="purchaseDate" type="date" />
                        <F label="Tên nhân viên thu" name="employeeName" span={2} />
                        <F label="Giá thu mua (đ)" name="estimatedValue" type="number" />
                        <F label="Chi phí khác (đ)" name="otherCosts" type="number" />
                        <F label="Topup (đ)" name="topUp" type="number" />
                        <F label="Giá sửa chữa (đ)" name="repairCost" type="number" />
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Tổng giá thu: <span style={{ fontWeight: 900, fontSize: 18, color: '#6366f1', marginLeft: 8 }}>{totalPrice.toLocaleString('vi-VN')} đ</span></p>
                        </div>
                    </Section>

                    <Section title="👤 Thông tin khách hàng" color="#10b981">
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

                {/* Modal Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        Hủy
                    </button>
                    <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,.35)', opacity: saveMutation.isPending ? 0.6 : 1 }}>
                        <Save size={14} /> {saveMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ────────────────── Main Page ────────────────── */
export default function TradeInXiaomiPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<any>(null);
    const [query, setQuery] = useState<any>({ page: 1, limit: 10, search: '', status: '', supplierId: '' });
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const receiveItemsMutation = useMutation({
        mutationFn: (requestId: string) => inboundApi.receiveItems(requestId),
        onMutate: (requestId) => setActionLoadingId(requestId),
        onSettled: () => setActionLoadingId(null),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade-in-requests'] }),
        onError: (err: any) => alert('Lỗi nhận hàng: ' + (err.response?.data?.message || err.message)),
    });

    const completeQCMutation = useMutation({
        mutationFn: (requestId: string) => inboundApi.completeQC(requestId),
        onMutate: (requestId) => setActionLoadingId(requestId),
        onSettled: () => setActionLoadingId(null),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade-in-requests'] }),
        onError: (err: any) => alert('Lỗi nhập kho: ' + (err.response?.data?.message || err.message)),
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);


    // Advanced filters
    const [filters, setFilters] = useState({
        employeeName: '',
        modelName: '',
        serialNumber: '',
        contractNumber: '',
        notes: '',
        customerName: '',
        customerPhone: '',
        customerIdCard: '',
        idCardIssuePlace: '',
        customerAddress: '',
        bankAccount: '',
        bankName: '',
        priceFrom: '',
        priceTo: '',
        itemReceived: '' // '' = all, 'true' = đã nhận, 'false' = chưa nhận
    });

    const { data: inboundData, isLoading } = useQuery({
        queryKey: ['trade-in-requests', query],
        queryFn: () => inboundApi.getAllRequests({ ...query, supplierType: 'CUSTOMER_TRADE_IN' })
    });

    const { data: suppliersData } = useQuery({
        queryKey: ['suppliers-list'],
        queryFn: () => suppliersApi.getAll({ limit: 100 })
    });
    const suppliers = suppliersData?.data || [];

    // Filter only Xiaomi stores for trade-in (Tân Phú, Bình Tân, Q7)
    const xiaomiSuppliers = suppliers.filter((s: any) =>
        s.name?.toLowerCase().includes('xiaomi')
    );

    const allRequestsRaw = inboundData?.data || [];
    
    console.log('TradeInXiaomiPage - Debug:', {
        isLoading,
        hasData: !!inboundData,
        requestsCount: allRequestsRaw.length,
        firstRequest: allRequestsRaw[0],
        firstRequestItems: allRequestsRaw[0]?.items
    });

    // Client-side flat list: flatten request → items (each request usually has 1 item for trade-in)
    const allItems: Array<{ item: any; request: any; rowNum: number }> = [];
    let rowNum = 0;
    allRequestsRaw.forEach((request: any) => {
        // Filter by supplierId (request-level)
        if (query.supplierId && request.supplierName !== xiaomiSuppliers.find((s: any) => s.id === query.supplierId)?.name) return;
        // Filter by date range (request-level)
        if (dateFrom && new Date(request.createdAt) < new Date(dateFrom)) return;
        if (dateTo && new Date(request.createdAt) > new Date(dateTo + 'T23:59:59')) return;

        const items = request.items || [];
        items.forEach((item: any) => {
            rowNum++;

            // Advanced filters (item-level fields)
            if (filters.employeeName && !item.employeeName?.toLowerCase().includes(filters.employeeName.toLowerCase())) return;
            if (filters.modelName && !item.modelName?.toLowerCase().includes(filters.modelName.toLowerCase())) return;
            if (filters.serialNumber && !item.serialNumber?.toLowerCase().includes(filters.serialNumber.toLowerCase())) return;
            if (filters.contractNumber && !item.contractNumber?.toLowerCase().includes(filters.contractNumber.toLowerCase())) return;
            if (filters.notes && !item.notes?.toLowerCase().includes(filters.notes.toLowerCase())) return;
            if (filters.customerName && !item.sourceCustomerName?.toLowerCase().includes(filters.customerName.toLowerCase())) return;
            if (filters.customerPhone && !item.sourceCustomerPhone?.includes(filters.customerPhone)) return;
            if (filters.customerIdCard && !item.sourceCustomerIdCard?.includes(filters.customerIdCard)) return;
            if (filters.idCardIssuePlace && !item.idCardIssuePlace?.toLowerCase().includes(filters.idCardIssuePlace.toLowerCase())) return;
            if (filters.customerAddress && !item.sourceCustomerAddress?.toLowerCase().includes(filters.customerAddress.toLowerCase())) return;
            if (filters.bankAccount && !item.bankAccount?.includes(filters.bankAccount)) return;
            if (filters.bankName && !item.bankName?.toLowerCase().includes(filters.bankName.toLowerCase())) return;

            // Price range filter
            const totalPrice = (Number(item.estimatedValue) || 0) + (Number(item.otherCosts) || 0) + (Number(item.topUp) || 0);
            if (filters.priceFrom && totalPrice < Number(filters.priceFrom)) return;
            if (filters.priceTo && totalPrice > Number(filters.priceTo)) return;

            // Item received status filter
            if (filters.itemReceived === 'true' && !item.isReceived) return;
            if (filters.itemReceived === 'false' && item.isReceived) return;

            allItems.push({ item, request, rowNum });
        });
    });


    const pagination = inboundData?.pagination || { total: 0, page: 1, totalPages: 1 };
    const totalValue = allItems.reduce((a, { item }) => a + (Number(item.estimatedValue) || 0) + (Number(item.otherCosts) || 0) + (Number(item.topUp) || 0), 0);
    const pendingCount = allItems.filter(({ request }) => request.status === 'REQUESTED').length;
    const completedCount = allItems.filter(({ request }) => request.status === 'COMPLETED').length;
    const totalPages = pagination.totalPages || 1;


    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Edit modal */}
            {editingItem && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} />}

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#f0f4ff,#fdf4ff)', border: '1px solid #e0e7ff', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.06em', marginBottom: 10 }}>
                        <RefreshCw size={11} /> THU CŨ ĐỔI MỚI
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        Quản lý định giá <span style={{ color: '#6366f1' }}>Xiaomi</span>
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
                        Thu cũ từ các cửa hàng Xiaomi — tổng hợp về kho hậu kiểm
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate('/trade-in-xiaomi/create-single')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,.35)' }}>
                        <Plus size={16} /> Tạo đơn trade-in
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                    { label: 'Tổng thiết bị', val: allItems.length, icon: Smartphone, grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', shadow: 'rgba(99,102,241,.25)' },
                    { label: 'Chờ nhận hàng', val: pendingCount, icon: Clock, grad: 'linear-gradient(135deg,#f59e0b,#f97316)', shadow: 'rgba(245,158,11,.25)' },
                    { label: 'Đã hoàn tất', val: completedCount, icon: BadgeCheck, grad: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,.25)' },
                    { label: 'Tổng giá trị', val: totalValue > 0 ? `${fmt(totalValue)} đ` : '—', icon: DollarSign, grad: 'linear-gradient(135deg,#ec4899,#f43f5e)', shadow: 'rgba(236,72,153,.25)' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #f1f5f9' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${s.shadow}`, flexShrink: 0 }}>
                            <s.icon size={22} color="#fff" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{isLoading ? '—' : s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table Card ── */}
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    {/* Row 1: title + search + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayoutList size={18} color="#fff" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Danh sách thiết bị thu cũ</p>
                                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>
                                    <strong style={{ color: '#6366f1' }}>{pagination.total}</strong> máy · Trang {query.page}/{totalPages}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 500, justifyContent: 'flex-end' }}>
                            {/* Search */}
                            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                                <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                <input type="text" placeholder="Tìm mã lô, IMEI, tên thiết bị..." value={query.search || ''}
                                    onChange={e => setQuery({ ...query, search: e.target.value, page: 1 })}
                                    style={{ ...inputStyle, paddingLeft: 34, height: 38 }} />
                            </div>
                            {/* Status filter */}
                            <div style={{ position: 'relative' }}>
                                <select value={query.status || ''} onChange={e => setQuery({ ...query, status: e.target.value, page: 1 })}
                                    style={{ height: 38, paddingLeft: 12, paddingRight: 30, borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', cursor: 'pointer', background: '#fff', appearance: 'none', outline: 'none' }}>
                                    <option value="">Tất cả TT</option>
                                    <option value="REQUESTED">Chưa nhận</option>
                                    <option value="IN_PROGRESS">Đang QC</option>
                                    <option value="COMPLETED">Hoàn tất</option>
                                </select>
                                <ChevronRight size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Store filter + Date range */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6366f1' }}>
                            <Filter size={13} /> Lọc thêm:
                        </div>
                        {/* Store */}
                        <div style={{ position: 'relative' }}>
                            <Store size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            <select value={query.supplierId || ''} onChange={e => setQuery({ ...query, supplierId: e.target.value, page: 1 })}
                                style={{ height: 34, paddingLeft: 28, paddingRight: 30, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, color: '#0f172a', cursor: 'pointer', background: '#fff', appearance: 'none', outline: 'none' }}>
                                <option value="">Tất cả Store Xiaomi</option>
                                {xiaomiSuppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <ChevronRight size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                        </div>
                        {/* Item received status */}
                        <div style={{ position: 'relative' }}>
                            <BadgeCheck size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            <select value={filters.itemReceived} onChange={e => setFilters({ ...filters, itemReceived: e.target.value })}
                                style={{ height: 34, paddingLeft: 28, paddingRight: 30, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, color: '#0f172a', cursor: 'pointer', background: '#fff', appearance: 'none', outline: 'none' }}>
                                <option value="">TT nhận hàng</option>
                                <option value="true">✓ Đã nhận</option>
                                <option value="false">⏳ Chưa nhận</option>
                            </select>
                            <ChevronRight size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                        </div>
                        {/* Date from */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color="#94a3b8" />
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                style={{ height: 34, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, paddingLeft: 8, paddingRight: 8, color: '#0f172a', outline: 'none' }} />
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>→</span>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                style={{ height: 34, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, paddingLeft: 8, paddingRight: 8, color: '#0f172a', outline: 'none' }} />
                        </div>
                        {/* Clear filters */}
                        {(query.supplierId || query.status || query.search || dateFrom || dateTo || Object.values(filters).some(v => v !== '')) && (
                            <button onClick={() => {
                                setQuery({ page: 1, limit: 100, search: '', status: '', supplierId: '' });
                                setDateFrom('');
                                setDateTo('');
                                setFilters({
                                    employeeName: '', modelName: '', serialNumber: '', contractNumber: '',
                                    notes: '', customerName: '', customerPhone: '', customerIdCard: '',
                                    idCardIssuePlace: '', customerAddress: '', bankAccount: '', bankName: '',
                                    priceFrom: '', priceTo: '', itemReceived: ''
                                });
                            }}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', borderRadius: 8, border: '1.5px solid #fecdd3', background: '#fff1f2', fontSize: 12, fontWeight: 700, color: '#be123c', cursor: 'pointer' }}>
                                <X size={12} /> Xóa bộ lọc
                            </button>
                        )}

                        {/* Toggle advanced filters */}
                        <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: showAdvancedFilters ? '#eef2ff' : '#fff', fontSize: 12, fontWeight: 700, color: '#4338ca', cursor: 'pointer' }}>
                            <ChevronRight size={12} style={{ transform: showAdvancedFilters ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }} />
                            {showAdvancedFilters ? 'Ẩn' : 'Hiện'} bộ lọc nâng cao
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div style={{ marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tên thiết bị</label>
                                    <input type="text" placeholder="Tìm tên thiết bị..." value={filters.modelName}
                                        onChange={e => setFilters({ ...filters, modelName: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>IMEI/Serial</label>
                                    <input type="text" placeholder="Tìm IMEI/Serial..." value={filters.serialNumber}
                                        onChange={e => setFilters({ ...filters, serialNumber: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Số HĐ</label>
                                    <input type="text" placeholder="Số hợp đồng..." value={filters.contractNumber}
                                        onChange={e => setFilters({ ...filters, contractNumber: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nhân viên</label>
                                    <input type="text" placeholder="Tên nhân viên..." value={filters.employeeName}
                                        onChange={e => setFilters({ ...filters, employeeName: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tên khách hàng</label>
                                    <input type="text" placeholder="Tìm tên KH..." value={filters.customerName}
                                        onChange={e => setFilters({ ...filters, customerName: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SĐT khách hàng</label>
                                    <input type="text" placeholder="Số điện thoại..." value={filters.customerPhone}
                                        onChange={e => setFilters({ ...filters, customerPhone: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CCCD</label>
                                    <input type="text" placeholder="Số CCCD..." value={filters.customerIdCard}
                                        onChange={e => setFilters({ ...filters, customerIdCard: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nơi cấp CCCD</label>
                                    <input type="text" placeholder="Nơi cấp..." value={filters.idCardIssuePlace}
                                        onChange={e => setFilters({ ...filters, idCardIssuePlace: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Địa chỉ KH</label>
                                    <input type="text" placeholder="Địa chỉ..." value={filters.customerAddress}
                                        onChange={e => setFilters({ ...filters, customerAddress: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>STK Ngân hàng</label>
                                    <input type="text" placeholder="Số tài khoản..." value={filters.bankAccount}
                                        onChange={e => setFilters({ ...filters, bankAccount: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tên ngân hàng</label>
                                    <input type="text" placeholder="Ngân hàng..." value={filters.bankName}
                                        onChange={e => setFilters({ ...filters, bankName: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Loại test/Ghi chú</label>
                                    <input type="text" placeholder="Tìm trong ghi chú..." value={filters.notes}
                                        onChange={e => setFilters({ ...filters, notes: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Giá từ (VNĐ)</label>
                                    <input type="number" placeholder="0" value={filters.priceFrom}
                                        onChange={e => setFilters({ ...filters, priceFrom: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Giá đến (VNĐ)</label>
                                    <input type="number" placeholder="9999999999" value={filters.priceTo}
                                        onChange={e => setFilters({ ...filters, priceTo: e.target.value })}
                                        style={{ ...inputStyle, height: 34, fontSize: 12 }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Đang tải dữ liệu...</div>
                    ) : allItems.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Smartphone size={28} color="#cbd5e1" />
                            </div>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#64748b' }}>Không có kết quả</p>
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>Thử thay đổi bộ lọc hoặc tạo Trade-in mới</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    {/* Sticky left columns */}
                                    <th style={{ ...stickyLeft(0), padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', background: '#f8fafc' }}>#</th>
                                    <th style={{ ...stickyLeft(40), padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', background: '#f8fafc' }}>Ảnh</th>
                                    <th style={{ ...stickyLeft(100, true), padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', background: '#f8fafc' }}>Thiết bị</th>
                                    {/* Scrollable columns */}
                                    {['Store / Kho', 'Số HĐ', 'Ngày', 'NV', 'IMEI', 'Loại test', 'Giá thu', 'CP khác', 'Topup', 'Tổng', 'Giá SC', 'Khách hàng', 'ĐT', 'CCCD', 'Ngày cấp', 'Nơi cấp', 'ĐC', 'STK NH', 'Ngân hàng', 'TT'].map(h => (
                                        <th key={h} style={{ padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                    {/* Sticky right: Actions */}
                                    <th style={{ ...stickyRight, padding: '11px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', background: '#f8fafc' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allItems.map(({ item, request, rowNum: rn }: { item: any; request: any; rowNum: number }, i: number) => {
                                    const rowBg = i % 2 === 0 ? '#fff' : '#fafaff';
                                    const isLoading = actionLoadingId === request.id;
                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: rowBg, transition: 'background .1s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                                            onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                                        >
                                            {/* Sticky left: # */}
                                            <td style={{ ...stickyLeft(0), padding: '10px 12px', color: '#94a3b8', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>{rn}</td>
                                            {/* Sticky left: Ảnh */}
                                            <td style={{ ...stickyLeft(40), padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt="device" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setEditingItem(item)} />
                                                ) : (
                                                    <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setEditingItem(item)}>
                                                        <ImageIcon size={16} color="#94a3b8" />
                                                    </div>
                                                )}
                                            </td>
                                            {/* Sticky left: Thiết bị */}
                                            <td style={{ ...stickyLeft(100, true), padding: '10px 12px', whiteSpace: 'nowrap', minWidth: 160 }}>
                                                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{item.modelName}</span>
                                            </td>
                                            {/* Scrollable columns */}

                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 12, display: 'block' }}>{request.supplierName}</span>
                                                <span style={{ fontSize: 11, color: '#6366f1', background: '#eef2ff', padding: '1px 6px', borderRadius: 4 }}>Kho: {request.warehouse?.name || '—'}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.contractNumber || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('vi-VN') : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.employeeName || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>{item.serialNumber || '—'}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#64748b', fontSize: 12 }}>{item.notes || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{item.estimatedValue ? fmt(Number(item.estimatedValue)) + ' đ' : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.otherCosts ? fmt(Number(item.otherCosts)) + ' đ' : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.topUp ? fmt(Number(item.topUp)) + ' đ' : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontWeight: 800, color: '#6366f1', fontSize: 13 }}>{fmt((Number(item.estimatedValue) || 0) + (Number(item.otherCosts) || 0) + (Number(item.topUp) || 0))} đ</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#f43f5e', fontSize: 12, fontWeight: 600 }}>{item.repairCost ? fmt(Number(item.repairCost)) + ' đ' : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#0f172a', fontSize: 12 }}><UserCheck size={13} color="#6366f1" />{item.sourceCustomerName || '—'}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{item.sourceCustomerPhone || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{item.sourceCustomerIdCard || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.idCardIssueDate ? new Date(item.idCardIssueDate).toLocaleDateString('vi-VN') : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.idCardIssuePlace || '—'}</td>
                                            <td style={{ padding: '10px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b', fontSize: 12 }} title={item.sourceCustomerAddress || ''}>{item.sourceCustomerAddress || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{item.bankAccount || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{item.bankName || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{new Date(request.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{statusBadge(request.status)}</td>
                                            {/* Sticky right: Actions */}
                                            <td style={{ ...stickyRight, padding: '10px 12px', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                    {request.status === 'REQUESTED' && (
                                                        <button
                                                            onClick={() => receiveItemsMutation.mutate(request.id)}
                                                            disabled={isLoading}
                                                            title="Xác nhận đã nhận hàng"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                                            {isLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Package size={12} />}
                                                            Nhận hàng
                                                        </button>
                                                    )}
                                                    {request.status === 'IN_PROGRESS' && (
                                                        <button
                                                            onClick={() => completeQCMutation.mutate(request.id)}
                                                            disabled={isLoading}
                                                            title="Hoàn tất QC và nhập kho"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                                            {isLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <ClipboardCheck size={12} />}
                                                            Nhập kho
                                                        </button>
                                                    )}
                                                    <button onClick={() => navigate(`/trade-in-xiaomi/${request.id}`)} title="Xem chi tiết"
                                                        style={{ width: 30, height: 30, borderRadius: 7, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                                                        <Eye size={13} />
                                                    </button>
                                                    <button onClick={() => setEditingItem(item)} title="Chỉnh sửa"
                                                        style={{ width: 30, height: 30, borderRadius: 7, background: '#f0f4ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6366f1' }}>
                                                        <Edit2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination controls */}
                {
                    totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbff' }}>
                            <span style={{ fontSize: 13, color: '#64748b' }}>
                                Trang <strong>{query.page}</strong> / <strong style={{ color: '#6366f1' }}>{totalPages}</strong> · Tổng <strong>{pagination.total}</strong> đơn
                            </span>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <button
                                    onClick={() => setQuery((q: any) => ({ ...q, page: Math.max(1, q.page - 1) }))}
                                    disabled={query.page === 1}
                                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: query.page === 1 ? '#f8fafc' : '#fff', fontSize: 13, fontWeight: 700, color: query.page === 1 ? '#cbd5e1' : '#475569', cursor: query.page === 1 ? 'default' : 'pointer' }}>
                                    ← Trước
                                </button>
                                {Array.from({ length: totalPages }, (_: unknown, i: number) => i + 1)
                                    .filter((p: number) => p === 1 || p === totalPages || Math.abs(p - query.page) <= 2)
                                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                        acc.push(p); return acc;
                                    }, [])
                                    .map((p, idx) => p === '...' ? (
                                        <span key={`dots - ${idx} `} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 13 }}>…</span>
                                    ) : (
                                        <button key={p} onClick={() => setQuery((q: any) => ({ ...q, page: p }))}
                                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid ' + (query.page === p ? '#6366f1' : '#e2e8f0'), background: query.page === p ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#fff', fontSize: 13, fontWeight: 700, color: query.page === p ? '#fff' : '#475569', cursor: 'pointer' }}>
                                            {p}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => setQuery((q: any) => ({ ...q, page: Math.min(totalPages, q.page + 1) }))}
                                    disabled={query.page === totalPages}
                                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: query.page === totalPages ? '#f8fafc' : '#fff', fontSize: 13, fontWeight: 700, color: query.page === totalPages ? '#cbd5e1' : '#475569', cursor: query.page === totalPages ? 'default' : 'pointer' }}>
                                    Sau →
                                </button>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
