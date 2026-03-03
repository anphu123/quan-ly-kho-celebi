import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Search, Loader2, AlertTriangle,
  Filter, Database, Zap, Target,
  TrendingDown, TrendingUp, X, RefreshCw, BarChart3, ArrowUpDown, BoxSelect
} from 'lucide-react';
import { inventoryApi, type StockLevel, type StockAdjustmentDto } from '../../lib/api/inventory.api';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustmentModal, setAdjustmentModal] = useState<StockLevel | null>(null);

  const { data: stockLevels = [], isLoading } = useQuery({
    queryKey: ['inventory', searchTerm],
    queryFn: () => inventoryApi.getStockLevels({}),
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.getLowStockProducts(),
  });

  const filteredStock = stockLevels.filter(s =>
    !searchTerm ||
    s.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.product?.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const outOfStock = stockLevels.filter(s => s.quantity <= 0).length;
  const lowStock = lowStockItems.length;

  const getStockStatus = (stock: StockLevel) => {
    if (stock.quantity <= 0) return { label: 'Hết hàng', variant: 'none', icon: TrendingDown };
    if (stock.quantity <= stock.minStockLevel) return { label: 'Cảnh báo', variant: 'low', icon: AlertTriangle };
    return { label: 'Bình thường', variant: 'ok', icon: TrendingUp };
  };

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
            Giám sát mức tồn kho theo thời gian thực, nhận cảnh báo sắp hết và điều chỉnh nhanh.
          </p>
        </div>
        <button
          className="page-action-btn"
          onClick={() => setAdjustmentModal(filteredStock[0] || null)}
        >
          <ArrowUpDown size={18} />
          Điều chỉnh tồn kho
        </button>
      </div>

      {/* Stats */}
      <div className="page-stats-grid">
        {[
          { label: 'Tổng SKU theo dõi', val: stockLevels.length, icon: BoxSelect, color: 'indigo', warn: false },
          { label: 'Sắp hết hàng', val: lowStock, icon: TrendingDown, color: 'amber', warn: lowStock > 0 },
          { label: 'Hết hàng', val: outOfStock, icon: AlertTriangle, color: 'rose', warn: outOfStock > 0 },
          { label: 'Kho hoạt động', val: new Set(stockLevels.map(s => s.warehouseId)).size, icon: RefreshCw, color: 'emerald', warn: false },
        ].map((s) => (
          <div key={s.label} className="page-stat-card">
            <div className={`page-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className={`page-stat-value${s.warn && s.color === 'amber' ? ' warn-amber' : s.warn && s.color === 'rose' ? ' warn-rose' : ''}`}>{s.val}</p>
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
              <p className="table-toolbar-title">Danh sách tồn kho</p>
              <p className="table-toolbar-count">
                <Zap size={12} />
                {filteredStock.length} / {stockLevels.length} bản ghi
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '24rem' }}>
            <div className="table-search-wrap" style={{ flex: 1 }}>
              <span className="table-search-icon"><Search size={16} /></span>
              <input
                type="text"
                placeholder="Tìm SKU, tên sản phẩm..."
                className="table-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="table-filter-btn"><Filter size={15} /></button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Kho</th>
                <th className="center">Tồn kho</th>
                <th className="center">Khả dụng</th>
                <th className="center">Trạng thái</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
                      <p style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.875rem' }}>Đang đọc dữ liệu tồn kho...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <div className="table-empty-icon"><Package size={24} /></div>
                      <p>Không có dữ liệu tồn kho. Nhập hàng để bắt đầu!</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStock.map((stock) => {
                const status = getStockStatus(stock);
                return (
                  <tr key={stock.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{stock.product?.name}</span>
                      <span className="sku-badge" style={{ marginTop: '0.25rem' }}>{stock.product?.sku}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{stock.warehouse?.name || '—'}</span>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{stock.warehouse?.code}</p>
                    </td>
                    <td className="center">
                      <span style={{
                        fontSize: '1.5rem', fontWeight: 900, lineHeight: 1,
                        color: stock.quantity <= 0 ? '#e11d48' : stock.quantity <= stock.minStockLevel ? '#d97706' : '#0f172a'
                      }}>{stock.quantity}</span>
                      <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.125rem' }}>
                        {stock.product?.baseUnit?.symbol || 'U'}
                      </p>
                    </td>
                    <td className="center" style={{ fontWeight: 700, color: '#0f172a' }}>{stock.availableQuantity}</td>
                    <td className="center">
                      <span className={`stock-badge ${status.variant}`} style={{ gap: '0.375rem' }}>
                        <status.icon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="right">
                      <button
                        className="tbl-action-btn"
                        style={{ marginLeft: 'auto', width: 'auto', padding: '0.5rem 0.875rem', gap: '0.375rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                        onClick={() => setAdjustmentModal(stock)}
                      >
                        <ArrowUpDown size={14} /> Điều chỉnh
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment modal */}
      {adjustmentModal && (
        <AdjustmentModal
          stockLevel={adjustmentModal}
          onClose={() => setAdjustmentModal(null)}
          onSuccess={() => {
            setAdjustmentModal(null);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['low-stock'] });
          }}
        />
      )}
    </div>
  );
}

function AdjustmentModal({ stockLevel, onClose, onSuccess }: { stockLevel: StockLevel; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    productId: stockLevel.productId,
    warehouseId: stockLevel.warehouseId,
    newQuantity: stockLevel.quantity,
    reason: ''
  });

  const mutation = useMutation({
    mutationFn: (data: StockAdjustmentDto) => inventoryApi.adjustStock(data),
    onSuccess
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'newQuantity' ? Number(value) : value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card sm">

        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon indigo"><ArrowUpDown size={20} /></div>
            <div>
              <p className="modal-title">Điều chỉnh tồn kho</p>
              <p className="modal-subtitle">{stockLevel.product?.sku} — {stockLevel.product?.name}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Current stock display */}
          <div style={{
            background: '#f8fafc', borderRadius: '0.875rem', padding: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1.25rem', border: '1px solid #f1f5f9'
          }}>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Tồn kho hiện tại</p>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {stockLevel.quantity}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>{stockLevel.product?.baseUnit?.symbol || 'U'}</span>
              </p>
            </div>
            <div style={{ width: '2.75rem', height: '2.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Package size={20} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Số lượng mới (sau điều chỉnh)</label>
            <input
              type="number" name="newQuantity" min={0}
              value={formData.newQuantity} onChange={handleChange} required
              className="form-input"
              style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900 }}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Lý do điều chỉnh <span style={{ color: '#e11d48' }}>*</span></label>
            <textarea
              name="reason" value={formData.reason} onChange={handleChange} required rows={3}
              className="form-input"
              style={{ resize: 'none' }}
              placeholder="VD: Kiểm kê thực tế, hàng hư hỏng, sai lệch nhập kho..."
            />
          </div>

          {mutation.isError && (
            <div className="error-box">
              <AlertTriangle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
              <p>Không thể điều chỉnh. Kiểm tra thông tin.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button
            className="btn-submit"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(formData)}
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            Xác nhận điều chỉnh
          </button>
        </div>

      </div>
    </div>
  );
}