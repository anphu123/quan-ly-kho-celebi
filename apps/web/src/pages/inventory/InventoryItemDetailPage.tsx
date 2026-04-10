import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, Package, Tag, Activity,
    User, DollarSign, Image as ImageIcon,
    Loader2, AlertTriangle, ChevronRight, X, ZoomIn
} from 'lucide-react';
import { inventoryApi, STATUS_LABELS, type SerialStatus, IN_STOCK_STATUSES } from '../../lib/api/inventory.api';
import { resolveImageUrl } from '../../lib/image';

const GRADE_LABELS: Record<string, string> = {
    GRADE_A_NEW: 'A+ Mới',
    GRADE_A: 'Hạng A',
    GRADE_B_PLUS: 'Hạng B+',
    GRADE_B: 'Hạng B',
    GRADE_C_PLUS: 'Hạng C+',
    GRADE_C: 'Hạng C',
    GRADE_D: 'Hạng D',
};

const STATUS_COLORS: Record<SerialStatus, { bg: string; color: string }> = {
    INCOMING:       { bg: '#fef3c7', color: '#92400e' },
    QC_IN_PROGRESS: { bg: '#ede9fe', color: '#5b21b6' },
    AVAILABLE:      { bg: '#dcfce7', color: '#166534' },
    RESERVED:       { bg: '#dbeafe', color: '#1e40af' },
    SOLD:           { bg: '#f1f5f9', color: '#475569' },
    REFURBISHING:   { bg: '#fce7f3', color: '#9d174d' },
    DAMAGED:        { bg: '#fee2e2', color: '#991b1b' },
    RETURNED:       { bg: '#fef9c3', color: '#854d0e' },
    DISPOSED:       { bg: '#f1f5f9', color: '#94a3b8' },
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
    INBOUND: 'Nhập kho',
    OUTBOUND: 'Xuất kho',
    STATUS_CHANGE: 'Đổi trạng thái',
    LOCATION_CHANGE: 'Chuyển vị trí',
    PRICE_ADJUSTMENT: 'Điều chỉnh giá',
    QC_COMPLETE: 'Hoàn tất QC',
    REFURBISHMENT: 'Sửa chữa',
    RETURN: 'Hàng trả về',
    DISPOSAL: 'Thanh lý',
};

const fmt = (n?: number) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtDateTime = (d?: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + dt.toLocaleDateString('vi-VN');
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #f1f5f9', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
        <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value || '—'}</span>
    </div>
);

const Card = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, background: '#fafbff' }}>
            <div style={{ color: '#6366f1' }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{title}</h3>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
    </div>
);

