import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageMinus, Clock, ShieldAlert, FileOutput } from 'lucide-react';
import { outboundApi } from '../../api/outbound.api';

export default function OutboundPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await outboundApi.getRecentTransactions();
            setTransactions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'RETURNED': return 'bg-orange-100 text-orange-700';
            case 'DISPOSAL': return 'bg-red-100 text-red-700';
            case 'RESERVED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="animate-fade-in pb-24">
            <div className="page-header mb-8">
                <div>
                    <div className="page-tag">
                        <FileOutput size={11} /> Xuất kho khác
                        <span className="page-tag-dot" />
                    </div>
                    <h1 className="page-title">Yêu cầu <span>Xuất kho</span></h1>
                    <p className="page-desc">
                        Quản lý các luồng xuất kho ngoài bán hàng (Trả NCC, Hủy, Chuyển kho).
                    </p>
                </div>
                <Link to="/outbound/new" className="page-action-btn">
                    <PackageMinus size={18} /> Lệnh xuất kho mới
                </Link>
            </div>

            <div className="table-card">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={16} className="text-indigo-500" /> Lịch sử Xuất Gần Đây
                    </h3>
                </div>

                <div className="overflow-x-auto min-h-[16rem]">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Đang tải biểu mẫu...</div>
                    ) : transactions.length === 0 ? (
                        <div className="table-empty">
                            <div className="table-empty-icon"><ShieldAlert size={24} /></div>
                            <p>Chưa có giao dịch xuất kho nào.</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Sản phẩm / IMEI</th>
                                    <th>Loại xuất kho</th>
                                    <th>Lý do & Ghi chú</th>
                                    <th>Nhân viên</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td className="font-medium text-slate-600">
                                            {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-800">{tx.serialItem?.productTemplate?.name || 'Unknown'}</div>
                                            <div className="font-mono text-xs text-slate-500">{tx.serialItem?.serialNumber || tx.serialItem?.internalCode}</div>
                                        </td>
                                        <td>
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${getStatusColor(tx.type)}`}>
                                                {outboundApi.getTypeLabel(tx.type)}
                                            </span>
                                        </td>
                                        <td className="text-sm italic text-slate-600">
                                            {tx.notes || '--'}
                                        </td>
                                        <td className="font-medium text-slate-800">
                                            {tx.performedBy?.fullName}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
