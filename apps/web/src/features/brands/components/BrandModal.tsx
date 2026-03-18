import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { X, Award, Upload } from 'lucide-react';
import type { Brand, CreateBrandDto, Category } from '../../../api/masterdata.api';
import { categoriesApi } from '../../../api/masterdata.api';
import { uploadApi } from '../../../api/upload.api';
import { resolveImageUrl } from '../../../lib/image';

interface BrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBrandDto) => void;
    initialData?: Brand | null;
    loading?: boolean;
}

export function BrandModal({ isOpen, onClose, onSubmit, initialData, loading }: BrandModalProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateBrandDto>();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const logoValue = watch('logo');
    const { data: categoriesData = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                code: initialData.code,
                logo: initialData.logo,
            });
            const mapped = (initialData.brandCategories || [])
                .map(bc => bc.categoryId || bc.category?.id)
                .filter(Boolean) as string[];
            setSelectedCategoryIds(mapped);
        } else {
            reset({
                name: '',
                code: '',
                logo: '',
            });
            setSelectedCategoryIds([]);
        }
        setCategoryError(null);
    }, [initialData, reset, isOpen]);

    useEffect(() => {
        setValue('categoryIds', selectedCategoryIds, { shouldValidate: true });
        if (selectedCategoryIds.length > 0) setCategoryError(null);
    }, [selectedCategoryIds, setValue]);

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
                maxWidth: '500px',
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
                    background: 'linear-gradient(to right, #fef3c7, #fff)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#f59e0b'
                        }}>
                            <Award size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {initialData ? 'Chỉnh sửa Thương hiệu' : 'Thêm Thương hiệu Mới'}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '2px 0 0' }}>
                                Quản lý thương hiệu và logo sản phẩm
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
                <form onSubmit={handleSubmit((data) => {
                    if (selectedCategoryIds.length === 0) {
                        setCategoryError('Vui lòng chọn ít nhất 1 danh mục');
                        return;
                    }
                    onSubmit({ ...data, categoryIds: selectedCategoryIds });
                })} style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Tên thương hiệu <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                {...register('name', { required: 'Vui lòng nhập tên thương hiệu' })}
                                placeholder="Ví dụ: Apple, Samsung, Xiaomi..."
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
                                Mã thương hiệu <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                {...register('code', { required: 'Vui lòng nhập mã thương hiệu' })}
                                placeholder="Ví dụ: APPLE, SAMSUNG..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.75rem',
                                    border: `1.5px solid ${errors.code ? '#fecaca' : '#e2e8f0'}`,
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    textTransform: 'uppercase',
                                }}
                            />
                            {errors.code && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.code.message}</p>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Danh mục áp dụng <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '0.75rem',
                                padding: '0.75rem',
                                maxHeight: '200px',
                                overflow: 'auto',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem 1rem',
                                background: '#fafafa',
                            }}>
                                {(categoriesData as Category[]).map((c) => (
                                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#0f172a' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategoryIds.includes(c.id)}
                                            onChange={(e) => {
                                                setSelectedCategoryIds(prev => e.target.checked
                                                    ? [...prev, c.id]
                                                    : prev.filter(id => id !== c.id));
                                            }}
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                            {categoryError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{categoryError}</p>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                Logo URL
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    {...register('logo')}
                                    placeholder="https://example.com/logo.png"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '0.9375rem',
                                        outline: 'none',
                                    }}
                                />
                                <Upload size={16} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem' }}>
                                Nhập URL hình ảnh logo thương hiệu (tùy chọn)
                            </p>
                            <div style={{ marginTop: '0.75rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsUploading(true);
                                        try {
                                            const url = await uploadApi.uploadImage(file);
                                            setValue('logo', url, { shouldValidate: true });
                                        } catch {
                                            alert('Upload logo thất bại');
                                        } finally {
                                            setIsUploading(false);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                {isUploading && (
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Đang upload...
                                    </div>
                                )}
                                {logoValue && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <img
                                            src={resolveImageUrl(logoValue)}
                                            alt="Logo preview"
                                            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff' }}
                                        />
                                    </div>
                                )}
                            </div>
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
                            disabled={loading || isUploading}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: '#fff',
                                cursor: loading || isUploading ? 'not-allowed' : 'pointer',
                                opacity: loading || isUploading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                            }}
                        >
                            {loading || isUploading ? 'Đang lưu...' : (initialData ? 'Lưu thay đổi' : 'Tạo thương hiệu')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
