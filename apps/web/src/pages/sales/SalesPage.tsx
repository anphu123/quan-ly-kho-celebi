import { PlusCircle, TrendingUp, Receipt, Clock, ShoppingCart, Search, Filter, Zap, Database } from 'lucide-react';

export default function SalesPage() {
  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <div className="page-tag">
            <TrendingUp size={11} />
            Quản lý bán hàng
            <span className="page-tag-dot" style={{ background: '#10b981' }} />
          </div>
          <h1 className="page-title">Quản lý <span>Bán hàng</span></h1>
          <p className="page-desc">
            Theo dõi đơn hàng, doanh thu và phân tích hiệu suất kinh doanh theo thời gian thực.
          </p>
        </div>
        <button className="page-action-btn" style={{ background: '#10b981', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
          <PlusCircle size={18} />
          Tạo đơn hàng mới
        </button>
      </div>

      <div className="page-stats-grid">
        {[
          { label: 'Đơn hoàn tất hôm nay', val: '0', icon: TrendingUp, color: 'emerald' },
          { label: 'Doanh thu hôm nay', val: '0 ₫', icon: Receipt, color: 'indigo' },
          { label: 'Đơn đang xử lý', val: '0', icon: Clock, color: 'amber' },
          { label: 'Tổng đơn tháng này', val: '0', icon: ShoppingCart, color: 'purple' },
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
        <div className="table-toolbar">
          <div className="table-toolbar-title-group">
            <div className="table-toolbar-icon"><Database size={18} /></div>
            <div>
              <p className="table-toolbar-title">Danh sách đơn hàng</p>
              <p className="table-toolbar-count"><Zap size={12} /> Sẵn sàng tiếp nhận giao dịch mới</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '24rem' }}>
            <div className="table-search-wrap" style={{ flex: 1 }}>
              <span className="table-search-icon"><Search size={16} /></span>
              <input type="text" placeholder="Tìm mã hóa đơn, tên khách hàng..." className="table-search" />
            </div>
            <button className="table-filter-btn"><Filter size={15} /></button>
          </div>
        </div>

        {/* Empty state */}
        <div className="table-empty">
          <div className="table-empty-icon" style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem' }}>
            <ShoppingCart size={28} />
          </div>
          <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>Chưa có đơn hàng nào</p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '22rem', margin: '0 auto 1.5rem' }}>
            Sử dụng POS Station để tạo đơn hàng hoặc nhập thủ công tại đây.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <button className="page-action-btn" style={{ background: '#10b981' }}><PlusCircle size={16} /> Tạo đơn hàng</button>
            <button className="table-filter-btn">Mở POS Station</button>
          </div>
        </div>

        {/* Status footer */}
        <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', background: '#1e293b', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
              <TrendingUp size={16} style={{ color: '#34d399' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Trạng thái doanh thu</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>
                Hệ thống: <span style={{ color: '#34d399', fontWeight: 900 }}>Hoạt động bình thường</span>
              </p>
            </div>
          </div>
          <div style={{ padding: '0.375rem 0.875rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.625rem', fontSize: '0.625rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            POS đang online
          </div>
        </div>
      </div>
    </div>
  );
}
