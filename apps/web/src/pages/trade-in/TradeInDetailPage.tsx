import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, Smartphone, User, CreditCard,
    Image as ImageIcon, CheckCircle2, Clock,
    ClipboardCheck, Activity, DollarSign, X, ZoomIn,
    Building2, FileText, Printer, Edit2, Save, XCircle, Loader2, Upload
} from 'lucide-react';
import { inboundApi, type InboundItem } from '../../api/inbound.api';
import { uploadApi } from '../../api/upload.api';
import { ProductLabel } from '../../components/inventory/ProductLabel';
import { resolveImageUrl } from '../../lib/image';


// Format currency
const fmt = (n?: number) => n != null ? n.toLocaleString('vi-VN') + ' đ' : '—';
// Format Date
const fmtDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN');
};
// Format DateTime
const fmtDateTime = (d?: string) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
};

// ─── Module-level components (tránh re-create mỗi lần render) ───────────────

const Card = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, background: '#fafbff' }}>
            <div style={{ color: '#6366f1' }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{title}</h3>
        </div>
        <div style={{ padding: 20 }}>
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, highlight = false }: { label: string; value: string | React.ReactNode; highlight?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #f1f5f9' }}>
        <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
        <span style={{ color: highlight ? '#6366f1' : '#0f172a', fontSize: 13, fontWeight: highlight ? 700 : 500, textAlign: 'right', maxWidth: '60%' }}>
            {value || '—'}
        </span>
    </div>
);

