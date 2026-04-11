import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ScrollText, Search, RefreshCw, Filter,
  ArrowRightLeft, BarChart2, PackageCheck, Loader2,
  ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react';
import api from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type LogType = 'ALL' | 'SERIAL' | 'STOCK' | 'INBOUND';

interface LogEntry {
  id: string;
  logType: LogType;
  createdAt: string;
  action: string;
  description: string;
  detail?: string;
  subject?: string;
  subjectId?: string;
  warehouse?: string;
  actor?: string;
  actorId?: string;
  meta?: Record<string, any>;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const LOG_TYPE_CONFIG: Record<LogType, { label: string; color: string; bg: string; icon: any }> = {
  ALL:     { label: 'Tất cả',    color: '#64748b', bg: '#f1f5f9',  icon: ScrollText },
  SERIAL:  { label: 'Serial',    color: '#6366f1', bg: '#eef2ff',  icon: ArrowRightLeft },
  STOCK:   { label: 'Tồn kho',   color: '#059669', bg: '#ecfdf5',  icon: BarChart2 },
  INBOUND: { label: 'Nhập kho',  color: '#d97706', bg: '#fffbeb',  icon: PackageCheck },
};

const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  // Serial statuses
  INBOUND:        { color: '#6366f1', bg: '#eef2ff' },
  QC_START:       { color: '#0891b2', bg: '#ecfeff' },
  QC_COMPLETE:    { color: '#059669', bg: '#ecfdf5' },
  MOVE_TO_REFURB: { color: '#7c3aed', bg: '#ede9fe' },
  REFURB_COMPLETE:{ color: '#059669', bg: '#ecfdf5' },
  MOVE_TO_SALE:   { color: '#db2777', bg: '#fdf2f8' },
  RESERVED:       { color: '#d97706', bg: '#fffbeb' },
  SOLD:           { color: '#16a34a', bg: '#dcfce7' },
  RETURNED:       { color: '#9a3412', bg: '#ffedd5' },
  DISPOSAL:       { color: '#9f1239', bg: '#fff1f2' },
  // Stock movements
  IN:             { color: '#059669', bg: '#ecfdf5' },
  OUT:            { color: '#dc2626', bg: '#fee2e2' },
  ADJUSTMENT:     { color: '#7c3aed', bg: '#ede9fe' },
  TRANSFER_IN:    { color: '#0891b2', bg: '#ecfeff' },
  TRANSFER_OUT:   { color: '#ea580c', bg: '#fff7ed' },
  RESERVE:        { color: '#d97706', bg: '#fffbeb' },
  UNRESERVE:      { color: '#64748b', bg: '#f1f5f9' },
  // Inbound statuses
  REQUESTED:             { color: '#64748b', bg: '#f1f5f9' },
  PENDING_APPROVAL:      { color: '#d97706', bg: '#fffbeb' },
  IN_PROGRESS:           { color: '#6366f1', bg: '#eef2ff' },
  PENDING_WAREHOUSE_ENTRY:{ color: '#0891b2', bg: '#ecfeff' },
  COMPLETED:             { color: '#059669', bg: '#ecfdf5' },
  REJECTED:              { color: '#dc2626', bg: '#fee2e2' },
  CANCELLED:             { color: '#9f1239', bg: '#fff1f2' },
};

// ─── API ─────────────────────────────────────────────────────────────────────

