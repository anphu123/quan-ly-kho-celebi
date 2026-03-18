import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, Warehouse as WarehouseIcon, Package,
    Activity, Search, MapPin, Phone, BarChart3, AlertCircle,
    CheckCircle, Clock, Wrench, DollarSign, Loader2, RefreshCw, Tag,
    Box, Filter, X, Info, ShoppingCart, Calendar, Hash, StickyNote
} from 'lucide-react';
import { warehousesApi } from '../../lib/api/warehouses.api';
import { inventoryApi, STATUS_LABELS, IN_STOCK_STATUSES, type SerialStatus } from '../../lib/api/inventory.api';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    INCOMING: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    QC_IN_PROGRESS: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    AVAILABLE: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    RESERVED: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    SOLD: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
    REFURBISHING: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
    DAMAGED: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
    RETURNED: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    DISPOSED: { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' },
};

const STATUS_ICONS: Record<string, any> = {
    INCOMING: Clock,
    QC_IN_PROGRESS: Activity,
    AVAILABLE: CheckCircle,
    RESERVED: Tag,
    SOLD: DollarSign,
    REFURBISHING: Wrench,
    DAMAGED: AlertCircle,
    RETURNED: RefreshCw,
    DISPOSED: Box,
};

export default function WarehouseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<SerialStatus | 'ALL'>('ALL');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Fetch warehouse info
    const { data: warehouse, isLoading: loadingWarehouse } = useQuery({
        queryKey: ['warehouse', id],
        queryFn: () => warehousesApi.getById(id!),
        enabled: !!id,
    });

    // Fetch ALL serial items in this warehouse (no status filter so we can show all)
    const { data: serialData, isLoading: loadingItems } = useQuery({
        queryKey: ['warehouse-items', id],
        queryFn: () => inventoryApi.getAllSerialItems({ warehouseId: id!, limit: 100 }),
        enabled: !!id,
    });

    // Fetch stats for this warehouse
    const { data: stats } = useQuery({
        queryKey: ['warehouse-stats', id],
        queryFn: () => inventoryApi.getStats(id!),
        enabled: !!id,
    });

    const allItems = serialData?.data || [];

    // Group by status
    const byStatus = allItems.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const inStockCount = allItems.filter(i => IN_STOCK_STATUSES.includes(i.status)).length;
    const totalValue = allItems.reduce((s, i) => s + (Number(i.currentCostPrice) || 0), 0);

    // Filter for display
    const filtered = allItems.filter(item => {
        const matchSearch = !search ||
            item.productTemplate?.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.internalCode?.toLowerCase().includes(search.toLowerCase()) ||
            item.serialNumber?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('vi-VN').format(v) + ' ₫';

    if (loadingWarehouse) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem' }}>
            <Loader2 size={24} style={{ color: '#4f46e5', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#64748b', fontWeight: 600 }}>Đang tải...</span>
        </div>
    );

    if (!warehouse) return (
        <div style={{ padding: '2rem', color: '#e11d48', fontWeight: 600 }}>Không tìm thấy kho hàng.</div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '6rem' }}>

            {/* ─── Header ─── */}
            <div className="page-header">
                <div>
                    <button
                        onClick={() => navigate('/warehouses')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: 'white', border: '1.5px solid #e2e8f0',
                            borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.75rem', color: '#64748b',
                            cursor: 'pointer', marginBottom: '0.875rem'
                        }}
                    >
                        <ArrowLeft size={14} /> Quay lại
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
                            background: warehouse.isActive ? '#10b981' : '#f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        }}>
                            <WarehouseIcon size={20} />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: 0 }}>{warehouse.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                <span className="sku-badge">{warehouse.code}</span>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                                    color: warehouse.isActive ? '#059669' : '#d97706',
                                    background: warehouse.isActive ? '#d1fae5' : '#fef3c7',
                                    padding: '0.2rem 0.625rem', borderRadius: '99px',
                                    border: `1px solid ${warehouse.isActive ? '#a7f3d0' : '#fde68a'}`,
                                }}>
                                    {warehouse.isActive ? '● Active' : '● Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Info + Stats row ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Warehouse info */}
                <div className="table-card" style={{ padding: '1.125rem', gridColumn: '1 / 2' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>Thông tin kho</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {warehouse.address && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <MapPin size={14} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '0.125rem' }} />
                                <span style={{ fontSize: '0.8125rem', color: '#334155' }}>{warehouse.address}</span>
                            </div>
                        )}
                        {warehouse.phone && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Phone size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{warehouse.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stat cards */}
                {[
                    { label: 'Tổng tồn kho', value: inStockCount, icon: Package, color: '#4f46e5', bg: '#eef2ff' },
                    { label: 'Sẵn sàng bán', value: byStatus['AVAILABLE'] || 0, icon: CheckCircle, color: '#059669', bg: '#dcfce7' },
                    { label: 'Tổng giá vốn', value: formatCurrency(stats?.totalCostValue ?? totalValue), icon: BarChart3, color: '#0284c7', bg: '#e0f2fe', isText: true },
                ].map(s => (
                    <div key={s.label} className="table-card" style={{ padding: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.icon size={18} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.125rem' }}>{s.label}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                                {(s as any).isText ? s.value : (s.value as number).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Status breakdown pills ─── */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button
                    onClick={() => setStatusFilter('ALL')}
                    style={{
                        padding: '0.375rem 0.875rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                        cursor: 'pointer', border: '1.5px solid',
                        background: statusFilter === 'ALL' ? '#4f46e5' : 'white',
                        color: statusFilter === 'ALL' ? 'white' : '#475569',
                        borderColor: statusFilter === 'ALL' ? '#4f46e5' : '#e2e8f0',
                    }}
                >
                    Tất cả ({allItems.length})
                </button>
                {Object.entries(byStatus).map(([status, count]) => {
                    const c = STATUS_COLORS[status] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
                    const active = statusFilter === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as SerialStatus)}
                            style={{
                                padding: '0.375rem 0.875rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                cursor: 'pointer', border: '1.5px solid',
                                background: active ? c.text : c.bg,
                                color: active ? 'white' : c.text,
                                borderColor: active ? c.text : c.border,
                            }}
                        >
                            {STATUS_LABELS[status as SerialStatus] || status} ({count})
                        </button>
                    );
                })}
            </div>

            {/* ─── Search bar ─── */}
            <div className="table-card" style={{ padding: '0.875rem 1rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên sản phẩm, mã nội bộ, số serial..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="table-search"
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                    />
                </div>
            </div>

            {/* ─── Items Table ─── */}
            <div className="table-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} style={{ color: '#4f46e5' }} /> Danh sách thiết bị
                    </h3>
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>{filtered.length} thiết bị</span>
                </div>

                {loadingItems ? (
                    <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center' }}>
                        <Loader2 size={22} style={{ color: '#4f46e5', animation: 'spin 1s linear infinite' }} />
                        <span style={{ color: '#94a3b8' }}>Đang tải thiết bị...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                        <Package size={40} style={{ color: '#e2e8f0', margin: '0 auto 1rem' }} />
                        <p style={{ fontWeight: 700, color: '#94a3b8' }}>Không có thiết bị nào</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    {['Sản phẩm', 'Mã nội bộ', 'Serial/IMEI', 'Phân hạng', 'Trạng thái', 'Vị trí', 'Giá vốn'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, i) => {
                                    const c = STATUS_COLORS[item.status] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
                                    const StatusIcon = STATUS_ICONS[item.status] || Box;
                                    return (
                                        <tr key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer', transition: 'background 0.15s' }}
                                            onMouseOver={e => (e.currentTarget.style.background = '#f0f4ff')}
                                            onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa')}
                                        >
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{item.productTemplate?.name || '—'}</div>
                                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                                                    {item.productTemplate?.category?.name} · {item.productTemplate?.brand?.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <code style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '0.125rem 0.5rem', borderRadius: '0.375rem' }}>{item.internalCode}</code>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.8125rem', color: '#334155' }}>
                                                {item.serialNumber || <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                {item.grade ? (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '0.125rem 0.5rem', borderRadius: '0.375rem' }}>
                                                        {item.grade.replace('GRADE_', 'H').replace('_', '+')}
                                                    </span>
                                                ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.625rem',
                                                    borderRadius: '99px', background: c.bg, color: c.text,
                                                    border: `1px solid ${c.border}`,
                                                }}>
                                                    <StatusIcon size={10} />
                                                    {STATUS_LABELS[item.status] || item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#475569' }}>
                                                {item.binLocation || <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontWeight: 800, color: '#059669', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                {formatCurrency(item.currentCostPrice || 0)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Render Modal */}
            {selectedItem && (
                <SerialItemModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    formatCurrency={formatCurrency}
                />
            )}
        </div>
    );
}

// ─── Serial Item Detail Modal ───────────────────────────────────────────────
function SerialItemModal({ item, onClose, formatCurrency }: { item: any; onClose: () => void; formatCurrency: (v: number) => string }) {
    const c = ({
        INCOMING: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        QC_IN_PROGRESS: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
        AVAILABLE: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
        RESERVED: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
        SOLD: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
        REFURBISHING: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
        DAMAGED: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
        RETURNED: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
        DISPOSED: { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' },
    } as Record<string, { bg: string; text: string; border: string }>)[item.status] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };


    const STATUS_LABELS: Record<string, string> = {
        INCOMING: 'Mới nhập (Chờ QC)', QC_IN_PROGRESS: 'Đang kiểm định', AVAILABLE: 'Sẵn sàng bán',
        RESERVED: 'Đã đặt cọc', SOLD: 'Đã bán', REFURBISHING: 'Đang sửa chữa',
        DAMAGED: 'Hỏng', RETURNED: 'Hàng trả về', DISPOSED: 'Đã thanh lý',
    };

    const Row = ({ icon: Icon, label, value, mono }: { icon: any; label: string; value: any; mono?: boolean }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid #f8fafc', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8125rem', flexShrink: 0 }}>
                <Icon size={13} /> {label}
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', textAlign: 'right', fontFamily: mono ? 'monospace' : undefined }}>
                {value ?? <span style={{ color: '#cbd5e1' }}>—</span>}
            </span>
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ width: '100%', maxWidth: '36rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Info size={18} style={{ color: '#4f46e5' }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', lineHeight: 1.2 }}>{item.productTemplate?.name || '—'}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{item.productTemplate?.category?.name} · {item.productTemplate?.brand?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                    {/* Status badge */}
                    <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.375rem 0.875rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                            {STATUS_LABELS[item.status as Extract<SerialStatus, string>] || item.status}
                        </span>
                        {item.grade && (
                            <span style={{ padding: '0.375rem 0.875rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                                {item.grade.replace('GRADE_', 'Hạng ').replace('_', '+')}
                            </span>
                        )}
                    </div>

                    {/* Identity section */}
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Định danh</p>
                    <Row icon={Hash} label="Mã nội bộ" value={<code style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8125rem' }}>{item.internalCode}</code>} />
                    <Row icon={Hash} label="Serial / IMEI" value={item.serialNumber} mono />

                    {/* Pricing section */}
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', marginTop: '1rem' }}>Giá cả</p>
                    <Row icon={ShoppingCart} label="Giá mua" value={formatCurrency(item.purchasePrice || 0)} />
                    <Row icon={DollarSign} label="Giá vốn hiện tại" value={<span style={{ color: '#059669' }}>{formatCurrency(item.currentCostPrice || 0)}</span>} />
                    <Row icon={BarChart3} label="Giá đề xuất" value={formatCurrency(item.suggestedPrice || 0)} />

                    {/* Logistics section */}
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', marginTop: '1rem' }}>Lưu kho</p>
                    <Row icon={MapPin} label="Vị trí bin" value={item.binLocation} />
                    <Row icon={Calendar} label="Ngày nhập" value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('vi-VN') : null} />
                    <Row icon={Tag} label="Lô hàng" value={item.purchaseBatch} />
                    <Row icon={Info} label="Nguồn" value={item.source} />

                    {/* Condition notes */}
                    {item.conditionNotes && (
                        <>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', marginTop: '1rem' }}>Ghi chú tình trạng</p>
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                                <StickyNote size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '0.125rem' }} />
                                <p style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.6 }}>{item.conditionNotes}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn-cancel">Đóng</button>
                </div>
            </div>
        </div>
    );
}
