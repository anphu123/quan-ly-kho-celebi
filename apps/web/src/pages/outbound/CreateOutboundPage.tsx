import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BoxSelect, ScanLine, Trash2, Save, AlertCircle } from 'lucide-react';
import { outboundApi, type OutboundItem } from '../../api/outbound.api';
import { warehousesApi } from '../../lib/api/warehouses.api';
import { posApi } from '../../api/pos.api';

export default function CreateOutboundPage() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        warehouseId: '',
        type: 'RETURN_TO_VENDOR' as any,
        notes: '',
    });

    const [items, setItems] = useState<OutboundItem[]>([]);
    const [keyword, setKeyword] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        warehousesApi.getAll().then(res => {
            setWarehouses(res.data);
            if (res.data.length > 0) setFormData(p => ({ ...p, warehouseId: res.data[0].id }));
        });
    }, []);

    const handleSearchAndAdd = async () => {
        if (!formData.warehouseId || !keyword) return;
        try {
            setSearching(true);
            setError('');
            const results = await posApi.searchItems(formData.warehouseId, keyword);
            if (results.length === 0) {
                setError('Không tìm thấy sản phẩm hợp lệ trong kho xuất.');
            } else if (results.length === 1) {
                const item = results[0];
                if (!items.find(i => i.serialItemId === item.id)) {
                    setItems([...items, { serialItemId: item.id, serialNumber: item.serialNumber || item.internalCode, name: item.productTemplate.name }]);
                }
                setKeyword('');
            } else {
                setError('Tìm thấy nhiều thiết bị. Vui lòng nhập mã IMEI/Serial chính xác hơn.');
            }
        } catch (err) {
            setError('Lỗi khi tìm kiếm thiết bị.');
        } finally {
            setSearching(false);
        }
    };

    const handleRemoveItem = (id: string) => setItems(items.filter(i => i.serialItemId !== id));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setError('Vui lòng thêm ít nhất 1 sản phẩm.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await outboundApi.createOutbound({
                ...formData,
                items
            });
            navigate('/outbound', { state: { message: 'Tạo lệnh xuất kho thành công!' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tạo lệnh xuất kho.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-24">
            <div className="page-header mb-8">
                <div>
                    <button onClick={() => navigate('/outbound')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all mb-4">
                        <ArrowLeft size={14} /> Quay lại
                    </button>
                    <h1 className="page-title !mb-0">Tạo lệnh <span>Xuất kho</span></h1>
                    <p className="page-desc mt-2">Xuất trả hàng nhà cung cấp, hủy thiết bị hoặc luân chuyển nội bộ.</p>
                </div>
            </div>

            {error && (
                <div className="error-box mb-6">
                    <AlertCircle size={18} className="text-rose-600" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="table-card p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BoxSelect className="text-indigo-500" size={18} /> Thông tin lệnh xuất
                        </h3>

                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label>Loại nghiệp vụ</label>
                                <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="RETURN_TO_VENDOR">Trả hàng Nhà cung cấp</option>
                                    <option value="DISPOSAL">Xuất Hủy thiết bị hỏng</option>
                                    <option value="INTERNAL_TRANSFER">Xuất Luân chuyển nội bộ</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Kho xuất</label>
                                <select className="form-select" value={formData.warehouseId} onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ghi chú chung</label>
                                <textarea className="form-input" rows={3} placeholder="Mô tả lý do xuất kho..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="table-card p-6 flex flex-col h-full">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ScanLine className="text-indigo-500" size={18} /> Danh sách thiết bị (IMEI/Serial)
                        </h3>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Nhập hoặc quyét mã IMEI/Serial..."
                                className="form-input flex-1"
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearchAndAdd()}
                            />
                            <button
                                onClick={handleSearchAndAdd}
                                disabled={searching || !keyword}
                                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl"
                            >
                                {searching ? 'Đang tìm...' : 'Thêm'}
                            </button>
                        </div>

                        <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 min-h-[200px]">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-slate-400 h-full">
                                    <p>Chưa có thiết bị nào trong danh sách xuất.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col divide-y divide-slate-100">
                                    {items.map((item, idx) => (
                                        <div key={item.serialItemId} className="p-4 bg-white flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">{idx + 1}</span>
                                                <div>
                                                    <div className="font-bold text-slate-800 mb-1">{item.name}</div>
                                                    <div className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">{item.serialNumber}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Lý do xuất (tuỳ chọn)..."
                                                    className="text-sm border-b border-slate-200 outline-none w-48 focus:border-indigo-500 py-1"
                                                    value={item.notes || ''}
                                                    onChange={e => setItems(items.map(i => i.serialItemId === item.serialItemId ? { ...i, notes: e.target.value } : i))}
                                                />
                                                <button onClick={() => handleRemoveItem(item.serialItemId)} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 flex items-center justify-center transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || items.length === 0}
                                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all"
                            >
                                <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Lệnh Xuất Kho'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