const ImgPreview = ({ url, label, onZoom }: { url: string; label: string; onZoom: (url: string, title: string) => void }) => {
    const resolvedUrl = resolveImageUrl(url);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{label}</span>
            {url ? (
                <div
                    onClick={() => onZoom(resolvedUrl, label)}
                    style={{
                        display: 'block', borderRadius: 12, overflow: 'hidden',
                        border: '1px solid #e2e8f0', height: 160, width: '100%',
                        background: '#f8fafc', cursor: 'pointer', position: 'relative',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <img
                        src={resolvedUrl}
                        alt={label}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(0,0,0,0.6)', borderRadius: 8,
                        padding: 6, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ZoomIn size={16} />
                    </div>
                </div>
            ) : (
                <div style={{ height: 160, borderRadius: 12, border: '1px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 8 }}>
                    <ImageIcon size={32} strokeWidth={1.5} />
                    <span style={{ fontSize: 12 }}>Chưa có ảnh</span>
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────

const statusConfig = {
    'COMPLETED': { icon: <CheckCircle2 size={16} />, color: '#16a34a', bg: '#dcfce7', label: 'Hoàn tất nhập kho' },
    'IN_PROGRESS': { icon: <ClipboardCheck size={16} />, color: '#ca8a04', bg: '#fef9c3', label: 'Đang chờ QC' },
    'REQUESTED': { icon: <Clock size={16} />, color: '#2563eb', bg: '#dbeafe', label: 'Chờ nhận hàng' },
};

export default function TradeInDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [imageModal, setImageModal] = useState<{ url: string; title: string } | null>(null);
    const [showAllImages, setShowAllImages] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<InboundItem>>({});
    const [showLabel, setShowLabel] = useState(false);
    const [isUploadingDeviceImages, setIsUploadingDeviceImages] = useState(false);
    const [isUploadingCccdFront, setIsUploadingCccdFront] = useState(false);
    const [isUploadingCccdBack, setIsUploadingCccdBack] = useState(false);


    const { data: request, isLoading, isError, error } = useQuery({
        queryKey: ['trade-in-item', id],
        queryFn: () => inboundApi.getRequestById(id!),
        enabled: !!id
    });

    const receiveMutation = useMutation({
        mutationFn: () => inboundApi.receiveItems(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trade-in-item', id] });
            alert('Đã nhận hàng thành công. Chuyển sang trạng thái Đang chờ QC.');
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || 'Lỗi khi nhận hàng');
        }
    });

    const completeMutation = useMutation({
        mutationFn: (notes?: string) => inboundApi.completeQC(id!, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trade-in-item', id] });
            alert('Đã hoàn tất nhập kho thành công!');
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi nhập kho';
            console.error('Complete QC Error:', err);
            alert('Lỗi nhập kho: ' + errorMsg);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<InboundItem>) => {
            const itemId = request?.items?.[0]?.id;
            if (!itemId) throw new Error('Item ID not found');
            return inboundApi.updateItem(itemId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trade-in-item', id] });
            setIsEditing(false);
            alert('Cập nhật thông tin thành công!');
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || 'Lỗi khi cập nhật');
        }
    });

    useEffect(() => {
        if (showLabel) {
            window.print();
            setShowLabel(false);
        }
    }, [showLabel]);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b', fontSize: 16 }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}>⏳</div>
                <div>Đang tải dữ liệu đơn...</div>
            </div>
        </div>;
    }

    if (isError || !request || !request.items || request.items.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#ef4444', fontSize: 16 }}>
            <div style={{ textAlign: 'center', maxWidth: 500, padding: 20 }}>
                <div style={{ marginBottom: 12, fontSize: 32 }}>❌</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Lỗi khi tải dữ liệu đơn</div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    {error ? (error as any)?.response?.data?.message || (error as any)?.message || 'Không thể tải dữ liệu' : 'Không tìm thấy dữ liệu'}
                </div>
                <button
                    onClick={() => navigate('/trade-in-xiaomi')}
                    style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                    Quay lại danh sách
                </button>
            </div>
        </div>;
    }

    // Now safe to destructure - request is guaranteed to exist here
    // Request-level fields
    const { code, status, warehouse, createdAt, receivedBy, updatedAt } = request!;

    // Item-level fields (trade-in requests typically have 1 item)
    const item = request!.items[0];
    const {
        modelName, serialNumber,
        notes, contractNumber, purchaseDate, employeeName,
        sourceCustomerName, sourceCustomerPhone, sourceCustomerAddress,
        sourceCustomerIdCard, idCardIssueDate, idCardIssuePlace,
        bankAccount, bankName,
        estimatedValue, otherCosts, topUp, repairCost,
        imageUrl, deviceImages, cccdFrontUrl, cccdBackUrl,
        receivedAt,
        serialItem,
    } = item;

    const currentImageUrl = isEditing ? editForm.imageUrl : imageUrl;
    const currentDeviceImages = isEditing ? editForm.deviceImages : deviceImages;
    const currentCccdFrontUrl = isEditing ? editForm.cccdFrontUrl : cccdFrontUrl;
    const currentCccdBackUrl = isEditing ? editForm.cccdBackUrl : cccdBackUrl;

    const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig['REQUESTED'];
    const totalCost = (Number(estimatedValue) || 0) + (Number(otherCosts) || 0) + (Number(topUp) || 0);

    let parsedDeviceImages: string[] = [];
    if (Array.isArray(currentDeviceImages)) {
        parsedDeviceImages = currentDeviceImages as unknown as string[];
    } else if (typeof currentDeviceImages === 'string' && currentDeviceImages.trim() !== '') {
        try {
            const parsed = JSON.parse(currentDeviceImages);
            if (Array.isArray(parsed)) {
                parsedDeviceImages = parsed;
            }
        } catch (e) {
            console.error('Invalid deviceImages JSON in TradeInDetailPage', { deviceImages, error: e });
            parsedDeviceImages = [];
        }
    }

    const list = [currentImageUrl, ...parsedDeviceImages].filter(Boolean) as string[];
    const unique = new Set<string>();
    list.forEach((u) => unique.add(u));
    const allDeviceImages = Array.from(unique);

    const visibleDeviceImages = showAllImages ? allDeviceImages : allDeviceImages.slice(0, 6);
    const remainingCount = Math.max(0, allDeviceImages.length - visibleDeviceImages.length);

    const handleEdit = () => {
        setEditForm({
            modelName: item.modelName,
            serialNumber: item.serialNumber,
            notes: item.notes,
            imageUrl: item.imageUrl,
            deviceImages: item.deviceImages,
            cccdFrontUrl: item.cccdFrontUrl,
            cccdBackUrl: item.cccdBackUrl,
            sourceCustomerName: item.sourceCustomerName,
            sourceCustomerPhone: item.sourceCustomerPhone,
            sourceCustomerAddress: item.sourceCustomerAddress,
            sourceCustomerIdCard: item.sourceCustomerIdCard,
            idCardIssueDate: item.idCardIssueDate ? item.idCardIssueDate.split('T')[0] : '',
            idCardIssuePlace: item.idCardIssuePlace,
            bankAccount: item.bankAccount,
            bankName: item.bankName,
            contractNumber: item.contractNumber,
            purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
            employeeName: item.employeeName,
            estimatedValue: item.estimatedValue || 0,
            otherCosts: item.otherCosts || 0,
            topUp: item.topUp || 0,
            repairCost: item.repairCost || 0,
        });
        setIsEditing(true);
    };

    const handleDeleteDeviceImage = (urlToDelete: string) => {
        const remaining = allDeviceImages.filter(u => u !== urlToDelete);
        setEditForm(p => ({
            ...p,
            imageUrl: remaining[0] || undefined,
            deviceImages: remaining.length > 0 ? JSON.stringify(remaining) : undefined,
        }));
    };

    const handleUploadDeviceImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setIsUploadingDeviceImages(true);
        try {
            const urls = await uploadApi.uploadImages(files);
            const merged = Array.from(new Set([...(parsedDeviceImages || []), ...urls]));
            setEditForm((p) => ({
                ...p,
                imageUrl: merged[0],
                deviceImages: JSON.stringify(merged),
            }));
        } catch (err: any) {
            alert(err?.message || 'Lỗi tải lên ảnh thiết bị');
        } finally {
            setIsUploadingDeviceImages(false);
            e.target.value = '';
        }
    };

    const handleUploadCccdFront = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingCccdFront(true);
        try {
            const url = await uploadApi.uploadImage(file);
            setEditForm((p) => ({ ...p, cccdFrontUrl: url }));
        } catch (err: any) {
            alert(err?.message || 'Lỗi tải lên CCCD mặt trước');
        } finally {
            setIsUploadingCccdFront(false);
            e.target.value = '';
        }
    };

    const handleUploadCccdBack = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingCccdBack(true);
        try {
            const url = await uploadApi.uploadImage(file);
            setEditForm((p) => ({ ...p, cccdBackUrl: url }));
        } catch (err: any) {
            alert(err?.message || 'Lỗi tải lên CCCD mặt sau');
        } finally {
            setIsUploadingCccdBack(false);
            e.target.value = '';
        }
    };

    const handleSave = () => {
        if (confirm('Xác nhận cập nhật thông tin?')) {
            updateMutation.mutate(editForm);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({});
    };

    const EditableInfoRow = ({ label, fieldName, value, type = 'text', highlight = false }: {
        label: string,
        fieldName: string,
        value: any,
        type?: 'text' | 'number' | 'date',
        highlight?: boolean
    }) => {
        if (!isEditing) {
            return <InfoRow label={label} value={type === 'number' ? fmt(value) : (type === 'date' ? fmtDate(value) : value)} highlight={highlight} />;
        }

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #f1f5f9', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                <input
                    type={type}
                    value={(editForm as Record<string, unknown>)[fieldName] as string | number || ''}
                    onChange={(e) => setEditForm({ ...editForm, [fieldName]: type === 'number' ? Number(e.target.value) : e.target.value })}
                    style={{
                        padding: '6px 10px', fontSize: 13, borderRadius: 6,
                        border: '1px solid #e2e8f0', maxWidth: '60%',
                        background: '#fff', color: '#0f172a'
                    }}
                />
            </div>
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const handlePrintLabel = () => {
        setShowLabel(true);
    };

    // Helper to parse RAM/ROM from title (fallback)
    const parseRamRom = (title: string) => {
        const ramMatch = title.match(/(\d+)\s*GB\s*RAM/i) || title.match(/RAM\s*(\d+)\s*GB/i);
        const romMatch = title.match(/(\d+)\s*GB(?!\s*RAM)/i) || title.match(/(\d+)\s*TB/i);

        return {
            ram: ramMatch ? ramMatch[0] : '',
            rom: romMatch ? romMatch[0] : ''
        };
    };

    const specs = parseRamRom(modelName || '');

    const getMissingFieldsForCompletion = () => {
        const src = isEditing ? editForm : item;
        const missing: string[] = [];

        const requiredTextFields: Array<{ key: string; label: string }> = [
            { key: 'modelName', label: 'Thiết bị' },
            { key: 'serialNumber', label: 'IMEI / Serial (sản phẩm)' },
            { key: 'notes', label: 'Ghi chú tình trạng' },
            { key: 'sourceCustomerName', label: 'Tên khách hàng' },
            { key: 'sourceCustomerPhone', label: 'Số điện thoại' },
            { key: 'sourceCustomerAddress', label: 'Địa chỉ' },
            { key: 'sourceCustomerIdCard', label: 'Số CCCD' },
            { key: 'idCardIssueDate', label: 'Ngày cấp CCCD' },
            { key: 'idCardIssuePlace', label: 'Nơi cấp CCCD' },
            { key: 'bankAccount', label: 'Số tài khoản' },
            { key: 'bankName', label: 'Ngân hàng' },
            { key: 'contractNumber', label: 'Số hợp đồng' },
            { key: 'purchaseDate', label: 'Ngày mua' },
            { key: 'employeeName', label: 'Nhân viên' },
        ];

        const requiredNumberFields: Array<{ key: string; label: string }> = [
            { key: 'estimatedValue', label: 'Giá thu mua' },
            { key: 'otherCosts', label: 'Chi phí khác' },
            { key: 'topUp', label: 'Top Up' },
            { key: 'repairCost', label: 'Giá sửa chữa khuyên dùng' },
        ];

        requiredTextFields.forEach(({ key, label }) => {
            const val = (src as any)?.[key];
            if (val == null || String(val).trim() === '') missing.push(label);
        });

        requiredNumberFields.forEach(({ key, label }) => {
            const val = (src as any)?.[key];
            if (val == null || Number.isNaN(Number(val))) missing.push(label);
        });

        const hasDeviceImages = (currentImageUrl && String(currentImageUrl).trim() !== '') || (parsedDeviceImages?.length || 0) > 0;
        if (!hasDeviceImages) missing.push('Ảnh thiết bị');
        if (!currentCccdFrontUrl) missing.push('CCCD mặt trước');
        if (!currentCccdBackUrl) missing.push('CCCD mặt sau');

        return missing;
    };

    return (
        <>
            <div style={{ padding: 'clamp(12px, 4vw, 32px)', maxWidth: 1400, margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 300 }}>
                        <button
                            onClick={() => navigate('/trade-in-xiaomi')}
                            style={{
                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                                width: 40, height: 40, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: '#64748b',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                                    {modelName}
                                </h1>
                                <div style={{
                                    background: currentStatus.bg, color: currentStatus.color,
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700
                                }}>
                                    {currentStatus.icon} {currentStatus.label}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#64748b', fontSize: 13, flexWrap: 'wrap' }}>
                                <span><span style={{ fontWeight: 600 }}>Mã:</span> {code}</span>
                                <span>•</span>
                                <span><span style={{ fontWeight: 600 }}>Ngày tạo:</span> {fmtDate(createdAt)}</span>
                                {warehouse && (
                                    <>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Building2 size={14} />
                                            {warehouse?.name || warehouse?.code}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {/* Edit Button */}
                        {!isEditing && status !== 'COMPLETED' && (
                            <button
                                onClick={handleEdit}
                                className="no-print"
                                style={{
                                    padding: '10px 20px', background: '#fff', color: '#6366f1',
                                    borderRadius: 10, fontWeight: 600, border: '1px solid #6366f1',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#6366f1';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.color = '#6366f1';
                                }}
                            >
                                <Edit2 size={18} />
                                Chỉnh sửa
                            </button>
                        )}

                        {/* Save/Cancel Buttons when editing */}
                        {isEditing && (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    style={{
                                        padding: '10px 20px',
                                        background: updateMutation.isPending ? '#94a3b8' : '#10b981',
                                        color: '#fff', borderRadius: 10, fontWeight: 600, border: 'none',
                                        cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 8
                                    }}
                                >
                                    <Save size={18} />
                                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={updateMutation.isPending}
                                    style={{
                                        padding: '10px 20px', background: '#fff', color: '#ef4444',
                                        borderRadius: 10, fontWeight: 600, border: '1px solid #ef4444',
                                        cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 8
                                    }}
                                >
                                    <XCircle size={18} />
                                    Hủy
                                </button>
                            </>
                        )}

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="no-print"
                            style={{
                                padding: '10px 20px', background: '#fff', color: '#475569',
                                borderRadius: 10, fontWeight: 600, border: '1px solid #e2e8f0',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <Printer size={18} />
                            In phiếu
                        </button>

                        {/* Label Print Button */}
                        <button
                            onClick={handlePrintLabel}
                            className="no-print"
                            style={{
                                padding: '10px 20px', background: '#6366f1', color: '#fff',
                                borderRadius: 10, fontWeight: 600, border: 'none',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
                            }}
                        >
                            <Printer size={18} />
                            In Tem A7
                        </button>
                    </div>
                </div>

                {/* Progress Stepper - New Design */}
                {status !== 'CANCELLED' && (
                    <div style={{
                        marginBottom: 32, background: '#fff', borderRadius: 16,
                        padding: '40px 60px', border: '1px solid #f1f5f9',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        position: 'relative', overflow: 'visible'
                    }}>
                        {/* Progress Line Container */}
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20
                        }}>
                            {/* Background Line */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '60px',
                                right: '60px',
                                height: '3px',
                                background: '#e5e7eb',
                                transform: 'translateY(-50%)',
                                zIndex: 1
                            }}></div>

                            {/* Active Progress Line */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '60px',
                                width: status === 'COMPLETED' ? 'calc(100% - 120px)' : status === 'IN_PROGRESS' ? 'calc(50% - 60px)' : '0%',
                                height: '3px',
                                background: '#6366f1',
                                transform: 'translateY(-50%)',
                                zIndex: 2,
                                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}></div>

                            {/* Step Circles */}
                            {[
                                { id: 'REQUESTED', label: 'Yêu Cầu', sublabel: 'Chờ tiếp nhận' },
                                { id: 'IN_PROGRESS', label: 'Đang QC', sublabel: 'Kiểm tra máy' },
                                { id: 'COMPLETED', label: 'Hoàn Tất', sublabel: 'Nhập kho' }
                            ].map((step, idx) => {
                                const stepIndex = ['REQUESTED', 'IN_PROGRESS', 'COMPLETED'].indexOf(status);
                                const isPast = stepIndex > idx;
                                const isCurrent = stepIndex === idx;
                                const isActive = isPast || isCurrent;

                                return (
                                    <div key={step.id} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1,
                                        zIndex: 3,
                                        position: 'relative'
                                    }}>
                                        {/* Circle */}
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isActive ? '#6366f1' : '#fff',
                                            border: isActive ? 'none' : '3px solid #e5e7eb',
                                            color: isActive ? '#fff' : '#9ca3af',
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            transition: 'all 0.3s ease',
                                            boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
                                            position: 'relative'
                                        }}>
                                            {isPast ? (
                                                <CheckCircle2 size={28} strokeWidth={2.5} />
                                            ) : isCurrent ? (
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: '#fff',
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                }}></div>
                                            ) : (
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: '#d1d5db'
                                                }}></div>
                                            )}
                                        </div>

                                        {/* Labels */}
                                        <div style={{
                                            marginTop: '16px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: isCurrent ? 800 : 600,
                                                color: isActive ? '#0f172a' : '#9ca3af',
                                                marginBottom: '4px',
                                                transition: 'color 0.3s ease'
                                            }}>
                                                {step.label}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: isCurrent ? '#6366f1' : '#cbd5e1',
                                                fontWeight: 500
                                            }}>
                                                {step.sublabel}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="no-print" style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                    {status === 'REQUESTED' && (
                        <button
                            onClick={() => { if (confirm('Xác nhận đã nhận máy từ khách hàng?')) receiveMutation.mutate() }}
                            disabled={receiveMutation.isPending}
                            style={{
                                padding: '12px 24px',
                                background: receiveMutation.isPending ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: '#fff', borderRadius: 12, fontWeight: 600, border: 'none',
                                cursor: receiveMutation.isPending ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10,
                                boxShadow: receiveMutation.isPending ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!receiveMutation.isPending) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = receiveMutation.isPending ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            <ClipboardCheck size={20} />
                            {receiveMutation.isPending ? 'Đang xử lý...' : 'Nhận Hàng'}
                        </button>
                    )}
                    {status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => {
                                const missing = getMissingFieldsForCompletion();
                                if (missing.length > 0) {
                                    alert(`Vui lòng hoàn thiện tất cả trường thông tin trước khi nhập kho:\n- ${missing.join('\n- ')}`);
                                    return;
                                }
                                if (confirm('Hoàn tất kiểm tra và nhập kho thiết bị này?')) completeMutation.mutate(undefined);
                            }}
                            disabled={completeMutation.isPending}
                            style={{
                                padding: '12px 24px',
                                background: completeMutation.isPending ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff', borderRadius: 12, fontWeight: 600, border: 'none',
                                cursor: completeMutation.isPending ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10,
                                boxShadow: completeMutation.isPending ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!completeMutation.isPending) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = completeMutation.isPending ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            <CheckCircle2 size={20} />
                            {completeMutation.isPending ? 'Đang xử lý...' : 'Hoàn Tất Nhập Kho'}
                        </button>
                    )}
                </div>

                {/* Content - Row Layout */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 24,
                    ...(isEditing && {
                        padding: 20,
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        borderRadius: 16,
                        border: '2px dashed #f59e0b'
                    })
                }}>

                    {isEditing && (
                        <div style={{
                            background: '#fff', padding: '12px 20px', borderRadius: 12,
                            border: '1px solid #f59e0b', display: 'flex', alignItems: 'center',
                            gap: 12, color: '#92400e', fontSize: 14, fontWeight: 600
                        }}>
                            <Edit2 size={20} />
                            <span>Chế độ chỉnh sửa - Thay đổi thông tin và nhấn "Lưu thay đổi"</span>
                        </div>
                    )}

                    {/* Row 1: Thông tin thiết bị & Định giá */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 24 }}>
                        <Card title="Thông tin thiết bị" icon={<Smartphone size={18} />}>
                            <EditableInfoRow label="Thiết bị" fieldName="modelName" value={modelName} />
                            {/* IMEI sản phẩm (người dùng nhập) */}
                            <EditableInfoRow label="IMEI / Serial (sản phẩm)" fieldName="serialNumber" value={serialNumber} highlight />
                            {/* IMEI nội bộ hệ thống sinh ra sau khi nhập kho */}
                            <InfoRow
                                label="IMEI hệ thống"
                                value={serialItem?.internalCode || '—'}
                            />
                            <InfoRow label="Kho nhận" value={warehouse?.name || warehouse?.code} />
                            <EditableInfoRow label="Ghi chú tình trạng" fieldName="notes" value={notes} />
                        </Card>

                        <Card title="Định giá & Tài chính" icon={<DollarSign size={18} />}>
                            <EditableInfoRow label="Giá thu mua" fieldName="estimatedValue" value={estimatedValue} type="number" />
                            <EditableInfoRow label="Chi phí khác" fieldName="otherCosts" value={otherCosts} type="number" />
                            <EditableInfoRow label="Top Up (+)" fieldName="topUp" value={topUp} type="number" />
                            <EditableInfoRow label="Giá sửa chữa khuyên dùng" fieldName="repairCost" value={repairCost} type="number" />
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>TỔNG CỘNG</span>
                                <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>
                                    {isEditing
                                        ? fmt((Number(editForm.estimatedValue) || 0) + (Number(editForm.otherCosts) || 0) + (Number(editForm.topUp) || 0))
                                        : fmt(totalCost)
                                    }
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Row 2: Thông tin khách hàng */}
                    <Card title="Thông tin khách hàng" icon={<User size={18} />}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 32px' }}>
                            <div>
                                <EditableInfoRow label="Tên khách hàng" fieldName="sourceCustomerName" value={sourceCustomerName} highlight />
                                <EditableInfoRow label="Số điện thoại" fieldName="sourceCustomerPhone" value={sourceCustomerPhone} />
                                <EditableInfoRow label="Địa chỉ" fieldName="sourceCustomerAddress" value={sourceCustomerAddress} />
                            </div>
                            <div>
                                <EditableInfoRow label="Số CCCD" fieldName="sourceCustomerIdCard" value={sourceCustomerIdCard} />
                                <EditableInfoRow label="Ngày cấp" fieldName="idCardIssueDate" value={idCardIssueDate} type="date" />
                                <EditableInfoRow label="Nơi cấp" fieldName="idCardIssuePlace" value={idCardIssuePlace} />
                            </div>
                        </div>
                    </Card>

                    {/* Row 3: Thanh toán & Hợp đồng */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 24 }}>
                        <Card title="Thông tin thanh toán" icon={<CreditCard size={18} />}>
                            <EditableInfoRow label="Ngân hàng" fieldName="bankName" value={bankName} />
                            <EditableInfoRow label="Số Tài Khoản" fieldName="bankAccount" value={bankAccount} highlight />
                        </Card>

                        <Card title="Thông tin hợp đồng" icon={<FileText size={18} />}>
                            <EditableInfoRow label="Số hợp đồng" fieldName="contractNumber" value={contractNumber} />
                            <EditableInfoRow label="Ngày mua" fieldName="purchaseDate" value={purchaseDate} type="date" />
                            <EditableInfoRow label="Nhân viên" fieldName="employeeName" value={employeeName} />
                        </Card>
                    </div>

                    {/* Row 4: Lịch sử & Trạng thái */}
                    <Card title="Trạng thái & Lịch sử" icon={<Activity size={18} />}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 32px' }}>
                            <InfoRow label="Ngày tạo đơn" value={fmtDateTime(createdAt)} />
                            <InfoRow label="Người tạo" value={employeeName || '—'} />
                            <InfoRow label="Ngày nhận hàng" value={receivedAt ? fmtDateTime(receivedAt) : 'Chưa nhận'} highlight={!!receivedAt} />
                            <InfoRow label="Người nhận" value={receivedBy?.fullName || '—'} />
                            <InfoRow label="Ngày nhập kho" value={status === 'COMPLETED' ? fmtDateTime(updatedAt) : 'Chưa nhập kho'} highlight={status === 'COMPLETED'} />
                            <InfoRow label="Trạng thái hiện tại" value={currentStatus.label} />
                        </div>
                    </Card>

                    {/* Row 5: Hình ảnh */}
                    <Card title="Hình ảnh thiết bị & CCCD" icon={<ImageIcon size={18} />}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                            {isEditing && (
                                <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleUploadDeviceImages} />
                                        {isUploadingDeviceImages ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {isUploadingDeviceImages ? 'Đang tải ảnh...' : 'Tải ảnh thiết bị'}
                                    </label>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadCccdFront} />
                                        {isUploadingCccdFront ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {isUploadingCccdFront ? 'Đang tải CCCD trước...' : 'Tải CCCD mặt trước'}
                                    </label>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadCccdBack} />
                                        {isUploadingCccdBack ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {isUploadingCccdBack ? 'Đang tải CCCD sau...' : 'Tải CCCD mặt sau'}
                                    </label>
                                </div>
                            )}
                            <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                                Ảnh thiết bị ({allDeviceImages.length})
                            </div>

                            {visibleDeviceImages.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', height: 140, borderRadius: 12, border: '1px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 8 }}>
                                    <ImageIcon size={28} strokeWidth={1.5} />
                                    <span style={{ fontSize: 12 }}>Chưa có ảnh thiết bị</span>
                                </div>
                            ) : (
                                <>
                                    {visibleDeviceImages.map((url, idx) => (
                                        <div
                                            key={`${url}-${idx}`}
                                            onClick={() => setImageModal({ url: resolveImageUrl(url), title: `Ảnh thiết bị ${idx + 1}` })}
                                            style={{
                                                borderRadius: 12,
                                                overflow: 'hidden',
                                                border: '1px solid #e2e8f0',
                                                height: 140,
                                                background: '#f8fafc',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                        >
                                            <img src={resolveImageUrl(url)} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{
                                                position: 'absolute', top: 6, right: 6,
                                                background: 'rgba(0,0,0,0.6)', borderRadius: 6,
                                                padding: 4, color: '#fff', fontSize: 11, fontWeight: 700
                                            }}>
                                                {idx + 1}
                                            </div>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDeviceImage(url); }}
                                                    style={{
                                                        position: 'absolute', top: 6, left: 6,
                                                        background: '#ef4444', border: 'none', borderRadius: 6,
                                                        width: 24, height: 24, display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', cursor: 'pointer', color: '#fff',
                                                    }}
                                                >
                                                    <X size={13} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!showAllImages && remainingCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllImages(true)}
                                            style={{
                                                borderRadius: 12,
                                                border: '1.5px dashed #cbd5e1',
                                                background: '#f8fafc',
                                                height: 140,
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                fontSize: 14,
                                                color: '#64748b'
                                            }}
                                        >
                                            +{remainingCount} ảnh
                                        </button>
                                    )}
                                </>
                            )}

                            <div style={{ gridColumn: '1 / -1', marginTop: 8, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                                CCCD
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <ImgPreview url={currentCccdFrontUrl || ''} label="CCCD mặt trước" onZoom={(url, title) => setImageModal({ url, title })} />
                                {isEditing && currentCccdFrontUrl && (
                                    <button type="button" onClick={() => setEditForm(p => ({ ...p, cccdFrontUrl: undefined }))}
                                        style={{ padding: '4px 10px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                        <X size={12} style={{ display: 'inline', marginRight: 4 }} />Xóa ảnh
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <ImgPreview url={currentCccdBackUrl || ''} label="CCCD mặt sau" onZoom={(url, title) => setImageModal({ url, title })} />
                                {isEditing && currentCccdBackUrl && (
                                    <button type="button" onClick={() => setEditForm(p => ({ ...p, cccdBackUrl: undefined }))}
                                        style={{ padding: '4px 10px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                        <X size={12} style={{ display: 'inline', marginRight: 4 }} />Xóa ảnh
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                </div>
            </div>

            {/* Image Modal */}
            {imageModal && (
                <div
                    onClick={() => setImageModal(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 20, cursor: 'pointer'
                    }}
                >
                    <button
                        onClick={() => setImageModal(null)}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'rgba(255, 255, 255, 0.2)', border: 'none',
                            borderRadius: 8, width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff', backdropFilter: 'blur(10px)'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <div style={{ maxWidth: '90%', maxHeight: '90%', textAlign: 'center' }}>
                        <img
                            src={resolveImageUrl(imageModal.url)}
                            alt={imageModal.title}
                            style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div style={{ color: '#fff', marginTop: 16, fontSize: 14, fontWeight: 600 }}>
                            {imageModal.title}
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0;
                        padding: 0;
                    }
                    .print-label-only .no-print-label {
                        display: none !important;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>

            {/* Hidden Print Container for Labels */}
            {showLabel && (
                <div className="label-print-overlay">
                    <ProductLabel
                        name={modelName}
                        ram={specs.ram}
                        rom={specs.rom}
                        imei={serialNumber || serialItem?.internalCode || 'N/A'}
                        price={fmt(totalCost)}
                        barcodeType="1D"
                    />
                    <style>{`
                        .label-print-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: white;
                            z-index: 99999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        @media screen {
                            .label-print-overlay {
                                display: none;
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}
