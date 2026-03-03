import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutGrid, Box, BarChart3, ArrowDownLeft, Store,
  CreditCard, ShoppingCart, Truck, Users2, LogOut,
  Menu, Bell, Search, Settings2, Cpu, Command
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutGrid },
  { name: 'Sản phẩm', href: '/products', icon: Box },
  { name: 'Kho hàng', href: '/inventory', icon: Store },
  { name: 'Nhập hàng', href: '/inbound', icon: ArrowDownLeft },
  { name: 'Bán hàng', href: '/sales', icon: CreditCard },
  { name: 'Mua hàng', href: '/purchasing', icon: ShoppingCart },
  { name: 'Đối tác', href: '/suppliers', icon: Truck },
  { name: 'Khách hàng', href: '/customers', icon: Users2 },
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

        {/* Nav */}
        <p className="sidebar-section-label">Hệ thống</p>
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
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
        </nav>

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