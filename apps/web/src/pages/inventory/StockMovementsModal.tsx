import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  FileText,
  Package,
  Warehouse,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  History,
  Clock,
  ArrowRight
} from 'lucide-react';
import { inventoryApi } from '../../lib/api/inventory.api';

interface StockMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  warehouseId?: string;
}

export default function StockMovementsModal({
  isOpen,
  onClose,
  productId,
  warehouseId
}: StockMovementsModalProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: movementsData, isLoading, refetch } = useQuery({
    queryKey: ['inventory', 'stock-movements', { productId, warehouseId, page, limit }],
    queryFn: () => (inventoryApi as any).getStockMovements({ productId, warehouseId, page, limit }),
    enabled: isOpen,
  });

  useEffect(() => {
    setPage(1);
  }, [productId, warehouseId]);

  if (!isOpen) return null;

  const movements = movementsData?.data || [];
  const meta = movementsData?.meta;

  const getMovementDisplay = (movement: any) => {
    switch (movement.type) {
      case 'IN':
        return {
          icon: TrendingUp,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          label: 'Nhập kho',
          sign: '▲'
        };
      case 'OUT':
        return {
          icon: TrendingDown,
          color: 'text-rose-500',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/20',
          label: 'Xuất kho',
          sign: '▼'
        };
      case 'ADJUSTMENT':
        return {
          icon: RotateCcw,
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-500/10',
          borderColor: 'border-indigo-500/20',
          label: 'Hiệu chuẩn',
          sign: movement.quantity > movement.previousQuantity ? '▲' : '▼'
        };
      case 'TRANSFER':
        return {
          icon: ArrowUpDown,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          label: 'Điều chuyển',
          sign: '◆'
        };
      default:
        return {
          icon: FileText,
          color: 'text-slate-500',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20',
          label: movement.type,
          sign: '•'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slide-up border border-slate-200 flex flex-col relative">

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header Section */}
        <div className="relative sticky top-0 bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-10 py-10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <History className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-[1000] text-slate-900 tracking-tight leading-none">Nhật ký Biến động</h2>
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] italic">Sổ thông minh biến động</p>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                {meta && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-full font-black text-[9px] uppercase tracking-widest">
                    <Database className="w-3 h-3" />
                    Tìm thấy {meta.total} dòng
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white transition-all active:scale-95 group"
            >
              <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button onClick={onClose} className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group">
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.3em] animate-pulse">Đang đồng bộ dữ liệu giao dịch...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-fade-in opacity-50">
              <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center">
                <FileText className="w-16 h-16 text-slate-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-[1000] text-slate-900 tracking-tight">Chưa có biến động</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giao dịch xuất nhập kho sẽ hiển thị sau khi khởi tạo lệnh đầu tiên.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {(movements as any[]).map((movement: any, idx: number) => {
                const display = getMovementDisplay(movement);
                const Icon = display.icon;

                return (
                  <div
                    key={movement.id}
                    className="group relative flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 flex-1">
                      {/* Movement Status Card */}
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className={`w-16 h-16 rounded-2xl ${display.bgColor} ${display.borderColor} border flex items-center justify-center transition-all group-hover:scale-110 duration-500`}>
                          <Icon className={`w-8 h-8 ${display.color}`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${display.color}`}>{display.label}</span>
                      </div>

                      {/* Movement Core Data */}
                      <div className="space-y-5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {new Date(movement.createdAt).toLocaleDateString('vi-VN')} {new Date(movement.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                            <Warehouse className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{movement.warehouse.name}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Nhận diện tài sản</p>
                            <h3 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors truncate">{movement.product.name}</h3>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px] font-black text-slate-600 tracking-widest">{movement.product.sku}</span>
                          </div>
                        </div>

                        {/* Reason / Notes Context */}
                        {(movement.reason || movement.notes) && (
                          <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            {movement.reason && (
                              <div className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                <Database className="w-4 h-4 text-indigo-400 opacity-50" />
                                <p className="text-xs font-bold text-slate-600 tracking-tight leading-none">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2 opacity-60">Lý do:</span>
                                  {movement.reason}
                                </p>
                              </div>
                            )}
                            {movement.notes && (
                              <div className="flex-1 px-5 py-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                <FileText className="w-4 h-4 text-emerald-500 opacity-50" />
                                <p className="text-xs font-bold text-emerald-700 tracking-tight leading-none truncate">
                                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mr-2 opacity-60">Ghi chú xác thực:</span>
                                  {movement.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Flux Representation */}
                    <div className="mt-8 lg:mt-0 lg:pl-10 lg:border-l border-slate-100 text-right flex flex-col justify-center">
                      <div className="flex items-baseline justify-end gap-3 mb-2">
                        <span className={`text-[12px] font-black ${display.color}`}>{display.sign}</span>
                        <p className={`text-4xl font-[1000] tracking-tighter leading-none ${display.color}`}>
                          {Math.abs(movement.quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-300 uppercase italic">
                        <span>{movement.previousQuantity.toLocaleString()}</span>
                        <ArrowRight className="w-3 h-3 text-slate-200" />
                        <span className="text-slate-900">{movement.newQuantity.toLocaleString()}</span>
                      </div>
                      {movement.createdBy && (
                        <div className="mt-4 flex items-center justify-end gap-2 group/user cursor-help">
                          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[9px] font-black italic">
                            {movement.createdBy.fullName?.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/user:text-slate-900 transition-colors">{movement.createdBy.fullName}</span>
                        </div>
                      )}
                    </div>

                    {/* Lateral Scanline Deco */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover:h-1/2 bg-indigo-500 transition-all duration-700 rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cinematic Pagination Control */}
        {meta && meta.totalPages > 1 && (
          <div className="relative sticky bottom-0 bg-white/70 backdrop-blur-3xl border-t border-slate-100 px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 z-10 shrink-0">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
              <Database className="w-4 h-4 opacity-50" />
              Hiển thị {((page - 1) * limit) + 1} — {Math.min(page * limit, meta.total)} trên {meta.total}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-14 h-14 rounded-[1.25rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed group"
              >
                <ChevronLeft className="w-6 h-6 group-active:-translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-2 px-3 py-3 bg-slate-50 rounded-[1.5rem] border border-slate-200">
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-black text-[11px] transition-all ${page === pageNum
                        ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20'
                        : 'text-slate-500 hover:text-indigo-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="w-14 h-14 rounded-[1.25rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed group"
              >
                <ChevronRight className="w-6 h-6 group-active:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
