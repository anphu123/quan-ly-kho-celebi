import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building, User, CheckCircle, Clock,
    Package, ScanLine, Save, AlertCircle, Play
} from 'lucide-react';

import { inboundApi, type InboundRequest, type InboundItem, type ReceiveItem } from '../../api/inbound.api';
import { attributesApi, type AttributeGroup } from '../../api/attributes.api';

export default function InboundDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inbound, setInbound] = useState<InboundRequest | null>(null);
    const [error, setError] = useState('');

    // Receiving process state
    const [receiveData, setReceiveData] = useState<Record<string, ReceiveItem>>({});

    // QC Modal state
    const [activeQCItem, setActiveQCItem] = useState<InboundItem | null>(null);
    const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
    const [qcFormData, setQcFormData] = useState<any>({}); // Form values for the modal

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (reqId: string) => {
        try {
            setLoading(true);
            const data = await inboundApi.getRequestById(reqId);
            setInbound(data);
        } catch (err: any) {
            setError('Không thể tải dữ liệu phiếu nhập kho.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartReceiving = async () => {
        if (!inbound) return;
        try {
            setSubmitting(true);
            const updated = await inboundApi.startReceiving(inbound.id);
            setInbound(updated);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi bắt đầu nhận hàng');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenQCModal = async (item: InboundItem) => {
        setActiveQCItem(item);

        // Check if we already have drafted receive data for this item
        const existingData = receiveData[item.id];
        setQcFormData({
            purchasePrice: existingData?.purchasePrice || item.estimatedValue || 0,
            condition: existingData?.condition || item.condition || 'Tốt',
            serialNumber: existingData?.serialNumber || item.serialNumber || '',
            binLocation: existingData?.binLocation || '',
            notes: existingData?.notes || item.notes || '',
            customAttributes: existingData?.customAttributes || {}
        });

        try {
            // Fetch dynamic attributes for this category
            const groups = await attributesApi.getGroupsByCategory(item.categoryId);
            setAttributeGroups(groups);
        } catch (err) {
            console.error('Lỗi khi tải thuộc tính động', err);
        }
    };

    const handleSaveQC = () => {
        if (!activeQCItem) return;

        // Convert flat form customAttributes to the array format expected by the API
        const customAttrArray = Object.keys(qcFormData.customAttributes || {}).map(attrId => ({
            attributeId: attrId,
            value: qcFormData.customAttributes[attrId]
        }));

        const receivedItem: ReceiveItem = {
            inboundItemId: activeQCItem.id,
            purchasePrice: Number(qcFormData.purchasePrice),
            condition: qcFormData.condition,
            serialNumber: qcFormData.serialNumber || undefined,
            binLocation: qcFormData.binLocation || undefined,
            notes: qcFormData.notes || undefined,
            customAttributes: customAttrArray as any
        };

        setReceiveData(prev => ({ ...prev, [activeQCItem.id]: receivedItem }));
        setActiveQCItem(null); // Close modal
    };

    const handleCompleteInbound = async () => {
        if (!inbound) return;

        const itemsToSubmit = Object.values(receiveData);
        if (itemsToSubmit.length === 0) {
            alert("Vui lòng thực hiện QC và nhận ít nhất 1 sản phẩm.");
            return;
        }

        try {
            setSubmitting(true);
            const totalActual = itemsToSubmit.reduce((sum, item) => sum + Number(item.purchasePrice), 0);

            const updated = await inboundApi.completeInbound({
                inboundRequestId: inbound.id,
                items: itemsToSubmit,
                totalActualValue: totalActual
            });
            setInbound(updated);
            alert("Đã nhận hàng thành công!");
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi hoàn thành phiếu nhập');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: '#64748b', fontWeight: 600 }}>Đang tải...</div>;
    if (!inbound) return <div style={{ padding: '2rem', color: '#e11d48' }}>{error}</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '6rem' }}>

            {/* ─── Header ─── */}
            <div className="page-header">
                <div>
                    <button
                        onClick={() => navigate('/inbound')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: 'white', border: '1.5px solid #e2e8f0',
                            borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.75rem', color: '#64748b',
                            cursor: 'pointer', marginBottom: '0.875rem'
                        }}
                    >
                        <ArrowLeft size={14} /> Quay lại
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <h1 className="page-title" style={{ marginBottom: 0 }}>{inbound.code}</h1>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                            background: inbound.status === 'COMPLETED' ? '#d1fae5' : inbound.status === 'IN_PROGRESS' ? '#fef3c7' : '#dbeafe',
                            color: inbound.status === 'COMPLETED' ? '#065f46' : inbound.status === 'IN_PROGRESS' ? '#92400e' : '#1e40af'
                        }}>
                            {inboundApi.getStatusBadge(inbound.status)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {inbound.status === 'REQUESTED' && (
                        <button
                            onClick={handleStartReceiving}
                            disabled={submitting}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', background: '#4f46e5', color: 'white',
                                borderRadius: '0.875rem', fontWeight: 700, fontSize: '0.875rem',
                                border: 'none', cursor: 'pointer', opacity: submitting ? 0.5 : 1
                            }}
                        >
                            <Play size={16} /> Bắt đầu kiểm hàng (QC)
                        </button>
                    )}

                    {inbound.status === 'IN_PROGRESS' && (
                        <button
                            onClick={handleCompleteInbound}
                            disabled={submitting}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', background: '#10b981', color: 'white',
                                borderRadius: '0.875rem', fontWeight: 700, fontSize: '0.875rem',
                                border: 'none', cursor: 'pointer', opacity: submitting ? 0.5 : 1
                            }}
                        >
                            <CheckCircle size={16} /> Hoàn thành phiếu nhập
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="error-box" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} style={{ color: '#e11d48' }} />
                    <p>{error}</p>
                </div>
            )}

            {/* ─── Main Grid ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* INFO COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Warehouse card */}
                    <div className="table-card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={15} style={{ color: '#4f46e5' }} /> Điểm nhận hàng
                        </h3>
                        <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>{inbound.warehouse.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Mã kho: {inbound.warehouse.code}</div>
                        </div>
                    </div>

                    {/* Supplier card */}
                    <div className="table-card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={15} style={{ color: '#4f46e5' }} /> Nguồn cung ứng
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
                            {[
                                { label: 'Đối tác', val: inbound.supplierName, bold: true },
                                { label: 'Hình thức', val: inboundApi.getSupplierTypeLabel(inbound.supplierType), bold: false },
                                ...(inbound.supplierPhone ? [{ label: 'SĐT', val: inbound.supplierPhone, bold: false }] : []),
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ color: '#94a3b8', flexShrink: 0 }}>{row.label}:</span>
                                    <span style={{ fontWeight: row.bold ? 800 : 600, color: '#0f172a', textAlign: 'right' }}>{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ITEMS LIST COLUMN */}
                <div>
                    <div className="table-card">
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                            <h3 style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                                <Package size={17} style={{ color: '#4f46e5' }} /> Danh sách Sản phẩm
                            </h3>
                            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>{inbound.items.length} thiết bị</span>
                        </div>

                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {inbound.items.map((item, index) => {
                                const draft = receiveData[item.id];
                                const isReceived = inbound.status === 'COMPLETED' ? item.isReceived : !!draft;

                                return (
                                    <div key={item.id} style={{
                                        display: 'flex', gap: '1rem', padding: '1rem 1.125rem',
                                        borderRadius: '1rem', border: '1.5px solid #f1f5f9',
                                        background: 'white', transition: 'border-color 0.2s',
                                    }}>
                                        {/* Index badge */}
                                        <div style={{
                                            width: '2.5rem', height: '2.5rem', background: '#eef2ff', borderRadius: '0.75rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#4f46e5', fontWeight: 900, fontSize: '1rem', flexShrink: 0
                                        }}>
                                            {index + 1}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Top row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{item.modelName}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                        <span style={{ background: '#f1f5f9', padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontWeight: 700 }}>{item.category.name}</span>
                                                        <span>{item.brand?.name || 'No Brand'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                                                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9375rem' }}>
                                                        {inboundApi.formatCurrency(draft?.purchasePrice || item.estimatedValue)}
                                                    </div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.125rem' }}>Giá thu mua</div>
                                                </div>
                                            </div>

                                            {/* Serial / Condition row */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f8fafc' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Số Serial / IMEI</div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#334155', fontWeight: 700 }}>{draft?.serialNumber || item.serialNumber || '—'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Tình trạng (Phân loại)</div>
                                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>{draft?.condition || item.condition || 'Chưa phân loại'}</div>
                                                </div>
                                            </div>

                                            {/* QC Action row */}
                                            <div style={{ marginTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {isReceived ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>
                                                        <CheckCircle size={13} /> Đã kiểm
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>
                                                        <Clock size={13} /> Chờ kiểm QC
                                                    </span>
                                                )}

                                                {inbound.status === 'IN_PROGRESS' && (
                                                    <button
                                                        onClick={() => handleOpenQCModal(item)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                                            padding: '0.5rem 1rem', borderRadius: '0.75rem',
                                                            fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                                                            background: isReceived ? '#f1f5f9' : '#eef2ff',
                                                            color: isReceived ? '#475569' : '#4338ca',
                                                        }}
                                                    >
                                                        <ScanLine size={15} />
                                                        {isReceived ? 'Chỉnh sửa' : 'Thực hiện QC'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── QC MODAL ─── */}
            {activeQCItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
                    <div style={{ background: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}>

                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ScanLine style={{ color: '#4f46e5' }} size={20} />
                                    Thẩm định: {activeQCItem.modelName}
                                </h3>
                                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>Cập nhật thông số thực tế và chốt giá thu mua</p>
                            </div>
                            <button
                                onClick={() => setActiveQCItem(null)}
                                style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontSize: '1.125rem' }}
                                onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Basic Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-field">
                                    <label className="form-label">Serial / IMEI</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Quét mã vạch hoặc nhập tay..."
                                        value={qcFormData.serialNumber}
                                        onChange={e => setQcFormData({ ...qcFormData, serialNumber: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Giá thu mua (VNĐ) <span style={{ color: '#e11d48' }}>*</span></label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ fontWeight: 700, color: '#16a34a' }}
                                        value={qcFormData.purchasePrice}
                                        onChange={e => setQcFormData({ ...qcFormData, purchasePrice: e.target.value })}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Dự kiến: {inboundApi.formatCurrency(activeQCItem.estimatedValue)}</p>
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Vị trí đặt (Bin)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="VD: A-1-05"
                                        value={qcFormData.binLocation}
                                        onChange={e => setQcFormData({ ...qcFormData, binLocation: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Phân loại (Grade)</label>
                                    <select
                                        className="form-input"
                                        style={{ cursor: 'pointer' }}
                                        value={qcFormData.condition}
                                        onChange={e => setQcFormData({ ...qcFormData, condition: e.target.value })}
                                    >
                                        <option value="Tốt">Grade A — Mới / Rất đẹp</option>
                                        <option value="Khá">Grade B — Khá / Xước nhẹ</option>
                                        <option value="Cần sửa chữa">Grade C — Cần sửa chữa</option>
                                        <option value="Hỏng nặng">Grade D — Hỏng / Lấy linh kiện</option>
                                    </select>
                                </div>
                            </div>

                            {/* Custom Attributes (Dynamic) */}
                            {attributeGroups.map(group => (
                                <div key={group.id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                                    <h4 style={{ fontWeight: 700, color: '#334155', marginBottom: '1rem', fontSize: '0.875rem' }}>{group.name}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                        {group.attributes.map(attr => (
                                            <div key={attr.id} className="form-field">
                                                <label className="form-label">{attr.name} {attr.isRequired && <span style={{ color: '#e11d48' }}>*</span>}</label>

                                                {(attr.type === 'TEXT' || attr.type === 'NUMBER' || attr.type === 'DECIMAL') && (
                                                    <input
                                                        type={attr.type === 'TEXT' ? 'text' : 'number'}
                                                        className="form-input"
                                                        placeholder={`Nhập ${attr.name.toLowerCase()}...`}
                                                        value={qcFormData.customAttributes?.[attr.id] || ''}
                                                        onChange={e => setQcFormData({
                                                            ...qcFormData,
                                                            customAttributes: { ...qcFormData.customAttributes, [attr.id]: e.target.value }
                                                        })}
                                                    />
                                                )}

                                                {attr.type === 'BOOLEAN' && (
                                                    <select
                                                        className="form-input"
                                                        style={{ cursor: 'pointer' }}
                                                        value={qcFormData.customAttributes?.[attr.id] || ''}
                                                        onChange={e => setQcFormData({
                                                            ...qcFormData,
                                                            customAttributes: { ...qcFormData.customAttributes, [attr.id]: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">-- Chọn --</option>
                                                        <option value="true">Có</option>
                                                        <option value="false">Không</option>
                                                    </select>
                                                )}

                                                {attr.type === 'SELECT' && (
                                                    <select
                                                        className="form-input"
                                                        style={{ cursor: 'pointer' }}
                                                        value={qcFormData.customAttributes?.[attr.id] || ''}
                                                        onChange={e => setQcFormData({
                                                            ...qcFormData,
                                                            customAttributes: { ...qcFormData.customAttributes, [attr.id]: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">-- Chọn --</option>
                                                        {attr.options?.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="form-field">
                                <label className="form-label">Ghi chú thẩm định chi tiết</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    style={{ resize: 'none' }}
                                    placeholder="Ví dụ: Máy bị xước nhẹ góc viền, móp lưng xíu..."
                                    value={qcFormData.notes}
                                    onChange={e => setQcFormData({ ...qcFormData, notes: e.target.value })}
                                />
                            </div>

                        </div>

                        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                            <button
                                onClick={() => setActiveQCItem(null)}
                                className="btn-cancel"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveQC}
                                className="btn-submit"
                            >
                                <Save size={16} /> Lưu &amp; Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
