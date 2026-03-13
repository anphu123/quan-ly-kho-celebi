import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    ArrowLeft, Save, AlertCircle, Smartphone, Building2,
    Warehouse as WarehouseIcon, User, Phone, CreditCard,
    MapPin, DollarSign, Wrench, X, Upload, ImageIcon, Plus, Trash2, Loader2, Package
} from 'lucide-react';
import { warehousesApi } from '../../lib/api/warehouses.api';
import { suppliersApi } from '../../lib/api/suppliers.api';
import { categoriesApi, brandsApi } from '../../lib/api/masterdata.api';
import { attributesApi, type AttributeGroup } from '../../api/attributes.api';
import { inboundApi } from '../../api/inbound.api';
import { uploadApi } from '../../api/upload.api';
import type { CreateInboundItem } from '../../api/inbound.api';

const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 40, borderRadius: 9,
    border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 12,
    color: '#0f172a', outline: 'none', background: '#fff',
};

/* ── CCCD Single Image Box (preview only, stores File object) ── */
function ImageBox({
    label, subLabel, file, preview, onPick, onClear
}: {
    label: string; subLabel?: string;
    file: File | null; preview: string;
    onPick: (f: File, previewUrl: string) => void;
    onClear: () => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        onPick(f, url);
    };
    return (
        <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
            {subLabel && <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94a3b8' }}>{subLabel}</p>}
            <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: 12, border: `2px dashed ${preview ? '#86efac' : '#c7d2fe'}`, background: preview ? '#f0fdf4' : '#fafbff', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => ref.current?.click()}>
                {preview ? (
                    <>
                        <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <button type="button" onClick={e => { e.stopPropagation(); onClear(); }}
                            style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6, background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={12} />
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: 12 }}>
                        <ImageIcon size={24} style={{ marginBottom: 6 }} />
                        <p style={{ margin: 0, fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Bấm để chọn ảnh</p>
                        <p style={{ margin: '4px 0 0', fontSize: 11 }}>jpg, png, webp · tối đa 10MB</p>
                    </div>
                )}
                <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
            </div>
            {file && <p style={{ margin: '5px 0 0', fontSize: 11, color: '#59754b', fontWeight: 600 }}>✅ {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
        </div>
    );
}

/* ── Multi-Image Gallery (stores File objects) ── */
function MultiImageGallery({ files, previews, onAdd, onRemove }: {
    files: File[]; previews: string[];
    onAdd: (newFiles: File[], newPreviews: string[]) => void;
    onRemove: (index: number) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        const newPreviews = picked.map(f => URL.createObjectURL(f));
        onAdd(picked, newPreviews);
        e.target.value = ''; // allow re-picking same file
    };
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    📷 Nhiều ảnh thiết bị ({files.length}/10)
                </label>
                {files.length < 10 && (
                    <button type="button" onClick={() => ref.current?.click()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: '1.5px solid #c7d2fe', background: '#eef2ff', fontSize: 12, fontWeight: 700, color: '#6366f1', cursor: 'pointer' }}>
                        <Plus size={13} /> Thêm ảnh
                    </button>
                )}
            </div>
            {files.length === 0 ? (
                <div onClick={() => ref.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px', borderRadius: 12, border: '2px dashed #c7d2fe', background: '#fafbff', cursor: 'pointer' }}>
                    <Upload size={24} color="#c7d2fe" />
                    <p style={{ margin: 0, fontSize: 13, color: '#6366f1', fontWeight: 600 }}>Bấm để chọn ảnh thiết bị</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Hỗ trợ nhiều ảnh cùng lúc · jpg, png, webp</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                    {previews.map((preview, i) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => onRemove(i)}
                                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 6, background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Trash2 size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <input ref={ref} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFiles} />
        </div>
    );
}

/* ── Section Card ── */
const SectionCard = ({ step, title, subtitle, color, children }: {
    step: string; title: string; subtitle: string; color: string; children: React.ReactNode;
}) => (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,.15)' }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>{step}</span>
            </div>
            <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{title}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{subtitle}</p>
            </div>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
);

const Field = ({ label, icon, col = 1, children }: { label: string; icon?: React.ReactNode; col?: number; children: React.ReactNode }) => (
    <div style={{ gridColumn: `span ${col}` }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {icon} {label}
        </label>
        {children}
    </div>
);

export default function CreateSingleTradeInPage() {
    const navigate = useNavigate();
    const [warehouseId, setWarehouseId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Device images state
    const [deviceFiles, setDeviceFiles] = useState<File[]>([]);
    const [devicePreviews, setDevicePreviews] = useState<string[]>([]);

    // CCCD state
    const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
    const [cccdFrontPreview, setCccdFrontPreview] = useState('');
    const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
    const [cccdBackPreview, setCccdBackPreview] = useState('');

    const [item, setItem] = useState<Partial<CreateInboundItem>>({
        categoryId: '', modelName: '', serialNumber: '', notes: '',
        sourceCustomerName: '', sourceCustomerPhone: '', sourceCustomerAddress: '',
        sourceCustomerIdCard: '', idCardIssuePlace: '',
        bankAccount: '', bankName: '', contractNumber: '', employeeName: '',
    });
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [customBrandName, setCustomBrandName] = useState('');
    const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});
    const [attributeOtherSelected, setAttributeOtherSelected] = useState<Record<string, boolean>>({});

    const { data: suppliersData } = useQuery({ queryKey: ['suppliers'], queryFn: () => suppliersApi.getAll({ limit: 100 }) });
    const suppliers = suppliersData?.data || [];
    const xiaomiSuppliers = suppliers.filter((s: any) =>
        s.name?.toLowerCase().includes('xiaomi')
    );
    const supplierOptions = xiaomiSuppliers.length > 0 ? xiaomiSuppliers : suppliers;

    const { data: warehousesData } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehousesApi.getAll({ limit: 100 }) });
    const warehouses = warehousesData?.data || [];

    const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll() });
    const categories = categoriesData || [];
    const { data: brandsData } = useQuery({ queryKey: ['brands-all'], queryFn: () => brandsApi.getAll() });
    const allBrands = brandsData || [];
    const { data: categoryBrandsData } = useQuery({
        queryKey: ['brands-by-category', item.categoryId],
        queryFn: () => brandsApi.getAll({ categoryId: item.categoryId as string }),
        enabled: !!item.categoryId,
    });

    const { data: attributeGroupsData } = useQuery({
        queryKey: ['attribute-groups', item.categoryId],
        queryFn: () => attributesApi.getGroupsByCategory(item.categoryId as string),
        enabled: !!item.categoryId,
    });
    const attributeGroups: AttributeGroup[] = attributeGroupsData || [];

    const brandOptions = useMemo(() => {
        return categoryBrandsData || [];
    }, [categoryBrandsData]);

    const brandOptionsWithOther = useMemo(() => (
        item.categoryId
            ? [...brandOptions, { id: 'OTHER', name: 'Khác (nhập tay)' }]
            : []
    ), [brandOptions, item.categoryId]);

    const normalizeAttributeOptions = (options: any): Array<{ value: string; label: string }> => {
        if (!options) return [];
        let list: any[] = [];
        if (Array.isArray(options)) list = options;
        else if (Array.isArray(options?.values)) list = options.values;
        else if (typeof options === 'string') {
            try {
                const parsed = JSON.parse(options);
                if (Array.isArray(parsed)) list = parsed;
                else if (Array.isArray(parsed?.values)) list = parsed.values;
            } catch { }
        }
        return list.map((opt) => {
            if (typeof opt === 'string' || typeof opt === 'number' || typeof opt === 'boolean') {
                return { value: String(opt), label: String(opt) };
            }
            if (opt?.value !== undefined || opt?.label !== undefined) {
                return { value: String(opt.value ?? opt.label), label: String(opt.label ?? opt.value) };
            }
            return { value: String(opt), label: String(opt) };
        });
    };

    const createMutation = useMutation({
        mutationFn: async (imageData: { deviceUrls: string[]; cccdFrontUrl: string; cccdBackUrl: string }) => {
            const supplier = supplierOptions.find((s: any) => s.id === supplierId);

            const normalizeBrandCode = (name: string) => {
                const base = name
                    .toUpperCase()
                    .replace(/[^A-Z0-9]+/g, '')
                    .slice(0, 12);
                return base.length >= 3 ? base : `BR${base}`;
            };

            const resolveBrandId = async () => {
                if (!selectedBrandId || selectedBrandId === 'OTHER') {
                    if (!customBrandName.trim()) return undefined;
                    const existing = allBrands.find((b: any) => b.name?.toLowerCase() === customBrandName.trim().toLowerCase());
                    if (existing) return existing.id;
                    const baseCode = normalizeBrandCode(customBrandName.trim());
                    try {
                        const created = await brandsApi.create({
                            name: customBrandName.trim(),
                            code: baseCode,
                            categoryIds: item.categoryId ? [item.categoryId] : undefined,
                        });
                        return created.id;
                    } catch (err: any) {
                        const fallbackCode = `${baseCode}${Math.floor(Math.random() * 90 + 10)}`;
                        const created = await brandsApi.create({
                            name: customBrandName.trim(),
                            code: fallbackCode,
                            categoryIds: item.categoryId ? [item.categoryId] : undefined,
                        });
                        return created.id;
                    }
                }
                return selectedBrandId;
            };

            const attributeLookup = new Map<string, { name: string; key: string }>();
            attributeGroups.forEach((g) => g.attributes.forEach((a) => attributeLookup.set(a.id, { name: a.name, key: a.key })));
            const specsEntries = Object.entries(customAttributes)
                .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
                .map(([id, v]) => {
                    const meta = attributeLookup.get(id);
                    const label = meta?.name || meta?.key || id;
                    return `${label}=${v}`;
                });
            const specsNote = specsEntries.length > 0 ? `[Specs] ${specsEntries.join('; ')}` : '';
            const baseNotes = item.notes?.toString() || '';
            const finalNotes = specsNote ? (baseNotes ? `${baseNotes}\n${specsNote}` : specsNote) : baseNotes;

            const brandId = await resolveBrandId();

            return inboundApi.createRequest({
                warehouseId,
                supplierType: 'CUSTOMER_TRADE_IN',
                supplierName: supplier?.name || 'Cửa hàng chưa xác định',
                notes: 'Thu cũ 1 máy lẻ từ cửa hàng',
                items: [{
                    ...(item as CreateInboundItem),
                    brandId,
                    notes: finalNotes || undefined,
                    imageUrl: imageData.deviceUrls[0] || undefined,
                    deviceImages: imageData.deviceUrls.length > 0 ? JSON.stringify(imageData.deviceUrls) : undefined,
                    cccdFrontUrl: imageData.cccdFrontUrl || undefined,
                    cccdBackUrl: imageData.cccdBackUrl || undefined,
                }],
            });
        },
        onSuccess: () => navigate('/trade-in-xiaomi'),
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo');
            setUploading(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!warehouseId) { setError('Vui lòng chọn Kho nhận'); return; }
        if (!supplierId) { setError('Vui lòng chọn cửa hàng'); return; }
        if (!item.categoryId) { setError('Vui lòng chọn Danh mục sản phẩm'); return; }
        if (!selectedBrandId) { setError('Vui lòng chọn Thương hiệu'); return; }
        if (selectedBrandId === 'OTHER' && !customBrandName.trim()) { setError('Vui lòng nhập thương hiệu mới'); return; }
        if (!item.modelName) { setError('Vui lòng nhập Tên thiết bị'); return; }
        const missingRequired = attributeGroups
            .flatMap(g => g.attributes)
            .filter(a => a.isRequired)
            .filter(a => {
                const v = customAttributes[a.id];
                return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
            });
        if (missingRequired.length > 0) {
            setError(`Vui lòng nhập: ${missingRequired.map(a => a.name).join(', ')}`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Upload all images to server first
            const [deviceUrls, cccdFrontUrl, cccdBackUrl] = await Promise.all([
                deviceFiles.length > 0 ? uploadApi.uploadImages(deviceFiles) : Promise.resolve([]),
                cccdFrontFile ? uploadApi.uploadImage(cccdFrontFile) : Promise.resolve(''),
                cccdBackFile ? uploadApi.uploadImage(cccdBackFile) : Promise.resolve(''),
            ]);
            createMutation.mutate({ deviceUrls, cccdFrontUrl, cccdBackUrl });
        } catch (uploadErr: any) {
            setError('Lỗi tải lên ảnh: ' + (uploadErr.response?.data?.message || uploadErr.message));
            setUploading(false);
        }
    };

    const onInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const normalizedValue = name === 'brandId' && value === '' ? undefined : value;
        setItem(p => ({ ...p, [name]: type === 'number' ? (value ? Number(value) : undefined) : normalizedValue }));
    };

    const totalPrice = (Number(item.estimatedValue) || 0) + (Number(item.otherCosts) || 0) + (Number(item.topUp) || 0);
    const isBusy = uploading || createMutation.isPending;

    useEffect(() => {
        setSelectedBrandId('');
        setCustomBrandName('');
        setCustomAttributes({});
        setAttributeOtherSelected({});
    }, [item.categoryId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <button onClick={() => navigate('/trade-in-xiaomi')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, fontWeight: 600 }}>
                    <ArrowLeft size={15} /> Quay lại danh sách
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(99,102,241,.35)' }}>
                        <Smartphone size={24} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Tạo 1 máy thu cũ mới</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Nhập thông tin + tải lên ảnh thiết bị và CCCD</p>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, color: '#be123c', fontSize: 13 }}>
                    <AlertCircle size={16} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be123c' }}><X size={15} /></button>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Step 1: Điều phối */}
                <SectionCard step="1" title="Điều phối" subtitle="Từ cửa hàng nào và nhập kho nào?" color="linear-gradient(135deg,#6366f1,#8b5cf6)">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Cửa hàng gửi *" icon={<Building2 size={12} color="#6366f1" />}>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required style={{ ...inputStyle, appearance: 'none' }}>
                                <option value="">— Chọn cửa hàng —</option>
                                {supplierOptions.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </Field>
                        <Field label="Kho nhận *" icon={<WarehouseIcon size={12} color="#6366f1" />}>
                            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required style={{ ...inputStyle, appearance: 'none' }}>
                                <option value="">— Chọn Kho —</option>
                                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                            </select>
                        </Field>
                    </div>
                </SectionCard>

                {/* Step 2: Ảnh thiết bị */}
                <SectionCard step="2" title="Hình ảnh thiết bị" subtitle="Tải lên nhiều ảnh — hệ thống lưu lên server, không base64" color="linear-gradient(135deg,#8b5cf6,#ec4899)">
                    <MultiImageGallery
                        files={deviceFiles}
                        previews={devicePreviews}
                        onAdd={(newFiles, newPreviews) => {
                            setDeviceFiles(p => [...p, ...newFiles].slice(0, 10));
                            setDevicePreviews(p => [...p, ...newPreviews].slice(0, 10));
                        }}
                        onRemove={i => {
                            setDeviceFiles(p => p.filter((_, j) => j !== i));
                            setDevicePreviews(p => p.filter((_, j) => j !== i));
                        }}
                    />
                </SectionCard>

                {/* Step 3: Thiết bị & Thu mua */}
                <SectionCard step="3" title="Thiết bị & Thu mua" subtitle="Thông tin máy và chi phí" color="linear-gradient(135deg,#f59e0b,#f97316)">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        <Field label="Danh mục *" icon={<Package size={12} color="#f97316" />}>
                            <select name="categoryId" required style={{ ...inputStyle, appearance: 'none' }} value={item.categoryId} onChange={onInput}>
                                <option value="">— Chọn danh mục —</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Thương hiệu *" icon={<Package size={12} color="#f97316" />}>
                            <select
                                value={selectedBrandId}
                                onChange={e => setSelectedBrandId(e.target.value)}
                                style={{ ...inputStyle, appearance: 'none' }}
                                disabled={!item.categoryId}
                            >
                                <option value="">— Chọn thương hiệu —</option>
                                {brandOptionsWithOther.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </Field>
                        {selectedBrandId === 'OTHER' && (
                            <Field label="Thương hiệu mới *" icon={<Package size={12} color="#f97316" />}>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={customBrandName}
                                    onChange={e => setCustomBrandName(e.target.value)}
                                    placeholder="Nhập thương hiệu mới"
                                />
                            </Field>
                        )}
                        <Field label="Tên thiết bị *" icon={<Smartphone size={12} color="#f97316" />} col={2}>
                            <input type="text" name="modelName" required style={inputStyle} value={item.modelName} onChange={onInput} placeholder="VD: Xiaomi 14 Pro 256GB" />
                        </Field>
                        {attributeGroups.length > 0 && (
                            <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                    Thuộc tính theo danh mục / brand
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                                    {attributeGroups.map(group => (
                                        <React.Fragment key={group.id}>
                                            <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                                                {group.name}
                                            </div>
                                            {group.attributes.map((attr) => {
                                                const options = normalizeAttributeOptions(attr.options);
                                                const value = customAttributes[attr.id] ?? '';
                                                const isOther = attributeOtherSelected[attr.id];
                                                const label = `${attr.name}${attr.isRequired ? ' *' : ''}`;

                                                if (attr.type === 'BOOLEAN') {
                                                    return (
                                                        <Field key={attr.id} label={label}>
                                                            <select
                                                                value={value}
                                                                onChange={e => setCustomAttributes(p => ({ ...p, [attr.id]: e.target.value }))}
                                                                style={{ ...inputStyle, appearance: 'none' }}
                                                            >
                                                                <option value="">— Chọn —</option>
                                                                <option value="true">Có</option>
                                                                <option value="false">Không</option>
                                                            </select>
                                                        </Field>
                                                    );
                                                }

                                                if (attr.type === 'SELECT') {
                                                    return (
                                                        <Field key={attr.id} label={label}>
                                                            <select
                                                                value={isOther ? '__OTHER__' : value}
                                                                onChange={e => {
                                                                    const v = e.target.value;
                                                                    if (v === '__OTHER__') {
                                                                        setAttributeOtherSelected(p => ({ ...p, [attr.id]: true }));
                                                                        setCustomAttributes(p => ({ ...p, [attr.id]: '' }));
                                                                    } else {
                                                                        setAttributeOtherSelected(p => ({ ...p, [attr.id]: false }));
                                                                        setCustomAttributes(p => ({ ...p, [attr.id]: v }));
                                                                    }
                                                                }}
                                                                style={{ ...inputStyle, appearance: 'none' }}
                                                            >
                                                                <option value="">— Chọn —</option>
                                                                {options.map((o) => (
                                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                                ))}
                                                                <option value="__OTHER__">Khác (nhập tay)</option>
                                                            </select>
                                                            {isOther && (
                                                                <div style={{ marginTop: 8 }}>
                                                                    <input
                                                                        type="text"
                                                                        style={inputStyle}
                                                                        value={value}
                                                                        onChange={e => setCustomAttributes(p => ({ ...p, [attr.id]: e.target.value }))}
                                                                        placeholder="Nhập giá trị"
                                                                    />
                                                                </div>
                                                            )}
                                                        </Field>
                                                    );
                                                }

                                                if (attr.type === 'MULTISELECT') {
                                                    return (
                                                        <Field key={attr.id} label={label}>
                                                            <input
                                                                type="text"
                                                                style={inputStyle}
                                                                value={value}
                                                                onChange={e => setCustomAttributes(p => ({ ...p, [attr.id]: e.target.value }))}
                                                                placeholder="VD: 8GB; 12GB; 16GB"
                                                            />
                                                            {options.length > 0 && (
                                                                <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                                                                    Gợi ý: {options.map(o => o.label).join(', ')}
                                                                </div>
                                                            )}
                                                        </Field>
                                                    );
                                                }

                                                if (attr.type === 'DATE') {
                                                    return (
                                                        <Field key={attr.id} label={label}>
                                                            <input
                                                                type="date"
                                                                style={inputStyle}
                                                                value={value}
                                                                onChange={e => setCustomAttributes(p => ({ ...p, [attr.id]: e.target.value }))}
                                                            />
                                                        </Field>
                                                    );
                                                }

                                                if (attr.type === 'NUMBER' || attr.type === 'DECIMAL') {
                                                    return (
                                                        <Field key={attr.id} label={label}>
                                                            <input
                                                                type="number"
                                                                style={inputStyle}
                                                                value={value}
                                                                onChange={e => setCustomAttributes(p => ({ ...p, [attr.id]: e.target.value }))}
                                                                placeholder="Nhập số"
                                                            />
                                                        </Field>
                                                    );
                                                }

                                                return (
                                                    <Field key={attr.id} label={label}>
                                                        <input
                                                            type="text"
                                                            style={inputStyle}
                                                            value={value}
                                                            onChange={e => setCustomAttributes(p => ({ ...p, [attr.id]: e.target.value }))}
                                                            placeholder="Nhập giá trị"
                                                        />
                                                    </Field>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Field label="Serial / IMEI">
                            <input type="text" name="serialNumber" style={inputStyle} value={item.serialNumber} onChange={onInput} placeholder="Số IMEI" />
                        </Field>
                        <Field label="Loại test máy" col={3}>
                            <input type="text" name="notes" style={inputStyle} value={item.notes} onChange={onInput} placeholder="VD: Màn xước nhẹ, vỏ cấn góc..." />
                        </Field>
                        <Field label="Số hợp đồng">
                            <input type="text" name="contractNumber" style={inputStyle} value={item.contractNumber} onChange={onInput} />
                        </Field>
                        <Field label="Ngày mua">
                            <input type="date" style={inputStyle} value={item.purchaseDate ? item.purchaseDate.split('T')[0] : ''} onChange={e => setItem({ ...item, purchaseDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                        </Field>
                        <Field label="Tên NV thu">
                            <input type="text" name="employeeName" style={inputStyle} value={item.employeeName} onChange={onInput} />
                        </Field>
                        <Field label="Giá thu mua (đ)" icon={<DollarSign size={12} color="#f97316" />}>
                            <input type="number" name="estimatedValue" style={inputStyle} value={item.estimatedValue || ''} onChange={onInput} placeholder="0" />
                        </Field>
                        <Field label="Chi phí khác (đ)">
                            <input type="number" name="otherCosts" style={inputStyle} value={item.otherCosts || ''} onChange={onInput} placeholder="0" />
                        </Field>
                        <Field label="Bù thêm (đ)">
                            <input type="number" name="topUp" style={inputStyle} value={item.topUp || ''} onChange={onInput} placeholder="0" />
                        </Field>
                        <div style={{ gridColumn: '1 / 3', display: 'flex', alignItems: 'center', background: '#f0f4ff', padding: '10px 16px', borderRadius: 10 }}>
                            <DollarSign size={16} color="#6366f1" style={{ marginRight: 8 }} />
                            <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, marginRight: 8 }}>Tổng giá thu:</span>
                            <span style={{ fontWeight: 900, fontSize: 20, color: '#4338ca' }}>{totalPrice.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <Field label="Giá sửa chữa (đ)" icon={<Wrench size={12} color="#f97316" />}>
                            <input type="number" name="repairCost" style={inputStyle} value={item.repairCost || ''} onChange={onInput} placeholder="0" />
                        </Field>
                    </div>
                </SectionCard>

                {/* Step 4: Khách hàng */}
                <SectionCard step="4" title="Thông tin Khách hàng" subtitle="Người bán máy cho cửa hàng" color="linear-gradient(135deg,#10b981,#059669)">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        <Field label="Tên khách hàng" icon={<User size={12} color="#059669" />}>
                            <input type="text" name="sourceCustomerName" style={inputStyle} value={item.sourceCustomerName} onChange={onInput} />
                        </Field>
                        <Field label="Số điện thoại" icon={<Phone size={12} color="#059669" />}>
                            <input type="text" name="sourceCustomerPhone" style={inputStyle} value={item.sourceCustomerPhone} onChange={onInput} />
                        </Field>
                        <Field label="Địa chỉ" icon={<MapPin size={12} color="#059669" />}>
                            <input type="text" name="sourceCustomerAddress" style={inputStyle} value={item.sourceCustomerAddress} onChange={onInput} />
                        </Field>
                        <Field label="Số CCCD" icon={<CreditCard size={12} color="#059669" />}>
                            <input type="text" name="sourceCustomerIdCard" style={inputStyle} value={item.sourceCustomerIdCard} onChange={onInput} />
                        </Field>
                        <Field label="Ngày cấp CCCD">
                            <input type="date" style={inputStyle} value={item.idCardIssueDate ? item.idCardIssueDate.split('T')[0] : ''} onChange={e => setItem({ ...item, idCardIssueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                        </Field>
                        <Field label="Nơi cấp CCCD">
                            <input type="text" name="idCardIssuePlace" style={inputStyle} value={item.idCardIssuePlace} onChange={onInput} />
                        </Field>
                        <Field label="Số TK Ngân hàng" icon={<CreditCard size={12} color="#059669" />}>
                            <input type="text" name="bankAccount" style={inputStyle} value={item.bankAccount} onChange={onInput} />
                        </Field>
                        <Field label="Tên Ngân hàng" col={2}>
                            <input type="text" name="bankName" style={inputStyle} value={item.bankName} onChange={onInput} />
                        </Field>
                    </div>
                </SectionCard>

                {/* Step 5: Ảnh CCCD */}
                <SectionCard step="5" title="Ảnh CCCD / Giấy tờ tùy thân" subtitle="Tải lên 2 mặt CCCD — lưu server, không gây lỗi quá tải" color="linear-gradient(135deg,#0ea5e9,#6366f1)">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <ImageBox
                            label="Mặt trước CCCD"
                            subLabel="Ảnh rõ nét, đủ 4 góc, không mờ"
                            file={cccdFrontFile}
                            preview={cccdFrontPreview}
                            onPick={(f, p) => { setCccdFrontFile(f); setCccdFrontPreview(p); }}
                            onClear={() => { setCccdFrontFile(null); setCccdFrontPreview(''); }}
                        />
                        <ImageBox
                            label="Mặt sau CCCD"
                            subLabel="Hiện rõ mã QR và vân tay"
                            file={cccdBackFile}
                            preview={cccdBackPreview}
                            onPick={(f, p) => { setCccdBackFile(f); setCccdBackPreview(p); }}
                            onClear={() => { setCccdBackFile(null); setCccdBackPreview(''); }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: cccdFrontFile ? '#dcfce7' : '#f1f5f9', color: cccdFrontFile ? '#166534' : '#64748b' }}>
                            {cccdFrontFile ? '✅' : '⬜'} Mặt trước
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: cccdBackFile ? '#dcfce7' : '#f1f5f9', color: cccdBackFile ? '#166534' : '#64748b' }}>
                            {cccdBackFile ? '✅' : '⬜'} Mặt sau
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: deviceFiles.length > 0 ? '#dcfce7' : '#f1f5f9', color: deviceFiles.length > 0 ? '#166534' : '#64748b' }}>
                            {deviceFiles.length > 0 ? '✅' : '⬜'} {deviceFiles.length} ảnh thiết bị
                        </span>
                    </div>
                </SectionCard>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 32 }}>
                    <button type="button" onClick={() => navigate('/trade-in-xiaomi')} disabled={isBusy}
                        style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer', opacity: isBusy ? 0.5 : 1 }}>
                        Hủy
                    </button>
                    <button type="submit" disabled={isBusy}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isBusy ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,.35)', opacity: isBusy ? 0.7 : 1 }}>
                        {isBusy ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {uploading ? 'Đang tải lên ảnh...' : 'Đang lưu...'}</> : <><Save size={15} /> Lưu thu cũ</>}
                    </button>
                </div>
            </form>
        </div>
    );
}