const logsApi = {
  getLogs: async (params: Record<string, any>) => {
    const { data } = await api.get('/logs', { params });
    return data as { data: LogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } };
  },
  getStats: async () => {
    const { data } = await api.get('/logs/stats');
    return data as { serial24h: number; stock24h: number; inbound24h: number; total24h: number };
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function LogsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LogType>('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['logs', activeTab, search, startDate, endDate, page],
    queryFn: () => logsApi.getLogs({ type: activeTab, search: search || undefined, startDate: startDate || undefined, endDate: endDate || undefined, page, limit }),
  });

  const { data: stats } = useQuery({
    queryKey: ['logs-stats'],
    queryFn: logsApi.getStats,
    staleTime: 60_000,
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const handleTabChange = (t: LogType) => { setActiveTab(t); setPage(1); };

  const navigateToSubject = (log: LogEntry) => {
    if (log.logType === 'SERIAL' && log.subjectId) navigate(`/inventory/${log.subjectId}`);
    else if (log.logType === 'INBOUND' && log.subjectId) navigate(`/inbound/${log.subjectId}`);
  };

  const fmt = (dt: string) => {
    const d = new Date(dt);
    return { date: d.toLocaleDateString('vi-VN'), time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <ScrollText size={11} />
            Hệ thống
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Nhật ký <span>Hoạt động</span></h1>
          <p className="page-desc">Theo dõi toàn bộ hoạt động: nhập kho, serial, tồn kho.</p>
        </div>
        <button className="table-filter-btn" onClick={() => refetch()} style={{ padding: '0.875rem 1.25rem' }}>
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Stats 24h */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Tổng hoạt động 24h', value: stats.total24h,   color: '#6366f1', bg: '#eef2ff' },
            { label: 'Serial transactions', value: stats.serial24h,  color: '#6366f1', bg: '#eef2ff' },
            { label: 'Stock movements',     value: stats.stock24h,   color: '#059669', bg: '#ecfdf5' },
            { label: 'Phiếu nhập kho',      value: stats.inbound24h, color: '#d97706', bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="table-filter-bar" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
          {(Object.keys(LOG_TYPE_CONFIG) as LogType[]).map(t => {
            const c = LOG_TYPE_CONFIG[t];
            const Icon = c.icon;
            return (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: activeTab === t ? '#fff' : 'transparent',
                  color: activeTab === t ? c.color : '#64748b',
                  boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} /> {c.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 240 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32, height: 38 }}
              placeholder="Tìm serial, mã phiếu, tên sản phẩm..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn-primary" style={{ height: 38, padding: '0 14px' }} onClick={handleSearch}>
            <Search size={14} />
          </button>
        </div>

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} style={{ color: '#94a3b8' }} />
          <input type="date" className="form-input" style={{ height: 38, width: 140 }} value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
          <input type="date" className="form-input" style={{ height: 38, width: 140 }} value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ width: 130 }}>Thời gian</th>
                <th style={{ width: 100 }}>Loại</th>
                <th style={{ width: 130 }}>Hành động</th>
                <th>Mô tả</th>
                <th style={{ width: 140 }}>Kho</th>
                <th style={{ width: 140 }}>Người thực hiện</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: 13 }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : logs.map(log => {
                const typeConf = LOG_TYPE_CONFIG[log.logType];
                const actionConf = ACTION_COLORS[log.action] || { color: '#64748b', bg: '#f1f5f9' };
                const { date, time } = fmt(log.createdAt);
                const canNav = log.logType === 'SERIAL' || log.logType === 'INBOUND';

                return (
                  <tr key={log.id} style={{ cursor: canNav ? 'pointer' : 'default' }} onClick={() => canNav && navigateToSubject(log)}>
                    <td>
                      <span style={{ display: 'block', fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{time}</span>
                      <span style={{ color: '#94a3b8', fontSize: 11 }}>{date}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: typeConf.bg, color: typeConf.color }}>
                        <typeConf.icon size={11} />
                        {typeConf.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: actionConf.bg, color: actionConf.color }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'block', color: '#0f172a', fontWeight: 500 }}>{log.description}</span>
                      {log.detail && <span style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginTop: 2 }}>{log.detail}</span>}
                    </td>
                    <td style={{ color: '#475569' }}>{log.warehouse || '—'}</td>
                    <td style={{ color: '#475569' }}>{log.actor || '—'}</td>
                    <td>
                      {canNav && (
                        <button
                          onClick={e => { e.stopPropagation(); navigateToSubject(log); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 4 }}
                        >
                          <ExternalLink size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid #e2e8f0', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>
              {((page - 1) * limit) + 1}–{Math.min(page * limit, meta.total)} / {meta.total.toLocaleString()} bản ghi
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="table-filter-btn"
                style={{ padding: '6px 10px' }}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={`table-filter-btn${page === p ? ' active' : ''}`}
                    style={{ padding: '6px 12px', background: page === p ? '#6366f1' : undefined, color: page === p ? '#fff' : undefined }}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                className="table-filter-btn"
                style={{ padding: '6px 10px' }}
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
