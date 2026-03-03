import { useState } from 'react';
import {
  TrendingUp, ShoppingCart, Package, Users,
  Activity, ArrowUpRight, ArrowDownRight, LayoutGrid,
  Zap, Sparkles, BarChart3, LineChart, Box
} from 'lucide-react';

const BARS = [
  { h: 40, label: 'Phase 01', val: '60.0k' },
  { h: 65, label: 'Phase 02', val: '97.5k' },
  { h: 30, label: 'Phase 03', val: '45.0k' },
  { h: 85, label: 'Phase 04', val: '127.5k' },
  { h: 55, label: 'Phase 05', val: '82.5k' },
  { h: 75, label: 'Phase 06', val: '112.5k' },
  { h: 100, label: 'Phase 07', val: '150.0k' },
];

const STATS = [
  { title: 'Doanh thu ròng', val: '24,500K', unit: 'VNĐ', change: '+12.5%', trend: 'up', icon: TrendingUp, color: 'emerald' },
  { title: 'Lưu lượng đơn', val: '1,284', unit: 'BILL', change: '+8%', trend: 'up', icon: ShoppingCart, color: 'indigo' },
  { title: 'Filling Rate', val: '92.4%', unit: 'AVG', change: '-2.1%', trend: 'down', icon: Package, color: 'purple' },
  { title: 'Active CRM', val: '402', unit: 'USER', change: '+15%', trend: 'up', icon: Users, color: 'blue' },
];

const FEED = [
  { user: 'Admin Hub', action: 'Duyệt lệnh Inbound #INB-743', time: '2m ago', color: 'indigo', icon: Box },
  { user: 'POS Unit 01', action: 'Hoàn tất Bill #8942 - 1.2M ₫', time: '12m ago', color: 'emerald', icon: ShoppingCart },
  { user: 'Security Bot', action: 'Low stock alert: MK-14 AirPods', time: '45m ago', color: 'rose', icon: Activity },
  { user: 'Warehouse B', action: 'Chốt tồn kho ca 01 - Pass QA', time: '1h ago', color: 'blue', icon: Package },
];

export default function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState('24H');
  const [activeChart, setActiveChart] = useState<'bar' | 'line'>('line');

  return (
    <div className="dash-page">

      {/* Decorative blobs */}
      <div className="dash-blob-tr" />
      <div className="dash-blob-bl" />

      {/* ---- HERO ---- */}
      <div className="dash-hero">
        <div>
          <div className="dash-status-pill">
            <div className="dash-status-ping">
              <span />
              <span />
            </div>
            Celebi Engine Operational
          </div>
          <h1>
            Dữ liệu <span>Hợp nhất</span>
          </h1>
          <p className="dash-hero-sub">
            Hệ thống nạp dữ liệu Real-time. Chào mừng Admin — đây là báo cáo tổng quát về chuỗi cung ứng và hiệu suất kinh doanh.
          </p>
        </div>

        <div className="dash-hero-actions">
          <div className="dash-period-selector">
            {['24H', '7D', '30D', 'ALL'].map((p) => (
              <button
                key={p}
                className={`dash-period-btn${activePeriod === p ? ' active' : ''}`}
                onClick={() => setActivePeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="dash-insight-btn">
            <Sparkles size={14} />
            Insight Analytics
          </button>
        </div>
      </div>

      {/* ---- STAT CARDS ---- */}
      <div className="dash-stats-grid">
        {STATS.map((s, i) => (
          <div key={i} className={`dash-stat-card ${s.color}`}>
            <div className="dash-stat-top">
              <div className={`dash-stat-icon ${s.color}`}>
                <s.icon size={22} />
              </div>
              <span className={`dash-stat-badge ${s.trend}`}>
                {s.trend === 'up'
                  ? <ArrowUpRight size={11} />
                  : <ArrowDownRight size={11} />
                }
                {s.change}
              </span>
            </div>
            <div className="dash-stat-bottom">
              <p className="dash-stat-title">{s.title}</p>
              <div className="dash-stat-value-row">
                <span className="dash-stat-value">{s.val}</span>
                <span className="dash-stat-unit">{s.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- MID SECTION ---- */}
      <div className="dash-mid-grid">

        {/* Chart */}
        <div className="dash-chart-card">
          <div className="dash-chart-header">
            <div>
              <h2>Supply Chain Performance</h2>
              <p>Weekly Operational Activity Index</p>
            </div>
            <div className="dash-chart-btns">
              <button
                className={`dash-chart-type-btn${activeChart === 'bar' ? ' active' : ''}`}
                onClick={() => setActiveChart('bar')}
              >
                <BarChart3 size={18} />
              </button>
              <button
                className={`dash-chart-type-btn${activeChart === 'line' ? ' active' : ''}`}
                onClick={() => setActiveChart('line')}
              >
                <LineChart size={18} />
              </button>
            </div>
          </div>

          <div className="dash-chart-body">
            {BARS.map((b, i) => (
              <div key={i} className="dash-bar-col">
                <div className="dash-bar-tooltip">{b.val} Trans.</div>
                <div
                  className="dash-bar"
                  style={{ height: `${b.h}%` }}
                />
                <span className="dash-bar-label">{b.label}</span>
              </div>
            ))}
            <div className="dash-chart-fade" />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="dash-feed-card">
          <div className="dash-feed-header">
            <div className="dash-feed-title-group">
              <div className="dash-feed-icon">
                <Zap size={20} />
              </div>
              <div>
                <p className="dash-feed-title">Phản hồi Giao dịch</p>
                <p className="dash-feed-subtitle">Live Feed · All Terminals</p>
              </div>
            </div>
            <button className="dash-feed-grid-btn">
              <LayoutGrid size={18} />
            </button>
          </div>

          <div className="dash-feed-list">
            {FEED.map((log, i) => (
              <div key={i} className="dash-feed-item">
                <div className={`dash-feed-item-icon ${log.color}`}>
                  <log.icon size={18} />
                </div>
                <div className="dash-feed-item-body">
                  <div className="dash-feed-item-row">
                    <span className="dash-feed-item-user">{log.user}</span>
                    <span className="dash-feed-item-time">{log.time}</span>
                  </div>
                  <p className="dash-feed-item-action">{log.action}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="dash-feed-all-btn">
            Truy cập Toàn bộ Nhật ký
          </button>
        </div>

      </div>

    </div>
  );
}
