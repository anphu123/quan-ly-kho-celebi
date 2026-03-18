import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutGrid, Box, BarChart3, ArrowDownLeft, Store,
  Truck, Users2, LogOut,
  Menu, Bell, Search, Settings2, Cpu, Command,
  MonitorPlay, FileOutput, Receipt, Terminal, Shield, Smartphone,
  FolderTree, Award, Printer
} from 'lucide-react';
import { useState } from 'react';

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
  { name: 'Thu cũ Xiaomi', href: '/trade-in-xiaomi', icon: Smartphone },
];

const adminOperations = [
  { name: 'Bảng vận hành quản trị', href: '/admin-ops', icon: Terminal, adminOnly: true },
];

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
            <button className="header-icon-btn">
              <Bell size={18} />
              <span className="header-notification-dot" />
            </button>
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
