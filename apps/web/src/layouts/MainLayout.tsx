import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutGrid, Box, BarChart3, ArrowDownLeft, Store,
  Truck, Users2, LogOut,
  Menu, Bell, Search, Settings2, Cpu, Command,
  MonitorPlay, FileOutput, Receipt, Terminal, Shield, Smartphone,
  FolderTree, Award, Printer, UserCog, Package, ChevronRight, X, ScrollText
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inboundApi } from '../api/inbound.api';

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutGrid },
  { name: 'Sản phẩm', href: '/products', icon: Box },
  { name: 'Khách hàng', href: '/customers', icon: Users2 },
  { name: 'Đối tác', href: '/suppliers', icon: Truck },
  { name: 'Danh mục', href: '/categories', icon: FolderTree },
  { name: 'Thương hiệu', href: '/brands', icon: Award },
];

const operations = [
  { name: 'POS Bán hàng', href: '/pos', icon: MonitorPlay, external: true },
  { name: 'Đơn bán (Sales)', href: '/sales', icon: Receipt },
  { name: 'Tồn kho', href: '/inventory', icon: Store },
  { name: 'In tem nhãn', href: '/inventory/print-label', icon: Printer },
  { name: 'Tồn kho tổng hợp', href: '/stock/levels', icon: BarChart3 },
  { name: 'Nhập kho (Inbound)', href: '/inbound', icon: ArrowDownLeft },
  { name: 'Xuất kho (Outbound)', href: '/outbound', icon: FileOutput },
  { name: 'Thu cũ (Trade-in)', href: '/trade-in', icon: Smartphone },
];

const adminOperations = [
  { name: 'Nhật ký hoạt động', href: '/logs', icon: ScrollText },
  { name: 'Tài khoản & Phân quyền', href: '/users', icon: UserCog },
  { name: 'Bảng vận hành quản trị', href: '/admin-ops', icon: Terminal },
];

function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const canApprove = user?.role === 'SUPER_ADMIN' || user?.role === 'INVENTORY_MANAGER';

  const { data } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => inboundApi.getPendingApprovals(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    enabled: canApprove,
  });

  const items = data?.data ?? [];
  const count = items.length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="header-icon-btn"
        onClick={() => setOpen(o => !o)}
        title={count > 0 ? `${count} phiếu chờ duyệt` : 'Thông báo'}
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: '#ef4444', color: '#fff',
            borderRadius: '99px', fontSize: 10, fontWeight: 800,
            minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', lineHeight: 1, border: '2px solid #fff',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, background: '#fff', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,.14)', border: '1px solid #e2e8f0',
          zIndex: 9999, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Thông báo</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <X size={14} />
            </button>
          </div>

          {/* List */}
          {count === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Không có thông báo mới
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {count} phiếu cần xử lý
                {user?.managedWarehouses && user.managedWarehouses.length > 0 && (
                  <span style={{ fontWeight: 400, color: '#94a3b8', textTransform: 'none', marginLeft: 6 }}>
                    · {user.managedWarehouses.map(w => w.name).join(', ')}
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {items.map(req => (
                  <button
                    key={req.id}
                    onClick={() => { navigate(`/inbound/${req.id}`); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', borderBottom: '1px solid #f8fafc',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={15} style={{ color: '#f97316' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{req.code}</span>
                        {req.status === 'PENDING_WAREHOUSE_ENTRY'
                          ? <span style={{ background: '#faf5ff', color: '#7e22ce', borderRadius: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>CHỜ DUYỆT NHẬP KHO</span>
                          : <span style={{ background: '#fff7ed', color: '#c2410c', borderRadius: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>CHỜ DUYỆT</span>
                        }
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.supplierName} · {req.warehouse?.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                        {new Date(req.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <ChevronRight size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
              <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => { navigate('/inbound'); setOpen(false); }}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 700, color: '#6366f1', cursor: 'pointer' }}
                >
                  Xem tất cả phiếu chờ duyệt
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Cpu size={18} strokeWidth={2.5} />
          </div>
          <span className="sidebar-brand-name">Celebi <span>OS</span></span>
        </div>

        <div className="sidebar-scroll">
          {/* Nav */}
          <nav className="sidebar-nav">
            {operations.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && item.href !== '/dashboard' || location.pathname === item.href;
              return (
                <div key={item.name}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="sidebar-nav-link text-indigo-300">
                      <item.icon size={20} className="w-5" /> <span>{item.name}</span>
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className={`sidebar-nav-link${isActive ? ' active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={20} className="w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <p className="sidebar-section-label mt-6">Quản trị</p>
          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && item.href !== '/dashboard' || location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
            <Link to="/warehouses" className={`sidebar-nav-link${location.pathname.startsWith('/warehouses') ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Cpu size={18} strokeWidth={location.pathname.startsWith('/warehouses') ? 2.5 : 2} />
              Quản lý kho
            </Link>
          </nav>

          {user?.role === 'SUPER_ADMIN' && (
            <>
              <p className="sidebar-section-label mt-6" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={14} style={{ color: '#dc2626' }} />
                Super Admin
              </p>
              <nav className="sidebar-nav">
                {adminOperations.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`sidebar-nav-link${isActive ? ' active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                      style={{ background: isActive ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'transparent', color: isActive ? 'white' : '#64748b' }}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* User section */}
        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.fullName || 'Manager'}</p>
              <p className="sidebar-user-role">{user?.role || 'Administrator'}</p>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Đăng xuất">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="app-main">

        {/* Header */}
        <header className="app-header">
          <div className="app-header-left">
            <button
              className="header-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="header-search">
              <Search size={16} />
              <input type="text" placeholder="Tìm nhanh..." />
              <div className="header-search-kbd">
                <Command size={10} /> K
              </div>
            </div>
          </div>

          <div className="app-header-right">
            <NotificationBell />
            <button className="header-icon-btn">
              <Settings2 size={18} />
            </button>
            <div className="header-divider" />
            <Link to="/pos" className="header-pos-btn">
              <BarChart3 size={15} />
              Bán hàng POS
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="app-content">
          <div className="app-content-inner">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}
