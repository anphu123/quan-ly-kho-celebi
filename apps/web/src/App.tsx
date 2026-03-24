import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from './stores/auth.store';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages - Nên dùng Lazy Load để tối ưu Performance (UX)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const SalesPage = lazy(() => import('./pages/sales/SalesPage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const PurchasingPage = lazy(() => import('./pages/purchasing/PurchasingPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const WarehousesPage = lazy(() => import('./pages/warehouses/WarehousesPage'));
const WarehouseDetailPage = lazy(() => import('./pages/warehouses/WarehouseDetailPage'));
const InboundPage = lazy(() => import('./pages/inbound/InboundPage'));
const CreateInboundPage = lazy(() => import('./pages/inbound/CreateInboundPage'));
const InboundDetailPage = lazy(() => import('./pages/inbound/InboundDetailPage'));
const POSPage = lazy(() => import('./pages/pos/POSPage'));
const OutboundPage = lazy(() => import('./pages/outbound/OutboundPage'));
const CreateOutboundPage = lazy(() => import('./pages/outbound/CreateOutboundPage'));
const AdminOpsPage = lazy(() => import('./pages/admin/AdminOpsPage'));
const TradeInXiaomiPage = lazy(() => import('./pages/trade-in/TradeInXiaomiPage'));
const CreateTradeInPage = lazy(() => import('./pages/trade-in/CreateTradeInPage'));
const CreateSingleTradeInPage = lazy(() => import('./pages/trade-in/CreateSingleTradeInPage'));
const TradeInDetailPage = lazy(() => import('./pages/trade-in/TradeInDetailPage'));
const StockLevelsPage = lazy(() => import('./pages/stock/StockLevelsPage'));
const CategoriesPage = lazy(() => import('./features/categories/CategoriesPage'));
const BrandsPage = lazy(() => import('./features/brands/BrandsPage'));
const ProductTemplatesPage = lazy(() => import('./pages/products/ProductTemplatesPage'));

// --- Route Guards ---
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  // Trong thực tế, nên kiểm tra thêm token expire tại đây
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'SUPER_ADMIN' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

// Loading Component cho Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes với MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Index & Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Core Modules */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="purchasing" element={<PurchasingPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />

          {/* Warehouse Management */}
          <Route path="warehouses">
            <Route index element={<WarehousesPage />} />
            <Route path=":id" element={<WarehouseDetailPage />} />
          </Route>

          <Route path="stock/levels" element={<StockLevelsPage />} />

          {/* Master Data Management */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="product-templates" element={<ProductTemplatesPage />} />

          {/* Inbound Ops */}
          <Route path="inbound">
            <Route index element={<InboundPage />} />
            <Route path="new" element={<CreateInboundPage />} />
            <Route path=":id" element={<InboundDetailPage />} />
          </Route>

          {/* Outbound Ops */}
          <Route path="outbound">
            <Route index element={<OutboundPage />} />
            <Route path="new" element={<CreateOutboundPage />} />
          </Route>

          {/* Trade-in Module */}
          <Route path="trade-in-xiaomi">
            <Route index element={<TradeInXiaomiPage />} />
            <Route path="create" element={<CreateTradeInPage />} />
            <Route path="create-single" element={<CreateSingleTradeInPage />} />
            <Route path=":id" element={<TradeInDetailPage />} />
            {/* <Route path="/trade-in-xiaomi/:id" element={<TradeInDetailPage />} /> */}
          </Route>

          {/* Admin Restricted */}
          <Route 
            path="admin-ops" 
            element={
              <SuperAdminRoute>
                <AdminOpsPage />
              </SuperAdminRoute>
            } 
          />
        </Route>

        {/* POS - Full screen (Vẫn cần Auth) */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POSPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;