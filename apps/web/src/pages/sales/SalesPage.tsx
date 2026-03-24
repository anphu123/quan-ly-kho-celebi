import { useState, useEffect } from 'react';
import {
  Receipt, Search, Eye, Download, Calendar,
  CreditCard, TrendingUp, Loader2,
  ArrowRightLeft
} from 'lucide-react';
import { salesApi, type SalesOrder } from '../../api/sales.api';

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 12, search: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  // Modal State
  const [activeOrder, setActiveOrder] = useState<SalesOrder | null>(null);

  useEffect(() => { loadData(); }, [query]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        salesApi.getAllOrders(query),
        salesApi.getStats()
      ]);
      setOrders(ordersRes.data);
      setPagination(ordersRes.pagination);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load sales data:', error);
    } finally { setLoading(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="stock-badge ok">HOÀN THÀNH</span>;
      case 'PENDING': return <span className="stock-badge low">CHỜ XỬ LÝ</span>;
      case 'CANCELLED': return <span className="stock-badge out">ĐÃ HỦY</span>;
      case 'REFUNDED': return <span className="stock-badge">CÓ HOÀN TIỀN</span>;
      default: return <span className="chip">{status}</span>;
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const order = await salesApi.getOrder(id);
      setActiveOrder(order);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng', err);
      alert('Không thể tải chi tiết đơn hàng.');
    }
  };

  return (
    <div className="animate-fade-in pb-24">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <ArrowRightLeft size={11} />
            Lịch sử giao dịch
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Quản lý <span>Đơn Bán Hàng</span></h1>
          <p className="page-desc">
            Theo dõi danh sách các đơn hàng đã chốt từ quầy Thu ngân (POS) và Online.
          </p>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="page-stats-grid mb-6">
        <div className="page-stat-card">
          <div className="page-stat-icon emerald"><TrendingUp size={20} /></div>
          <div>
            <p className="page-stat-label">Tổng doanh thu</p>
            <p className="page-stat-value text-emerald-600">{salesApi.formatCurrency(stats?.totalRevenue)}</p>
          </div>
        </div>
        <div className="page-stat-card">
          <div className="page-stat-icon indigo"><Receipt size={20} /></div>
          <div>
            <p className="page-stat-label">Tổng hóa đơn</p>
            <p className="page-stat-value">{stats?.totalOrders || 0}</p>
          </div>
        </div>
        <div className="page-stat-card">
          <div className="page-stat-icon purple"><CreditCard size={20} /></div>
          <div>
            <p className="page-stat-label">Hóa đơn hôm nay</p>
            <p className="page-stat-value">{stats?.todayOrders || 0}</p>
          </div>
        </div>
        <div className="page-stat-card">
          <div className="page-stat-icon amber"><Calendar size={20} /></div>
          <div>
            <p className="page-stat-label">Doanh thu hôm nay</p>
            <p className="page-stat-value">{salesApi.formatCurrency(stats?.todayRevenue)}</p>
          </div>
        </div>
      </div>

      {/* ─── Data Table ─── */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-title-group">
            <div className="table-toolbar-icon"><Receipt size={18} /></div>
            <div>
              <p className="table-toolbar-title">Danh sách Hóa đơn</p>
              <p className="table-toolbar-count">Tổng <strong style={{ color: '#4f46e5' }}>{pagination.total}</strong> đơn</p>
            </div>
          </div>

          <div className="flex gap-3 flex-1 max-w-lg">
            <div className="table-search-wrap flex-1">
              <span className="table-search-icon"><Search size={16} /></span>
              <input
                type="text" placeholder="Tìm theo ID Đơn, SĐT khách..." className="table-search"
                value={query.search || ''}
                onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[16rem]">
          {loading && !orders.length ? (
            <div className="table-loading flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <p className="text-slate-500 font-medium">Đang tải biểu mẫu...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon"><Receipt size={24} /></div>
              <p>Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Hóa đơn & Thời gian</th>
                  <th>Nhân viên Bán</th>
                  <th>Khách hàng</th>
                  <th className="center">Sản phẩm</th>
                  <th className="right">Tổng tiền</th>
                  <th className="center">Trạng thái</th>
                  <th className="right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleOpenDetail(order.id)}>
                    <td>
                      <span className="sku-badge block w-fit mb-1.5">{order.code}</span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> {salesApi.formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
                          {order.salesPerson.fullName.charAt(0)}
                        </div>
                        {order.salesPerson.fullName}
                      </span>
                    </td>
                    <td>
                      {order.customer ? (
                        <>
                          <span className="font-bold text-slate-800 block">{order.customer.fullName}</span>
                          <span className="text-xs font-medium text-slate-500 block mt-0.5">{order.customer.phone}</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-slate-400 italic">Khách lẻ / Khách lạ</span>
                      )}
                    </td>
                    <td className="center">
                      <span className="text-lg font-black text-slate-800 leading-none">{order.items?.length || 0}</span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-1 uppercase">Machine(s)</span>
                    </td>
                    <td className="right">
                      <span className="font-black text-emerald-600 block">{salesApi.formatCurrency(order.totalAmount)}</span>
                      {order.paidAmount < order.totalAmount && (
                        <span className="text-xs font-bold text-rose-500 block mt-0.5" title="Công nợ / Thiếu">Đã trả: {salesApi.formatCurrency(order.paidAmount)}</span>
                      )}
                    </td>
                    <td className="center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="right">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(order.id); }} className="tbl-action-btn bg-slate-900 text-white ml-auto">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      {activeOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <Receipt className="text-indigo-500" /> Hoá Đơn Bán Hàng #{activeOrder.code}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{salesApi.formatDate(activeOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(activeOrder.status)}
                <button onClick={() => setActiveOrder(null)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 font-bold transition-all">✕</button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
              {/* Metadata */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Nhân viên</span>
                  <span className="font-bold text-slate-800">{activeOrder.salesPerson.fullName}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Khách hàng</span>
                  <span className="font-bold text-slate-800">{activeOrder.customer?.fullName || 'Khách vãng lai'}</span>
                  {activeOrder.customer?.phone && <span className="text-xs text-slate-500 block mt-1">{activeOrder.customer.phone}</span>}
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 lg:col-span-2">
                  <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Ghi chú (Note)</span>
                  <span className="font-medium text-slate-700 italic">{activeOrder.notes || 'Không có ghi chú gì thêm.'}</span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Chi tiết thiết bị bán ra</h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="data-table !border-0 !m-0">
                    <thead className="bg-slate-50">
                      <tr>
                        <th>#</th>
                        <th>Sản phẩm & Serial</th>
                        <th className="right">Đơn giá thu (Đã fix)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrder.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="w-12 text-slate-400 font-bold">{idx + 1}</td>
                          <td>
                            <div className="font-bold text-slate-800 mb-1">{item.serialItem.productTemplate.name}</div>
                            <div className="flex gap-2 text-xs">
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.serialItem.serialNumber || item.serialItem.internalCode}</span>
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">SP đã xuất kho</span>
                            </div>
                          </td>
                          <td className="right font-bold text-slate-800">
                            {salesApi.formatCurrency(item.finalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700">
                <Download size={18} /> In hóa đơn POS
              </button>
              <div className="text-right">
                <span className="text-slate-400 text-sm font-medium mr-4">Tổng cộng:</span>
                <span className="text-2xl font-black text-emerald-400 tracking-tight">{salesApi.formatCurrency(activeOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
