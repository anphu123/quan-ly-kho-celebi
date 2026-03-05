import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, Smartphone, User, CreditCard,
    Image as ImageIcon, CheckCircle2, Clock,
    ClipboardCheck, Activity, DollarSign, X, ZoomIn,
    Building2, FileText, Printer, Edit2, Save, XCircle
} from 'lucide-react';
import { inboundApi } from '../../api/inbound.api';

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
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    const { data: request, isLoading, isError, error } = useQuery({
        queryKey: ['trade-in-item', id],
        queryFn: () => inboundApi.getRequestById(id!),
        enabled: !!id
    });

    console.log('TradeInDetailPage:', { id, isLoading, isError, error, request, items: request?.items });

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
    const { code, status, warehouse, createdAt, receivedBy, receivedDate, updatedAt } = request!;

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
        receivedAt
    } = item;

    const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig['REQUESTED'];
    const totalCost = (Number(estimatedValue) || 0) + (Number(otherCosts) || 0) + (Number(topUp) || 0);
    const parsedDeviceImages = deviceImages ? JSON.parse(deviceImages) : [];

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
        mutationFn: () => inboundApi.completeQC(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trade-in-item', id] });
            alert('Đã hoàn tất nhập kho thành công!');
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || 'Lỗi khi nhập kho');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => {
            // Update the item-level data using the first item's ID
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

    const handleEdit = () => {
        setEditForm({
            modelName: item.modelName,
            serialNumber: item.serialNumber,
            notes: item.notes,
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

    const handleSave = () => {
        if (confirm('Xác nhận cập nhật thông tin?')) {
            updateMutation.mutate(editForm);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({});
    };

    const Card = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
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

    const InfoRow = ({ label, value, highlight = false }: { label: string, value: string | React.ReactNode, highlight?: boolean }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #f1f5f9' }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
            <span style={{ color: highlight ? '#6366f1' : '#0f172a', fontSize: 13, fontWeight: highlight ? 700 : 500, textAlign: 'right', maxWidth: '60%' }}>
                {value || '—'}
            </span>
        </div>
    );

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
                    value={editForm[fieldName] || ''}
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

    const ImgPreview = ({ url, label }: { url: string, label: string }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{label}</span>
            {url ? (
                <div
                    onClick={() => setImageModal({ url, title: label })}
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
                    <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
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
                            onClick={() => { if (confirm('Hoàn tất kiểm tra và nhập kho thiết bị này?')) completeMutation.mutate() }}
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                        <Card title="Thông tin thiết bị" icon={<Smartphone size={18} />}>
                            <EditableInfoRow label="Thiết bị" fieldName="modelName" value={modelName} />
                            <EditableInfoRow label="IMEI / Serial" fieldName="serialNumber" value={serialNumber} highlight />
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                            <ImgPreview url={imageUrl || parsedDeviceImages[0]} label="Ảnh chính thiết bị" />
                            {parsedDeviceImages.slice(1, 4).map((url: string, idx: number) => (
                                <ImgPreview key={idx} url={url} label={`Ảnh thiết bị ${idx + 2}`} />
                            ))}
                            <ImgPreview url={cccdFrontUrl || ''} label="CCCD mặt trước" />
                            <ImgPreview url={cccdBackUrl || ''} label="CCCD mặt sau" />
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
                            src={imageModal.url}
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
        </>
    );
}
