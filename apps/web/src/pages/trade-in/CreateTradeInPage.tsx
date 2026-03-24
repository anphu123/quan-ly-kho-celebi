import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Upload, ArrowLeft,
    AlertCircle, CheckCircle2, FileSpreadsheet,
    Building2, Warehouse as WarehouseIcon, Send, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { warehousesApi } from '../../lib/api/warehouses.api';
import { suppliersApi } from '../../lib/api/suppliers.api';
import { categoriesApi } from '../../lib/api/masterdata.api';
import { inboundApi } from '../../api/inbound.api';
import type { CreateInboundItem } from '../../api/inbound.api';

const parseExcelDate = (excelDate: any) => {
    if (!excelDate) return undefined;
    if (typeof excelDate === 'number') {
        const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
        return date.toISOString();
    }
    const d = new Date(excelDate);
    if (!isNaN(d.getTime())) return d.toISOString();
    return undefined;
};

const fmt = (n: number) => n?.toLocaleString('vi-VN');

export default function CreateTradeInPage() {
    const navigate = useNavigate();
    const [warehouseId, setWarehouseId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [items, setItems] = useState<CreateInboundItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    const { data: suppliersData } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => suppliersApi.getAll({ limit: 100 })
    });
    const suppliers = suppliersData?.data || [];

    const { data: warehousesData } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehousesApi.getAll({ limit: 100 })
    });
    const warehouses = warehousesData?.data || [];

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll()
    });
    const categories = categoriesData || [];

    const createMutation = useMutation({
        mutationFn: () => {
            const supplier = suppliers.find((s: any) => s.id === supplierId);
            return inboundApi.createRequest({
                warehouseId,
                supplierType: 'CUSTOMER_TRADE_IN',
                supplierName: supplier?.name || 'Cửa hàng chưa xác định',
                notes: 'Thu cũ Xiaomi từ cửa hàng',
                items: items.map(item => ({ ...item }))
            });
        },
        onSuccess: () => navigate('/trade-in-xiaomi'),
        onError: (err: any) => setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lô hàng')
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

                let headerRowIdx = -1;
                for (let i = 0; i < Math.min(10, data.length); i++) {
                    const rowStr = data[i].join(' ').toUpperCase();
                    if (rowStr.includes('IMEI') || rowStr.includes('STT')) {
                        headerRowIdx = i;
                        break;
                    }
                }

                if (headerRowIdx === -1) {
                    setError('Không tìm thấy dòng tiêu đề trong file Excel (cần có STT hoặc IMEI)');
                    return;
                }

                const parsedItems: CreateInboundItem[] = [];
                for (let i = headerRowIdx + 1; i < data.length; i++) {
                    const row = data[i];
                    if (!row || row.length === 0 || !row[5]) continue;

                    parsedItems.push({
                        contractNumber: row[1]?.toString(),
                        purchaseDate: parseExcelDate(row[2]),
                        employeeName: row[3]?.toString(),
                        modelName: row[4]?.toString() || 'Thiết bị chưa xác định',
                        serialNumber: row[5]?.toString(),
                        notes: row[6]?.toString(),
                        estimatedValue: row[7] ? Number(row[7]) : undefined,
                        otherCosts: row[8] ? Number(row[8]) : undefined,
                        topUp: row[9] ? Number(row[9]) : undefined,
                        repairCost: row[11] ? Number(row[11]) : undefined,
                        sourceCustomerName: row[12]?.toString(),
                        sourceCustomerAddress: row[13]?.toString(),
                        sourceCustomerIdCard: row[14]?.toString(),
                        idCardIssueDate: parseExcelDate(row[15]),
                        idCardIssuePlace: row[16]?.toString(),
                        sourceCustomerPhone: row[17]?.toString()?.replace(/[^0-9]/g, ''),
                        bankAccount: row[18]?.toString(),
                        bankName: row[19]?.toString(),
                        categoryId: categoryId || '',
                    });
                }

                if (parsedItems.length === 0) {
                    setError('Không tìm thấy dữ liệu hợp lệ trong file');
                } else {
                    setItems(parsedItems);
                    setError(null);
                }
            } catch (err: any) {
                setError('Lỗi đọc file: ' + err.message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!warehouseId) { setError('Vui lòng chọn Kho nhận'); return; }
        if (!supplierId) { setError('Vui lòng chọn cửa hàng'); return; }
        if (!categoryId) { setError('Vui lòng chọn Danh mục sản phẩm'); return; }
        if (items.length === 0) { setError('Vui lòng tải lên danh sách máy'); return; }
        createMutation.mutate();
    };

    const totalValue = items.reduce((a, i) => a + (i.estimatedValue || 0) + (i.otherCosts || 0) + (i.topUp || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── Header ── */}
            <div>
                <button onClick={() => navigate('/trade-in-xiaomi')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, fontWeight: 600 }}>
                    <ArrowLeft size={15} /> Quay lại danh sách
                </button>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>Tạo lô thu cũ mới <span style={{ color: '#6366f1' }}>(Lô)</span></h1>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>Tải lên file Excel danh sách máy thu cũ từ cửa hàng Xiaomi</p>
            </div>

            {/* ── Error ── */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, color: '#be123c', fontSize: 13 }}>
                    <AlertCircle size={16} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be123c' }}><X size={15} /></button>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* ── Step 1: Thông tin chung ── */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>1</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>Thông tin chung</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Chọn cửa hàng gửi hàng và kho nhận</p>
                        </div>
                    </div>
                    <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                                <Building2 size={14} color="#6366f1" /> Cửa hàng gửi hàng <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required
                                style={{ width: '100%', height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 32, background: '#fff', outline: 'none', color: '#0f172a', appearance: 'none' }}>
                                <option value="">— Chọn Cửa hàng —</option>
                                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                                <WarehouseIcon size={14} color="#6366f1" /> Kho nhận hàng về <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required
                                style={{ width: '100%', height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 32, background: '#fff', outline: 'none', color: '#0f172a', appearance: 'none' }}>
                                <option value="">— Chọn Kho —</option>
                                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                                <FileSpreadsheet size={14} color="#6366f1" /> Danh mục sản phẩm <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
                                style={{ width: '100%', height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 32, background: '#fff', outline: 'none', color: '#0f172a', appearance: 'none' }}>
                                <option value="">— Chọn Danh mục —</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Step 2: Tải lên Excel ── */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>2</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>Tải lên file Excel</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>File phải có tiêu đề chứa STT hoặc IMEI</p>
                        </div>
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                        <label htmlFor="file-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '36px 24px', background: items.length > 0 ? '#f0fdf4' : '#fafbff', border: `2px dashed ${items.length > 0 ? '#86efac' : '#c7d2fe'}`, borderRadius: 14, cursor: 'pointer', transition: 'all .2s' }}>
                            {items.length > 0 ? (
                                <>
                                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(16,185,129,.3)' }}>
                                        <CheckCircle2 size={28} color="#fff" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontWeight: 800, color: '#065f46', fontSize: 15 }}>Đã đọc thành công!</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{fileName} — <strong style={{ color: '#059669' }}>{items.length} thiết bị</strong>, tổng <strong style={{ color: '#059669' }}>{fmt(totalValue)} đ</strong></p>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12, color: '#6366f1', textDecoration: 'underline' }}>Bấm để đổi file khác</p>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(99,102,241,.3)' }}>
                                        <FileSpreadsheet size={28} color="#fff" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#4338ca', fontSize: 14 }}>Kéo thả hoặc bấm để chọn file Excel</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Hỗ trợ .xlsx, .xls — tự động nhận diện cột</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eef2ff', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                                        <Upload size={12} /> Chọn tệp
                                    </div>
                                </>
                            )}
                            <input id="file-upload" name="file-upload" type="file" style={{ display: 'none' }} accept=".xlsx,.xls" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>

                {/* ── Preview Table ── */}
                {items.length > 0 && (
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>3</span>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>Xem trước dữ liệu</p>
                                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Kiểm tra kỹ trước khi lưu</p>
                                </div>
                            </div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 700 }}>
                                <CheckCircle2 size={13} /> {items.length} thiết bị sẵn sàng
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        {['STT', 'Số HĐ', 'Ngày mua', 'Nhân viên', 'Thiết bị', 'Serial/IMEI', 'Loại test', 'Giá thu', 'CP khác', 'Bù thêm', 'Tổng giá thu', 'Giá SC', 'Khách hàng', 'ĐT', 'CCCD', 'STK NH', 'Ngân hàng'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.contractNumber || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('vi-VN') : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.employeeName || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#0f172a' }}>{item.modelName}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace', color: '#475569' }}>{item.serialNumber || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.notes || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 700 }}>{item.estimatedValue ? fmt(item.estimatedValue) : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.otherCosts ? fmt(item.otherCosts) : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.topUp ? fmt(item.topUp) : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 800, color: '#6366f1' }}>{fmt((item.estimatedValue || 0) + (item.otherCosts || 0) + (item.topUp || 0))}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#f43f5e' }}>{item.repairCost ? fmt(item.repairCost) : '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.sourceCustomerName || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.sourceCustomerPhone || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{item.sourceCustomerIdCard || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{item.bankAccount || '—'}</td>
                                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{item.bankName || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Actions ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 32 }}>
                    <button type="button" onClick={() => navigate('/trade-in-xiaomi')}
                        style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        Hủy
                    </button>
                    <button type="submit" disabled={createMutation.isPending || items.length === 0 || !supplierId || !warehouseId}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,.35)', opacity: (createMutation.isPending || items.length === 0 || !supplierId || !warehouseId) ? 0.5 : 1 }}>
                        <Send size={15} />
                        {createMutation.isPending ? 'Đang tạo...' : `Tạo lô ${items.length > 0 ? `(${items.length} máy)` : ''}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
