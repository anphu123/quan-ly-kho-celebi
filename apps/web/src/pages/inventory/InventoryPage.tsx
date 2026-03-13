import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Search, Loader2, AlertTriangle,
  Database, Zap, Target,
  TrendingDown, TrendingUp, X, BarChart3, ArrowUpDown,
  BoxSelect, ShieldAlert
} from 'lucide-react';
import {
  inventoryApi,
  type SerialItem,
  type SerialStatus,
  STATUS_LABELS,
  IN_STOCK_STATUSES,
} from '../../lib/api/inventory.api';

const GRADE_LABELS: Record<string, string> = {
  GRADE_A_NEW: 'A+ Mới',
  GRADE_A: 'Hạng A',
  GRADE_B_PLUS: 'Hạng B+',
  GRADE_B: 'Hạng B',
  GRADE_C_PLUS: 'Hạng C+',
  GRADE_C: 'Hạng C',
  GRADE_D: 'Hạng D',
};

const STATUS_COLORS: Record<SerialStatus, string> = {
  INCOMING: 'ok',
  QC_IN_PROGRESS: 'low',
  AVAILABLE: 'ok',
  RESERVED: 'low',
  SOLD: 'none',
  REFURBISHING: 'low',
  DAMAGED: 'none',
  RETURNED: 'low',
  DISPOSED: 'none',
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SerialStatus | ''>('');
  const [adjustModal, setAdjustModal] = useState<SerialItem | null>(null);

  const { data: serialItems = [], isLoading } = useQuery({
    queryKey: ['inventory', searchTerm, statusFilter],
    queryFn: () => inventoryApi.getStockLevels({
      status: statusFilter || undefined,
      search: searchTerm || undefined,
      limit: 100,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryApi.getStats(),
  });

  const filteredItems = serialItems.filter(item =>
    !searchTerm ||
    item.productTemplate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.internalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const available = stats?.byStatus?.['AVAILABLE'] || 0;
  const incoming = stats?.byStatus?.['INCOMING'] || 0;
  const inQC = stats?.byStatus?.['QC_IN_PROGRESS'] || 0;
  const totalInStock = IN_STOCK_STATUSES.reduce((sum, s) => sum + (stats?.byStatus?.[s] || 0), 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <BarChart3 size={11} />
            Quản lý tồn kho
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Tồn kho <span>Thực tế</span></h1>
          <p className="page-desc">
            Giám sát từng thiết bị theo Serial/IMEI — trạng thái, vị trí và giá vốn.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="page-stats-grid">
        {[
          { label: 'Tổng trong kho', val: totalInStock, icon: BoxSelect, color: 'indigo', warn: false },
          { label: 'Mới nhập (Chờ QC)', val: incoming, icon: TrendingDown, color: 'amber', warn: incoming > 0 },
          { label: 'Sẵn sàng bán', val: available, icon: TrendingUp, color: 'emerald', warn: false },
          { label: 'Đang kiểm định', val: inQC, icon: ShieldAlert, color: 'purple', warn: false },
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

      {/* Table */}
      <div className="table-card">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-title-group">
            <div className="table-toolbar-icon"><Database size={18} /></div>
            <div>
              <p className="table-toolbar-title">Danh sách thiết bị trong kho</p>
              <p className="table-toolbar-count">
                <Zap size={12} />
                {filteredItems.length} thiết bị
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '30rem' }}>
            <div className="table-search-wrap" style={{ flex: 1 }}>
              <span className="table-search-icon"><Search size={16} /></span>
              <input
                type="text"
                placeholder="Tìm tên sản phẩm, Serial, mã nội bộ..."
                className="table-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                className="form-input"
                style={{ paddingRight: '2.5rem', cursor: 'pointer', height: '100%' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SerialStatus | '')}
              >
                <option value="">Tất cả trạng thái</option>
                {IN_STOCK_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Serial / Mã nội bộ</th>
                <th>Kho</th>
                <th className="center">Trạng thái</th>
                <th className="center">Phân hạng</th>
                <th className="right">Giá vốn</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
                      <p style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.875rem' }}>Đang đọc dữ liệu tồn kho...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="table-empty">
                      <div className="table-empty-icon"><Package size={24} /></div>
                      <p>
                        {searchTerm || statusFilter
                          ? 'Không tìm thấy thiết bị phù hợp.'
                          : 'Kho đang trống. Hãy tạo phiếu nhập kho để bắt đầu!'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                      {item.productTemplate?.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.125rem' }}>
                      {item.productTemplate?.category?.name} · {item.productTemplate?.brand?.name}
                    </span>
                  </td>
                  <td>
                    {item.serialNumber ? (
                      <span className="sku-badge" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        {item.serialNumber}
                      </span>
                    ) : null}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                      {item.internalCode}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                      {item.warehouse?.name || '—'}
                    </span>
                    {item.binLocation && (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {item.binLocation}
                      </span>
                    )}
                  </td>
                  <td className="center">
                    <span className={`stock-badge ${STATUS_COLORS[item.status] || ''}`}>
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </td>
                  <td className="center">
                    {item.grade ? (
                      <span className="chip">{GRADE_LABELS[item.grade] || item.grade}</span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td className="right" style={{ fontWeight: 700, color: '#0f172a' }}>
                    {formatCurrency(Number(item.currentCostPrice))}
                  </td>
                  <td className="right">
                    <button
                      className="tbl-action-btn"
                      style={{ marginLeft: 'auto', width: 'auto', padding: '0.5rem 0.875rem', gap: '0.375rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                      onClick={() => setAdjustModal(item)}
                    >
                      <ArrowUpDown size={14} /> Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status update modal */}
      {adjustModal && (
        <StatusModal
          item={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSuccess={() => {
            setAdjustModal(null);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
          }}
        />
      )}
    </div>
  );
}

function StatusModal({ item, onClose, onSuccess }: { item: SerialItem; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    status: item.status as SerialStatus,
    notes: '',
    binLocation: item.binLocation || '',
  });

  const mutation = useMutation({
    mutationFn: () => inventoryApi.adjustStock({
      serialItemId: item.id,
      status: formData.status,
      notes: formData.notes,
      binLocation: formData.binLocation || undefined,
    }),
    onSuccess,
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card sm">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon indigo"><ArrowUpDown size={20} /></div>
            <div>
              <p className="modal-title">Cập nhật trạng thái</p>
              <p className="modal-subtitle">{item.serialNumber || item.internalCode} — {item.productTemplate?.name}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Trạng thái mới</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={e => setFormData(p => ({ ...p, status: e.target.value as SerialStatus }))}
            >
              {(Object.keys(STATUS_LABELS) as SerialStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Vị trí kho (ô/kệ)</label>
            <input
              type="text"
              className="form-input"
              value={formData.binLocation}
              onChange={e => setFormData(p => ({ ...p, binLocation: e.target.value }))}
              placeholder="VD: A-1-05"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Ghi chú <span style={{ color: '#e11d48' }}>*</span></label>
            <textarea
              className="form-input"
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              style={{ resize: 'none' }}
              placeholder="VD: Đã QC xong, máy đạt hạng A..."
            />
          </div>

          {mutation.isError && (
            <div className="error-box">
              <AlertTriangle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
              <p>Không thể cập nhật. Vui lòng thử lại.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button
            className="btn-submit"
            disabled={mutation.isPending || !formData.notes}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
