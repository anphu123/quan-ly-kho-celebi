import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, Search, BoxSelect, Clock, CheckCircle2,
  AlertCircle, Eye, PenBox, Loader2, ChevronRight, ArrowRightLeft
} from 'lucide-react';
import { inboundApi, type InboundRequest, type InboundStats, type InboundQuery } from '../../api/inbound.api';

export default function InboundPage() {
  const [requests, setRequests] = useState<InboundRequest[]>([]);
  const [stats, setStats] = useState<InboundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<InboundQuery>({ page: 1, limit: 12 });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  useEffect(() => { loadData(); }, [query]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, statsResponse] = await Promise.all([
        inboundApi.getAllRequests(query),
        inboundApi.getStats()
      ]);
      setRequests(requestsResponse.data);
      setPagination(requestsResponse.pagination);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to load inbound data:', error);
    } finally { setLoading(false); }
  };

  const statusVariant = (status: string) => {
    if (status === 'COMPLETED') return 'stock-badge ok';
    if (status === 'IN_PROGRESS') return 'stock-badge low';
    if (status === 'REQUESTED') return 'stock-badge';
    return 'chip';
  };

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <div className="page-tag">
            <ArrowRightLeft size={11} />
            Luồng nhập kho
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Quản lý <span>Nhập kho</span></h1>
          <p className="page-desc">
            Theo dõi dòng chảy hàng hóa từ nhà cung cấp, kiểm duyệt QA và nhập kho thực tế.
          </p>
        </div>
        <Link to="/inbound/new" className="page-action-btn">
          <Plus size={18} />
          Lập phiếu nhập kho
        </Link>
      </div>

      <div className="page-stats-grid">
        {[
          { label: 'Tổng phiếu nhập', val: stats?.totalRequests || 0, icon: BoxSelect, color: 'indigo' },
          { label: 'Chờ xử lý', val: stats?.pendingRequests || 0, icon: Clock, color: 'amber' },
          { label: 'Đang kiểm nhận (QA)', val: stats?.inProgressRequests || 0, icon: AlertCircle, color: 'purple' },
          { label: 'Hoàn tất', val: stats?.completedRequests || 0, icon: CheckCircle2, color: 'emerald' },
        ].map((s) => (
          <div key={s.label} className="page-stat-card">
            <div className={`page-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className="page-stat-value">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-card">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-title-group">
            <div className="table-toolbar-icon"><Package size={18} /></div>
            <div>
              <p className="table-toolbar-title">Danh sách phiếu nhập kho</p>
              <p className="table-toolbar-count">Tổng <strong style={{ color: '#4f46e5' }}>{pagination.total}</strong> phiếu</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '30rem' }}>
            <div className="table-search-wrap" style={{ flex: 1 }}>
              <span className="table-search-icon"><Search size={16} /></span>
              <input
                type="text" placeholder="Tìm mã phiếu, nhà cung cấp..." className="table-search"
                value={query.search || ''}
                onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                className="form-input" style={{ paddingRight: '2.5rem', cursor: 'pointer', height: '100%' }}
                value={query.status || ''}
                onChange={(e) => setQuery({ ...query, status: e.target.value as any || undefined, page: 1 })}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="REQUESTED">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang kiểm nhận</option>
                <option value="COMPLETED">Đã nhập kho</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
              <ChevronRight size={15} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: '16rem' }}>
          {loading && !requests.length ? (
            <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>Đang tải phiếu nhập kho...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon"><Package size={24} /></div>
              <p>Không có phiếu nhập nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã phiếu &amp; Ngày</th>
                  <th>Nhà cung cấp</th>
                  <th className="center">Số SKU</th>
                  <th className="right">Giá trị ước tính</th>
                  <th className="center">Trạng thái</th>
                  <th className="right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <span className="sku-badge" style={{ display: 'block', width: 'fit-content', marginBottom: '0.375rem' }}>{request.code}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> {inboundApi.formatDate(request.createdAt).split(' ')[0]}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', display: 'block' }}>{request.supplierName}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '0.125rem 0.5rem', borderRadius: '0.375rem', display: 'inline-block', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {inboundApi.getSupplierTypeLabel(request.supplierType)}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, display: 'block' }}>{request.items.length}</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                        {request.items.filter(i => i.isReceived).length} đã QA
                      </span>
                    </td>
                    <td className="right">
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{inboundApi.formatCurrency(request.totalEstimatedValue)}</span>
                      {(request.totalActualValue ?? 0) > 0 && (
                        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#10b981', marginTop: '0.125rem' }}>
                          Thực: {inboundApi.formatCurrency(request.totalActualValue ?? 0)}
                        </p>
                      )}
                    </td>
                    <td className="center">
                      <span className={statusVariant(request.status)}>
                        {inboundApi.getStatusBadge(request.status)}
                      </span>
                    </td>
                    <td className="right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        {request.status === 'REQUESTED' && (
                          <Link to={`/inbound/${request.id}/edit`} className="tbl-action-btn">
                            <PenBox size={15} />
                          </Link>
                        )}
                        <Link to={`/inbound/${request.id}`} className="tbl-action-btn" style={{ background: '#0f172a', color: 'white' }}>
                          <Eye size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="table-pagination">
            <p className="table-pagination-info">
              Trang <strong>{pagination.page}</strong> / {pagination.totalPages}
            </p>
            <div className="table-pagination-btns">
              <button className="table-page-btn" disabled={pagination.page === 1}
                onClick={() => setQuery({ ...query, page: pagination.page - 1 })}>
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Trước
              </button>
              <button className="table-page-btn" disabled={pagination.page === pagination.totalPages}
                onClick={() => setQuery({ ...query, page: pagination.page + 1 })}>
                Tiếp <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
