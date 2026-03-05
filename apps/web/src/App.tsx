import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SalesPage from './pages/sales/SalesPage';
import CustomersPage from './pages/customers/CustomersPage';
import PurchasingPage from './pages/purchasing/PurchasingPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import WarehousesPage from './pages/warehouses/WarehousesPage';
import WarehouseDetailPage from './pages/warehouses/WarehouseDetailPage';
import InboundPage from './pages/inbound/InboundPage';
import CreateInboundPage from './pages/inbound/CreateInboundPage';
import InboundDetailPage from './pages/inbound/InboundDetailPage';
import POSPage from './pages/pos/POSPage';
import OutboundPage from './pages/outbound/OutboundPage';
import CreateOutboundPage from './pages/outbound/CreateOutboundPage';
import AdminOpsPage from './pages/admin/AdminOpsPage';
import TradeInXiaomiPage from './pages/trade-in/TradeInXiaomiPage';
import CreateTradeInPage from './pages/trade-in/CreateTradeInPage';
import CreateSingleTradeInPage from './pages/trade-in/CreateSingleTradeInPage';
import TradeInDetailPage from './pages/trade-in/TradeInDetailPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'SUPER_ADMIN' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}



function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="purchasing" element={<PurchasingPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="warehouses/:id" element={<WarehouseDetailPage />} />
        <Route path="inbound" element={<InboundPage />} />
        <Route path="inbound/new" element={<CreateInboundPage />} />
        <Route path="inbound/:id" element={<InboundDetailPage />} />
        <Route path="outbound" element={<OutboundPage />} />
        <Route path="outbound/new" element={<CreateOutboundPage />} />
        <Route path="trade-in-xiaomi" element={<TradeInXiaomiPage />} />
        <Route path="trade-in-xiaomi/create" element={<CreateTradeInPage />} />
        <Route path="trade-in-xiaomi/create-single" element={<CreateSingleTradeInPage />} />
        <Route path="trade-in-xiaomi/:id" element={<TradeInDetailPage />} />
        <Route path="admin-ops" element={<SuperAdminRoute><AdminOpsPage /></SuperAdminRoute>} />

      </Route>

      {/* POS - Full screen */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

