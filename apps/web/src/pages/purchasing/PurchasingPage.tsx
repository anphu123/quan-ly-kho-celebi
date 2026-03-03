import { ShoppingBag, Truck, Plus, PackageCheck, ClipboardList, Search, Filter, Zap } from 'lucide-react';

export default function PurchasingPage() {
  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <div className="page-tag">
            <Truck size={11} />
            Mua hàng &amp; Đơn đặt hàng
            <span className="page-tag-dot" style={{ background: '#3b82f6' }} />
          </div>
          <h1 className="page-title">Quản lý <span>Mua hàng</span></h1>
          <p className="page-desc">
            Lập đơn đặt hàng (PO), theo dõi trạng thái và kiểm soát nhập kho từ nhà cung cấp.
          </p>
        </div>
        <button className="page-action-btn">
          <Plus size={18} />
          Lập đơn mua (PO)
        </button>
      </div>

      <div className="page-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '36rem' }}>
        {[
          { label: 'Đơn đang chờ duyệt', val: '0', icon: ClipboardList, color: 'indigo', sub: 'Trong hàng đợi' },
          { label: 'Đơn hoàn tất (30 ngày)', val: '0', icon: PackageCheck, color: 'emerald', sub: 'Đã nhập kho' },
        ].map((s) => (
          <div key={s.label} className="page-stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1.75rem' }}>
            <div className={`page-stat-icon ${s.color}`} style={{ width: '3rem', height: '3rem', borderRadius: '1rem' }}><s.icon size={24} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className="page-stat-value" style={{ fontSize: '3rem' }}>{s.val}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-title-group">
            <div className="table-toolbar-icon"><ShoppingBag size={18} /></div>
            <div>
              <p className="table-toolbar-title">Danh sách đơn mua hàng</p>
              <p className="table-toolbar-count"><Zap size={12} /> Sẵn sàng tiếp nhận đơn mới</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '24rem' }}>
            <div className="table-search-wrap" style={{ flex: 1 }}>
              <span className="table-search-icon"><Search size={16} /></span>
              <input type="text" placeholder="Tìm PO ID, nhà cung cấp..." className="table-search" />
            </div>
            <button className="table-filter-btn"><Filter size={15} /></button>
          </div>
        </div>

        <div className="table-empty">
          <div className="table-empty-icon" style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem' }}>
            <ShoppingBag size={28} />
          </div>
          <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>Chưa có đơn mua hàng</p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '22rem', margin: '0 auto 1.5rem' }}>
            Tạo đơn đặt hàng đầu tiên để quản lý quy trình mua hàng từ nhà cung cấp.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="page-action-btn"><Plus size={16} /> Tạo đơn mua đầu tiên</button>
            <button className="table-filter-btn">Xem nhà cung cấp</button>
          </div>
        </div>

        <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', background: '#1e293b', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', color: '#818cf8' }}>
              <Truck size={16} />
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Trạng thái hệ thống</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>
                Kết nối nhà cung cấp: <span style={{ color: '#34d399', fontWeight: 900 }}>Hoạt động bình thường</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', background: '#1e293b', borderRadius: '0.875rem', border: '1px solid #334155', overflow: 'hidden' }}>
            {[{ label: 'Thời gian giao', value: '---' }, { label: 'Tỷ lệ thành công', value: '0%' }, { label: 'Độ trễ', value: 'Thấp' }].map((item, i, arr) => (
              <div key={item.label} style={{ padding: '0.5rem 1rem', borderRight: i < arr.length - 1 ? '1px solid #334155' : 'none', textAlign: 'center' }}>
                <p style={{ fontSize: '0.5625rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', marginTop: '0.125rem' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
