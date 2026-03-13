import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings, ArrowRight, Play, CheckCircle, Database,
  Package, TrendingUp, Loader2, Activity, RefreshCw, Terminal,
  Clock, Upload
} from 'lucide-react';

// Auto-detect API URL for LAN access
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;

  // Automatically replace localhost with actual LAN IP if accessed via network
  if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return envUrl.replace(/localhost|127\.0\.0\.1/, hostname);
    }
  }

  // Use env variable if explicitly set
  if (envUrl) return envUrl;

  // Fallback
  const port = 6868;
  return `http://${hostname}:${port}/api/v1`;
};

const API_BASE = getApiBaseUrl();
  console.log('⚙️ API quản trị:', API_BASE);

export default function AdminOpsPage() {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Get token for API calls
  const getAuthHeaders = async () => {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@celebi.com',
        password: 'Admin@123'
      })
    });
    const { accessToken } = await loginResponse.json();
    return { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  };

  // Get system stats
  const { data: systemStats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const [inbound, inventory, products, warehouses] = await Promise.all([
        fetch(`${API_BASE}/inbound/requests`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/inventory/stock-levels`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/products`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/warehouses`, { headers }).then(r => r.json())
      ]);

      return {
        inboundTotal: inbound.pagination?.total || 0,
        inboundInProgress: inbound.data?.filter((i: any) => i.status === 'IN_PROGRESS').length || 0,
        inventoryItems: inventory?.length || 0,
        productsTotal: products.meta?.total || 0,
        warehousesTotal: warehouses.meta?.total || 0
      };
    }
  });

  // Simulate complete inbound process
  const completeInboundMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      addLog('Bắt đầu luồng Hoàn tất nhập kho → Tồn kho...');

      const headers = await getAuthHeaders();

      // 1. Get IN_PROGRESS inbound requests
      addLog('🔍 Tìm yêu cầu nhập kho IN_PROGRESS...');
      const inboundResponse = await fetch(`${API_BASE}/inbound/requests`, { headers });
      const inboundData = await inboundResponse.json();
      const inProgressRequests = inboundData.data?.filter((req: any) => req.status === 'IN_PROGRESS') || [];

      if (inProgressRequests.length === 0) {
        addLog('❌ Không có yêu cầu nhập kho IN_PROGRESS nào');
        return;
      }

      const targetRequest = inProgressRequests[0];
      addLog(`✅ Tìm thấy yêu cầu: ${targetRequest.code} với ${targetRequest.items.length} thiết bị`);

      // 2. Complete the first item manually (simulate receiving process)
      if (targetRequest.items.length > 0) {
        const firstItem = targetRequest.items[0];
        addLog(`📦 Đang hoàn tất thiết bị: ${firstItem.modelName}...`);

        try {
          const completeData = {
            inboundRequestId: targetRequest.id,
            items: [{
              inboundItemId: firstItem.id,
              serialNumber: `SN${Date.now().toString().slice(-6)}`,
              condition: 'Tốt',
              purchasePrice: 15000000,
              binLocation: 'A-01-01',
              notes: 'Hoàn tất qua bảng điều khiển quản trị'
            }],
            notes: 'Mô phỏng hoàn tất để kiểm thử luồng'
          };

          addLog('📡 Gửi yêu cầu Hoàn tất nhập kho...');
          const completeResponse = await fetch(`${API_BASE}/inbound/complete`, {
            method: 'POST',
            headers,
            body: JSON.stringify(completeData)
          });

          if (completeResponse.ok) {
            await completeResponse.json();
            addLog(`✅ Thành công! Thiết bị đã được nhận`);
            addLog(`📊 Serial đã được tạo với trạng thái: AVAILABLE`);
          } else {
            const error = await completeResponse.text();
            addLog(`❌ Lỗi hoàn tất nhập kho: ${error}`);
            throw new Error(error);
          }

        } catch (error: any) {
        addLog(`❌ Ngoại lệ: ${error.message}`);
        throw error;
      }
    }

      addLog('🔄 Làm mới thống kê...');
      await refetchStats();
      addLog('✨ Hoàn tất luồng!');
    },
    onSettled: () => {
      setIsProcessing(false);
      queryClient.invalidateQueries();
    }
  });

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <Terminal size={11} />
            Vận hành Super Admin
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Quản trị <span>Điều khiển</span></h1>
          <p className="page-desc">
            Quản lý hệ thống, gỡ lỗi luồng và mô phỏng dữ liệu để kiểm thử.
          </p>
        </div>
      </div>

      {/* System Stats */}
      <div className="page-stats-grid">
        {[
          { label: 'Yêu cầu nhập kho', value: systemStats?.inboundTotal || 0, icon: Upload, color: 'blue', suffix: 'tổng' },
          { label: 'Đang xử lý', value: systemStats?.inboundInProgress || 0, icon: Clock, color: 'amber', suffix: 'chờ' },
          { label: 'Thiết bị tồn kho', value: systemStats?.inventoryItems || 0, icon: Package, color: 'emerald', suffix: 'tồn kho' },
          { label: 'Kho hàng', value: systemStats?.warehousesTotal || 0, icon: Database, color: 'purple', suffix: 'đang hoạt động' },
        ].map((s) => (
          <div key={s.label} className="page-stat-card">
            <div className={`page-stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div>
              <p className="page-stat-label">{s.label}</p>
              <p className="page-stat-value">{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.suffix}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Workflow Simulator */}
        <div className="table-card">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '3rem', height: '3rem', background: '#4f46e5', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Settings size={20} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  Mô phỏng luồng
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Test luồng nhập kho → tồn kho
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Steps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>1. Tìm yêu cầu IN_PROGRESS</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Lấy yêu cầu và thiết bị chưa nhận</p>
                </div>
                <ArrowRight size={16} style={{ color: '#94a3b8' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <Activity size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>2. Hoàn tất thiết bị</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Gán serial, tình trạng, giá</p>
                </div>
                <ArrowRight size={16} style={{ color: '#94a3b8' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <TrendingUp size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>3. Tạo tồn kho</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Serial → Mức tồn</p>
                </div>
              </div>

              <button
                className="btn-submit"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isProcessing}
                onClick={() => completeInboundMutation.mutate()}
              >
                {isProcessing ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  <><Play size={16} /> Chạy luồng</>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="table-card">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', background: '#0f172a', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <Terminal size={16} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem' }}>Nhật ký hệ thống</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{logs.length} dòng</p>
                </div>
              </div>
              <button
                style={{ padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setLogs([])}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div style={{
              background: '#0f172a',
              borderRadius: '0.75rem',
              padding: '1rem',
              minHeight: '16rem',
              maxHeight: '20rem',
              overflowY: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace'
            }}>
              {logs.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                  Chưa có nhật ký nào. Chạy luồng để xem nhật ký.
                </p>
              ) : logs.map((log, index) => (
                <div key={index} style={{
                  color: log.includes('❌') ? '#ef4444' : log.includes('✅') ? '#10b981' : log.includes('📦') ? '#3b82f6' : '#e5e7eb',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  marginBottom: '0.25rem'
                }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
