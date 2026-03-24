import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, Search, TrendingDown, AlertTriangle, 
  BarChart3, Loader2, RefreshCw, Box,
  Warehouse as WarehouseIcon, Tag, Activity
} from 'lucide-react';
import { stockApi } from '../../lib/api/stock.api';
import { warehousesApi } from '../../lib/api/warehouses.api';

export default function StockLevelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'available'>('all');

  const { data: stockLevels, isLoading, refetch } = useQuery({
    queryKey: ['stock-levels', warehouseFilter],
    queryFn: () => stockApi.getStockLevels(warehouseFilter || undefined),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAll({ page: 1, limit: 100 }),
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock', warehouseFilter],
    queryFn: () => stockApi.getLowStockProducts(warehouseFilter || undefined),
  });

  // Filter stock levels
  const filteredStockLevels = stockLevels?.filter(item => {
    const matchSearch = !searchTerm || 
      item.productTemplate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productTemplate.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'low' && item.availableQty <= item.reorderPoint) ||
      (statusFilter === 'available' && item.availableQty > 0);
    
    return matchSearch && matchStatus;
  }) || [];

  // Calculate stats
  const stats = {
    totalProducts: new Set(stockLevels?.map(s => s.productTemplateId)).size,
    totalPhysical: stockLevels?.reduce((sum, s) => sum + s.physicalQty, 0) || 0,
    totalAvailable: stockLevels?.reduce((sum, s) => sum + s.availableQty, 0) || 0,
    totalValue: stockLevels?.reduce((sum, s) => sum + s.totalValue, 0) || 0,
    lowStockCount: lowStockItems?.length || 0,
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <BarChart3 size={11} />
            Quản lý tồn kho
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Tồn kho <span>Tổng hợp</span></h1>
          <p className="page-desc">
            Theo dõi tồn kho theo sản phẩm, kho và trạng thái. Cảnh báo sắp hết hàng.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="table-filter-btn" 
            onClick={() => refetch()}
            style={{ padding: '0.875rem 1.25rem' }}
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="page-stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Tổng SKU', value: stats.totalProducts, icon: Box, color: 'indigo', desc: 'Sản phẩm khác nhau' },
          { label: 'Tồn vật lý', value: stats.totalPhysical, icon: Package, color: 'blue', desc: 'Tổng trong kho' },
          { label: 'Sẵn bán', value: stats.totalAvailable, icon: Activity, color: 'emerald', desc: 'Có thể bán ngay' },
          { label: 'Giá trị tồn', value: stockApi.formatCurrency(stats.totalValue), icon: BarChart3, color: 'purple', desc: 'Tổng giá vốn', isText: true },
        ].map((s) => (
          <div key={s.label} className="page-stat-card">
            <div className={`page-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className="page-stat-value">
                {(s as any).isText ? s.value : (s.value as number).toLocaleString()}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {stats.lowStockCount > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
          border: '2px solid #fbbf24',
          borderRadius: '1rem',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            background: '#f59e0b', 
            borderRadius: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: '#92400e', marginBottom: '0.25rem' }}>
              Cảnh báo: {stats.lowStockCount} sản phẩm sắp hết hàng
            </p>
            <p style={{ fontSize: '0.875rem', color: '#b45309' }}>
              Một số sản phẩm đã xuống dưới mức tồn tối thiểu. Cần nhập hàng bổ sung.
            </p>
          </div>
          <button
            className="btn-submit"
            onClick={() => setStatusFilter('low')}
            style={{ background: '#f59e0b', flexShrink: 0 }}
          >
            <TrendingDown size={16} />
            Xem chi tiết
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="table-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="table-search-wrap" style={{ flex: 1, minWidth: '250px' }}>
            <span className="table-search-icon"><Search size={16} /></span>
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, SKU, kho..."
              className="table-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Warehouse filter */}
          <select
            className="table-filter-btn"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="">Tất cả kho</option>
            {warehouses?.data?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.75rem' }}>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'available', label: 'Sẵn bán' },
              { value: 'low', label: 'Sắp hết' },
            ].map(status => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value as any)}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  background: statusFilter === status.value ? 'white' : 'transparent',
                  color: statusFilter === status.value ? '#4f46e5' : '#64748b',
                  fontWeight: statusFilter === status.value ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: statusFilter === status.value ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock levels table */}
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Đang tải tồn kho...</p>
          </div>
        ) : filteredStockLevels.length === 0 ? (
          <div style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="table-empty-icon" style={{ margin: '0 auto 1rem' }}>
              <Package size={24} />
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              Không có dữ liệu tồn kho
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm nào trong kho'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '280px' }}>Sản phẩm</th>
                  <th>Kho</th>
                  <th>Phân hạng</th>
                  <th className="text-right">Tồn vật lý</th>
                  <th className="text-right">Sẵn bán</th>
                  <th className="text-right">Đã đặt</th>
                  <th className="text-right">Chờ xử lý</th>
                  <th className="text-right">Giá trị</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredStockLevels.map((stock) => {
                  const pendingQty = stock.incomingQty + stock.qcInProgressQty + stock.refurbishingQty + stock.returnedQty;
                  const isLowStock = stock.availableQty <= stock.reorderPoint;
                  const availablePercent = stock.physicalQty > 0 
                    ? Math.round((stock.availableQty / stock.physicalQty) * 100)
                    : 0;

                  return (
                    <tr key={stock.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                            borderRadius: '0.625rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Package size={18} style={{ color: '#4f46e5' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                              {stock.productTemplate.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="sku-badge">{stock.productTemplate.sku}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {stock.productTemplate.brand.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <WarehouseIcon size={14} style={{ color: '#94a3b8' }} />
                          <span style={{ fontWeight: 600, color: '#475569' }}>
                            {stock.warehouse.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          background: `${stockApi.getGradeColor(stock.grade)}15`,
                          color: stockApi.getGradeColor(stock.grade),
                        }}>
                          <Tag size={12} />
                          {stockApi.getGradeLabel(stock.grade)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                          {stock.physicalQty}
                        </span>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981' }}>
                            {stock.availableQty}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {availablePercent}% khả dụng
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                          {stock.reservedQty}
                        </span>
                      </td>
                      <td className="text-right">
                        <span style={{ fontWeight: 600, color: '#6366f1' }}>
                          {pendingQty}
                        </span>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.125rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {stockApi.formatCurrency(stock.totalValue)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            TB: {stockApi.formatCurrency(stock.averageCost)}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        {isLowStock ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            background: '#fef3c7',
                            color: '#d97706',
                            border: '1px solid #fde68a'
                          }}>
                            <AlertTriangle size={14} />
                            Sắp hết
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0'
                          }}>
                            ✓ Đủ hàng
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