export default function InventoryItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: item, isLoading, isError } = useQuery({
        queryKey: ['serial-item', id],
        queryFn: () => inventoryApi.getById(id!),
        enabled: !!id,
    });

    const [zoomImg, setZoomImg] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
                <Loader2 size={28} className="animate-spin" style={{ color: '#6366f1' }} />
                <span style={{ color: '#94a3b8', fontSize: 14 }}>Đang tải...</span>
            </div>
        );
    }

    if (isError || !item) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
                <AlertTriangle size={28} style={{ color: '#ef4444' }} />
                <span style={{ color: '#64748b', fontSize: 14 }}>Không tìm thấy thiết bị.</span>
                <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                    Quay lại
                </button>
            </div>
        );
    }

    const statusStyle = STATUS_COLORS[item.status as SerialStatus] || { bg: '#f1f5f9', color: '#475569' };

    const daysInStock = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const isOver30Days = daysInStock >= 30 && IN_STOCK_STATUSES.includes(item.status as SerialStatus);

    return (
        <div className="animate-fade-in" style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
            >
                <ArrowLeft size={15} /> Quay lại
            </button>

            {/* Header */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.color, fontSize: 12, fontWeight: 700 }}>
                                {STATUS_LABELS[item.status as SerialStatus] || item.status}
                            </span>
                            {item.grade && (
                                <span style={{ padding: '4px 10px', borderRadius: 6, background: '#ede9fe', color: '#5b21b6', fontSize: 12, fontWeight: 700 }}>
                                    {GRADE_LABELS[item.grade] || item.grade}
                                </span>
                            )}
                        </div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{item.productTemplate?.name}</h1>
                        <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, color: '#64748b' }}>{item.productTemplate?.category?.name} · {item.productTemplate?.brand?.name}</span>
                            {item.serialNumber && (
                                <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6366f1', fontWeight: 700 }}>S/N: {item.serialNumber}</span>
                            )}
                            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#94a3b8' }}>Mã NB: {item.internalCode}</span>
                            {isOver30Days && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: '#fee2e2', color: '#e11d48', fontSize: 13, fontWeight: 700 }}>
                                    <AlertTriangle size={13} /> Lưu kho {daysInStock} ngày
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Giá vốn hiện tại', value: fmt(item.currentCostPrice), color: '#0f172a' },
                            { label: 'Giá đề xuất bán', value: fmt(item.suggestedPrice), color: '#16a34a' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>

                {/* Thông tin cơ bản */}
                <Card title="Thông tin thiết bị" icon={<Package size={16} />}>
                    <InfoRow label="Kho" value={item.warehouse?.name} />
                    <InfoRow label="Vị trí (ô/kệ)" value={item.binLocation?.name} />
                    <InfoRow label="Nguồn nhập" value={item.source} />
                    <InfoRow label="Lô nhập" value={item.purchaseBatch} />
                    <InfoRow label="Ngày nhập" value={fmtDate(item.purchaseDate)} />
                    <InfoRow label="Tình trạng" value={item.conditionNotes} />
                </Card>

                {/* Giá */}
                <Card title="Thông tin giá" icon={<DollarSign size={16} />}>
                    <InfoRow label="Giá mua" value={fmt(item.purchasePrice)} />
                    <InfoRow label="Giá vốn hiện tại" value={fmt(item.currentCostPrice)} />
                    <InfoRow label="Giá đề xuất bán" value={
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{fmt(item.suggestedPrice)}</span>
                    } />
                    <InfoRow label="Ngày tạo" value={fmtDateTime(item.createdAt)} />
                    <InfoRow label="Cập nhật lần cuối" value={fmtDateTime(item.updatedAt)} />
                </Card>

                {/* Specs động */}
                {item.dynamicSpecs?.length > 0 && (
                    <Card title="Thông số kỹ thuật" icon={<Tag size={16} />}>
                        {item.dynamicSpecs.map((spec: any) => (
                            <InfoRow key={spec.id} label={spec.attribute?.name || spec.attributeId} value={spec.value} />
                        ))}
                    </Card>
                )}

                {/* Hình ảnh */}
                {(() => {
                    const ib = item.inboundItem;
                    if (!ib) return null;
                    let deviceImgs: string[] = [];
                    if (Array.isArray(ib.deviceImages)) deviceImgs = ib.deviceImages;
                    else if (typeof ib.deviceImages === 'string' && ib.deviceImages) {
                        try { deviceImgs = JSON.parse(ib.deviceImages); } catch { deviceImgs = []; }
                    }
                    if (ib.imageUrl && !deviceImgs.includes(ib.imageUrl)) deviceImgs = [ib.imageUrl, ...deviceImgs];
                    const allImgs = Array.from(new Set(deviceImgs.filter(Boolean)));
                    const cccdImgs = [
                        ib.cccdFrontUrl ? { url: ib.cccdFrontUrl, label: 'CCCD mặt trước' } : null,
                        ib.cccdBackUrl ? { url: ib.cccdBackUrl, label: 'CCCD mặt sau' } : null,
                    ].filter(Boolean) as { url: string; label: string }[];
                    if (!allImgs.length && !cccdImgs.length) return null;
                    return (
                        <Card title="Hình ảnh" icon={<ImageIcon size={16} />}>
                            {allImgs.length > 0 && (
                                <>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '0 0 10px' }}>Ảnh thiết bị ({allImgs.length})</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: cccdImgs.length ? 16 : 0 }}>
                                        {allImgs.map((url, i) => (
                                            <div key={i} onClick={() => setZoomImg(resolveImageUrl(url))} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', height: 120, background: '#f8fafc', cursor: 'zoom-in', position: 'relative' }}>
                                                <img src={resolveImageUrl(url)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.15)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                                                    <ZoomIn size={20} color="#fff" style={{ opacity: 0.9 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {cccdImgs.length > 0 && (
                                <>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '0 0 10px' }}>CCCD</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                                        {cccdImgs.map(({ url, label }) => (
                                            <div key={url} onClick={() => setZoomImg(resolveImageUrl(url))} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'zoom-in' }}>
                                                <img src={resolveImageUrl(url)} alt={label} loading="lazy" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                                                <p style={{ margin: 0, padding: '6px 10px', fontSize: 12, fontWeight: 600, color: '#64748b', textAlign: 'center' }}>{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Card>
                    );
                })()}

                {/* Lịch sử giao dịch */}
                <Card title={`Lịch sử (${item.transactions?.length || 0})`} icon={<Activity size={16} />}>
                    {!item.transactions?.length ? (
                        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Chưa có lịch sử.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {item.transactions.map((tx: any) => (
                                <div key={tx.id} style={{ borderRadius: 10, border: '1px solid #f1f5f9', padding: '10px 14px', background: '#fafbff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>
                                            {TRANSACTION_TYPE_LABELS[tx.type] || tx.type}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDateTime(tx.createdAt)}</span>
                                    </div>
                                    {(tx.fromStatus || tx.toStatus) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 2 }}>
                                            {tx.fromStatus && <span>{STATUS_LABELS[tx.fromStatus as SerialStatus] || tx.fromStatus}</span>}
                                            {tx.fromStatus && tx.toStatus && <ChevronRight size={12} />}
                                            {tx.toStatus && <span style={{ fontWeight: 600, color: '#0f172a' }}>{STATUS_LABELS[tx.toStatus as SerialStatus] || tx.toStatus}</span>}
                                        </div>
                                    )}
                                    {tx.notes && <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{tx.notes}</p>}
                                    {tx.performedBy?.fullName && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: '#94a3b8' }}>
                                            <User size={11} /> {tx.performedBy.fullName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Zoom modal */}
            {zoomImg && (
                <div onClick={() => setZoomImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
                    <button onClick={() => setZoomImg(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                        <X size={20} />
                    </button>
                    <img src={zoomImg} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
