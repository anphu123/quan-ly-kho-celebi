import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, Warehouse, TrendingDown } from 'lucide-react';
import { inventoryApi } from '../../lib/api/inventory.api';

export default function LowStockAlert() {
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryApi.getLowStockProducts(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="card border-amber-200 bg-amber-50">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full"></div>
            <span className="text-amber-800 font-medium">Đang kiểm tra cảnh báo...</span>
          </div>
        </div>
      </div>
    );
  }

  if (lowStockProducts.length === 0) {
    return (
      <div className="card border-green-200 bg-green-50">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-green-800 font-medium">Tình trạng tồn kho ổn định</span>
          </div>
          <p className="text-green-700 text-sm">
            Tất cả sản phẩm đều có lượng tồn kho đủ theo tiêu chuẩn đã thiết lập.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-red-200 bg-red-50">
      <div className="card-header bg-red-100 border-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-800">
            Cảnh báo tồn kho thấp ({lowStockProducts.length} sản phẩm)
          </h3>
        </div>
      </div>
      
      <div className="card-body max-h-64 overflow-y-auto">
        <div className="space-y-3">
          {lowStockProducts.map((item) => (
            <div 
              key={`${item.productId}-${item.warehouseId}`}
              className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="w-4 h-4 text-red-600" />
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {item.product.name}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>SKU: {item.product.sku}</span>
                    <div className="flex items-center gap-1">
                      <Warehouse className="w-3 h-3" />
                      <span>{item.warehouse.name}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-600">
                    {item.availableQuantity} {item.product.baseUnit.symbol}
                  </span>
                </div>
                <div className="text-xs text-red-500">
                  Tối thiểu: {item.minStockLevel} {item.product.baseUnit.symbol}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-red-200">
          <button className="btn btn-danger btn-sm">
            <AlertTriangle className="w-4 h-4" />
            Tạo đề xuất nhập hàng
          </button>
        </div>
      </div>
    </div>
  );
}