import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, FolderTree } from 'lucide-react';
import type { Category, CreateCategoryDto } from '../../../api/masterdata.api';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCategoryDto) => void;
    initialData?: Category | null;
    loading?: boolean;
}

export function CategoryModal({ isOpen, onClose, onSubmit, initialData, loading }: CategoryModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCategoryDto>();

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                code: initialData.code,
                productType: initialData.productType,
                trackingMethod: initialData.trackingMethod,
                description: initialData.description,
                parentId: initialData.parentId,
            });
        } else {
            reset({
                name: '',
                code: '',
                productType: 'ELECTRONICS',
                trackingMethod: 'SERIAL_BASED',
                description: '',
            });
        }
    }, [initialData, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, #f8fafc, #fff)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: '#e0e7ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4f46e5'
                        }}>
                            <FolderTree size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {initialData ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '2px 0 0' }}>
                                Phân loại sản phẩm để quản lý kho hiệu quả
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: '#f1f5f9',
                            color: '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Tên danh mục <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                {...register('name', { required: 'Vui lòng nhập tên danh mục' })}
                                placeholder="Ví dụ: Điện thoại, Laptop, Phụ kiện..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: `1.5px solid ${errors.name ? '#fecaca' : '#e2e8f0'}`,
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                            />
                            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name.message}</p>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Mã danh mục <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                {...register('code', { required: 'Vui lòng nhập mã danh mục' })}
                                placeholder="Ví dụ: PHONE, LAPTOP..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: `1.5px solid ${errors.code ? '#fecaca' : '#e2e8f0'}`,
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                }}
                            />
                            {errors.code && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.code.message}</p>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Loại sản phẩm
                            </label>
                            <select
                                {...register('productType')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '0.9375rem',
                                    background: '#fff',
                                    outline: 'none',
                                }}
                            >
                                <option value="ELECTRONICS">📱 Điện tử</option>
                                <option value="APPLIANCE_LARGE">📺 Điện máy lớn</option>
                                <option value="APPLIANCE_SMALL">🍳 Điện máy nhỏ</option>
                                <option value="COMPUTER">💻 Máy tính</option>
                                <option value="ACCESSORY">🎧 Phụ kiện</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Phương thức theo dõi tồn kho
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                {[
                                    { id: 'SERIAL_BASED', label: 'Theo Serial', desc: 'Quản lý chính xác từng cá thể thiết bị' },
                                    { id: 'QUANTITY_BASED', label: 'Theo số lượng', desc: 'Quản lý theo số lượng tồn kho' },
                                ].map((method) => (
                                    <label key={method.id} style={{
                                        display: 'block',
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        border: '1.5px solid #f1f5f9',
                                        background: '#f8fafc',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}>
                                        <input
                                            type="radio"
                                            {...register('trackingMethod')}
                                            value={method.id}
                                            style={{ marginBottom: '0.5rem' }}
                                        />
                                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{method.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{method.desc}</div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Mô tả
                            </label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '0.9375rem',
                                    resize: 'none',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#475569',
                                cursor: 'pointer'
                            }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: '#fff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            {loading ? 'Đang lưu...' : (initialData ? 'Lưu thay đổi' : 'Tạo danh mục')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
